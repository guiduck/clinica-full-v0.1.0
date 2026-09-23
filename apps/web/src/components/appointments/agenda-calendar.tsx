"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { syncUpcomingAppointmentsAction } from "@/actions/integrations";
import { getClinicalSessionContextAction } from "@/actions/clinical";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Ban,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import {
  createAppointmentAction,
  cancelAppointmentAction,
  updateAppointmentAction,
  finishAppointmentSessionAction,
  startAppointmentSessionAction,
  type AppointmentActionState,
} from "@/actions/appointments";
import { AppointmentTimeSelect } from "@/components/appointments/appointment-time-select";
import { AgendaPeriodCards } from "@/components/appointments/agenda-list";
import { AppointmentStatusBadge } from "@/components/appointmentStatusBadge";
import { useAppointmentComposer } from "@/components/appointmentComposer";
import { DatePickerInput } from "@/components/datePicker";
import { keepOrAdvanceAppointmentEnd } from "@/components/appointments/appointment-time-options";
import {
  agendaDateKey,
  agendaHeaderTitle,
  agendaVisibleDays,
  appointmentsForAgendaPeriod,
  appointmentGridPosition,
  isSameAgendaDay,
  shiftAgendaReferenceDate,
  type AgendaView,
} from "@/components/appointments/agenda-calendar-model";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { DiscardConfirmation } from "@/components/feedback/discard-confirmation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { appointmentStatusStyle } from "@/constants/appointment-status";
import { useDiscardConfirmation } from "@/hooks/use-discard-confirmation";
import { brazilianAppointmentDateTime } from "@/utils/appointment-datetime";
import {
  formatBrazilianDate,
  formatTime24,
} from "@/utils/formatters";

type PatientOption = {
  id: string;
  name: string;
  hasCompleteFinancialProfile: boolean;
};
type AppointmentView = {
  id: string;
  patientId: string;
  patientName: string;
  startsAt: string;
  endsAt: string;
  status: string;
  type: string;
  videoUrl: string | null;
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
};
type ClinicalSessionContext = {
  anamnesis: Record<string, Record<string, string> | undefined>;
  evolutions: Array<{ id: string; occurredAt: string; mood: number; free: string; assessment: string }>;
};
const initialAction: AppointmentActionState = { ok: false, message: "" };
const unavailable = {
  key: "agenda.mutation",
  mode: "unavailable",
  title: "Ação ainda não disponível",
  message:
    "Este controle reproduz o fluxo do protótipo, mas a alteração final depende do service de agenda. Nenhum agendamento foi modificado.",
  affectedAction: "mutate",
} as const;
const hours = Array.from({ length: 24 }, (_, index) => index);

export function AgendaCalendar({
  patients,
  appointments,
  initialView = "semana",
  initialDate,
  initialOpen,
  defaultPatientId,
  whatsappConfigured = false,
  googleCalendarConnected = false,
}: {
  patients: PatientOption[];
  appointments: AppointmentView[];
  initialView?: AgendaView;
  initialDate?: string;
  initialOpen?: string;
  defaultPatientId?: string;
  whatsappConfigured?: boolean;
  googleCalendarConnected?: boolean;
}) {
  const router = useRouter();
  const { openAppointmentComposer } = useAppointmentComposer();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = React.useState<AgendaView>(initialView);
  const [referenceDate, setReferenceDate] = React.useState(() =>
    initialDate ? new Date(`${initialDate}T12:00:00`) : new Date(),
  );
  const [editing, setEditing] = React.useState<AppointmentView | null>(null);
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<AppointmentView | null>(
    () => appointments.find((item) => item.id === initialOpen) ?? null,
  );
  const [session, setSession] = React.useState<AppointmentView | null>(null);
  const [canceling, setCanceling] = React.useState<AppointmentView | null>(null);
  const [syncPending, startSync] = React.useTransition();
  React.useEffect(() => {
    if (initialOpen === "1") openAppointmentComposer({ patientId: defaultPatientId });
  }, [defaultPatientId, initialOpen, openAppointmentComposer]);
  const syncCalendar = () => startSync(async () => {
    const result = await syncUpcomingAppointmentsAction();
    if (!result.ok) { toast.error(result.message); return; }
    toast.message(`${result.synced} consulta(s) atualizada(s) no Google Agenda.${result.failed ? ` ${result.failed} falharam; confira a conexão.` : ""}`);
    router.refresh();
  });
  const updateAgendaQuery = React.useCallback((nextDate: Date, nextView: AgendaView) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("view", nextView);
    next.set("date", agendaDateKey(nextDate));
    next.delete("open");
    next.delete("new");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);
  const navigatePeriod = (direction: -1 | 1) => {
    const nextDate = shiftAgendaReferenceDate(referenceDate, view, direction);
    setReferenceDate(nextDate);
    updateAgendaQuery(nextDate, view);
  };
  const goToday = () => {
    const today = new Date();
    setReferenceDate(today);
    updateAgendaQuery(today, view);
  };
  const changeView = (nextView: AgendaView) => {
    setView(nextView);
    updateAgendaQuery(referenceDate, nextView);
  };
  const periodAppointments = appointmentsForAgendaPeriod(
    appointments,
    referenceDate,
    view,
  );
  return (
    <main className="app-page space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="mt-1 text-muted-foreground">
            Sua agenda clínica completa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBlockOpen(true)}>
            <Ban className="size-4" />
            Bloquear horário
          </Button>
          <Button onClick={() => openAppointmentComposer()}>
            <Plus className="size-4" />
            Novo agendamento
          </Button>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
        <span>{googleCalendarConnected ? "Google Agenda conectado. Consultas novas são sincronizadas após o salvamento." : "Google Agenda não conectado. As consultas ficam salvas apenas aqui até você autorizar a integração."}</span>
        {googleCalendarConnected
          ? <Button variant="outline" size="sm" disabled={syncPending} onClick={syncCalendar}>{syncPending ? "Atualizando..." : "Atualizar Google Agenda"}</Button>
          : <Button asChild variant="outline" size="sm"><Link href="/configuracoes?tab=seguranca">Conectar Google Agenda</Link></Button>}
      </div>
      <section className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigatePeriod(-1)}
              aria-label="Período anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={goToday}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigatePeriod(1)}
              aria-label="Próximo período"
            >
              <ChevronRight className="size-4" />
            </Button>
            <h2 className="ml-2 font-semibold capitalize">
              {agendaHeaderTitle(referenceDate, view)}
            </h2>
          </div>
          <Tabs
            value={view}
            onValueChange={(value) => changeView(value as AgendaView)}
          >
            <TabsList>
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
              <TabsTrigger value="mes">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {view === "mes" ? (
          <MonthView
            referenceDate={referenceDate}
            appointments={appointments}
            onSelect={setSelected}
          />
        ) : (
          <TimeGrid
            view={view}
            referenceDate={referenceDate}
            appointments={appointments}
            onSelect={setSelected}
          />
        )}
      </section>
      <AgendaPeriodCards
        appointments={periodAppointments}
        view={view}
        onSelect={setSelected}
        onEdit={setEditing}
        onCancel={setCanceling}
      />
      {editing && (
        <NewAppointmentDialog
          key={editing.id}
          open
          onOpenChange={(value) => { if (!value) setEditing(null); }}
          patients={patients}
          editing={editing}
          whatsappConfigured={whatsappConfigured}
        />
      )}
      <CapabilityNotice
        descriptor={unavailable}
        open={blockOpen}
        onOpenChange={setBlockOpen}
      />
      <AppointmentDetails
        appointment={selected}
        onOpenChange={(value) => {
          if (!value) setSelected(null);
        }}
        onStart={(appointment) => setSession(appointment)}
        onEdit={(appointment) => { setSelected(null); setEditing(appointment); }}
        onCancel={(appointment) => { setSelected(null); setCanceling(appointment); }}
      />
      <CancelAppointmentDialog
        appointment={canceling}
        onOpenChange={(open) => {
          if (!open) setCanceling(null);
        }}
      />
      <SessionDialog
        appointment={session}
        onOpenChange={(value) => {
          if (!value) setSession(null);
        }}
      />
    </main>
  );
}

function TimeGrid({
  view,
  referenceDate,
  appointments,
  onSelect,
}: {
  view: "dia" | "semana";
  referenceDate: Date;
  appointments: AppointmentView[];
  onSelect: (item: AppointmentView) => void;
}) {
  const days = agendaVisibleDays(referenceDate, view);
  return (
    <div className="max-h-[calc(100dvh-14rem)] overflow-auto">
      <div className="min-w-[760px]">
        <div
          className="sticky top-0 z-10 grid border-b bg-card"
          style={{
            gridTemplateColumns: `60px repeat(${days.length}, minmax(130px, 1fr))`,
          }}
        >
          <div />
          {days.map((day) => (
            <div
              key={agendaDateKey(day)}
              className={cn(
                "border-l p-3 text-center",
                isSameAgendaDay(day, new Date()) && "bg-primary/5",
              )}
            >
              <p className="text-xs capitalize text-muted-foreground">
                {new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(
                  day,
                )}
              </p>
              <p className="text-lg font-semibold">{day.getDate()}</p>
            </div>
          ))}
        </div>
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `60px repeat(${days.length}, minmax(130px, 1fr))`,
          }}
        >
          <div>
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b pr-2 pt-1 text-right text-xs text-muted-foreground"
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div
              key={agendaDateKey(day)}
              className={cn(
                "relative border-l",
                isSameAgendaDay(day, new Date()) && "bg-primary/[0.025]",
              )}
            >
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b" />
              ))}
              {appointments
                .filter((item) => isSameAgendaDay(item.startsAt, day))
                .map((item) => {
                  const { top, height } = appointmentGridPosition(
                    item.startsAt,
                    item.endsAt,
                  );
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className={cn(
                        "absolute inset-x-1 z-10 overflow-hidden rounded-md border-l-2 px-2 py-1 text-left text-xs hover:opacity-85",
                        appointmentStatusStyle(item.status),
                      )}
                      style={{ top, height }}
                    >
                      <b className="block truncate text-foreground">
                        {item.patientName}
                      </b>
                      <span>
                        {formatTime24(item.startsAt)}–
                        {formatTime24(item.endsAt)}
                      </span>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView({
  referenceDate,
  appointments,
  onSelect,
}: {
  referenceDate: Date;
  appointments: AppointmentView[];
  onSelect: (item: AppointmentView) => void;
}) {
  const days = agendaVisibleDays(referenceDate, "mes");
  return (
    <div className="grid grid-cols-7 border-t">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => (
        <div
          key={label}
          className="border-b border-r p-2 text-center text-xs font-medium text-muted-foreground"
        >
          {label}
        </div>
      ))}
      {days.map((day) => (
        <div
          key={agendaDateKey(day)}
          className={cn(
            "min-h-28 border-b border-r p-2",
            day.getMonth() !== referenceDate.getMonth() &&
              "bg-muted/20 text-muted-foreground",
          )}
        >
          <p
            className={cn(
              "mb-1 grid size-6 place-items-center rounded-full text-xs",
              isSameAgendaDay(day, new Date()) &&
                "bg-primary text-primary-foreground",
            )}
          >
            {day.getDate()}
          </p>
          {appointments
            .filter((item) => isSameAgendaDay(item.startsAt, day))
            .slice(0, 3)
            .map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelect(item)}
                className={cn(
                  "mb-1 block w-full truncate rounded border px-1.5 py-1 text-left text-[11px] hover:opacity-85",
                  appointmentStatusStyle(item.status),
                )}
              >
                {formatTime24(item.startsAt)} {item.patientName}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}

function NewAppointmentDialog({
  open,
  onOpenChange,
  patients,
  defaultPatientId,
  editing,
  whatsappConfigured,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: PatientOption[];
  defaultPatientId?: string;
  editing?: AppointmentView;
  whatsappConfigured: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    editing ? updateAppointmentAction : createAppointmentAction,
    initialAction,
  );
  const [patientId, setPatientId] = React.useState(editing?.patientId ?? defaultPatientId ?? "");
  const [date, setDate] = React.useState(formatBrazilianDate(editing?.startsAt ?? new Date()));
  const [start, setStart] = React.useState(editing ? formatTime24(editing.startsAt) : "09:00");
  const [end, setEnd] = React.useState(editing ? formatTime24(editing.endsAt) : "09:50");
  const [type, setType] = React.useState(editing?.type ?? "Sessão individual");
  const [videoUrl, setVideoUrl] = React.useState(editing?.videoUrl ?? "");
  const [recurring, setRecurring] = React.useState(false);
  const selectStart = (value: string) => {
    setStart(value);
    setEnd((current) => keepOrAdvanceAppointmentEnd(value, current));
  };
  React.useEffect(() => {
    if (state.ok) {
      toast.message(state.message);
      onOpenChange(false);
      router.refresh();
    }
  }, [onOpenChange, router, state.ok, state.message]);
  let notificationMessage = "WhatsApp não configurado: a consulta será criada normalmente, mas não terá confirmação nem lembretes automáticos.";
  if (whatsappConfigured) {
    notificationMessage = editing
      ? "Ao alterar o horário, avise o paciente manualmente. Esta edição não envia uma nova mensagem automática."
      : "Tentaremos enviar a confirmação por WhatsApp após salvar a consulta. Confira o resultado.";
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar agendamento" : "Novo agendamento"}</DialogTitle>
          <DialogDescription className="sr-only">
            Crie uma sessão para um paciente
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="grid gap-4">
          {editing && <input type="hidden" name="appointmentId" value={editing.id} />}
          <div>
            <Label htmlFor="appointment-patient">Paciente</Label>
            <Select value={patientId} onValueChange={setPatientId} disabled={Boolean(editing)}>
              <SelectTrigger id="appointment-patient" className="mt-1.5">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                    {patient.hasCompleteFinancialProfile
                      ? ""
                      : " — financeiro pendente"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="patientId" value={patientId} />
          </div>
          <div>
            <Label htmlFor="appointment-type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="appointment-type" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sessão individual">
                  Sessão individual
                </SelectItem>
                <SelectItem value="Primeira consulta">
                  Primeira consulta
                </SelectItem>
                <SelectItem value="Retorno">Retorno</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="type" value={type} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="appointment-date">Data</Label>
              <DatePickerInput
                id="appointment-date"
                value={date}
                onValueChange={setDate}
                aria-label="Data da consulta"
              />
            </div>
            <AppointmentTimeSelect
              id="appointment-start"
              label="Início"
              value={start}
              onValueChange={selectStart}
            />
            <AppointmentTimeSelect
              id="appointment-end"
              label="Fim"
              value={end}
              onValueChange={setEnd}
              minimumExclusive={start}
            />
          </div>
          <input type="hidden" name="startsAt" value={brazilianAppointmentDateTime(date, start)} />
          <input type="hidden" name="endsAt" value={brazilianAppointmentDateTime(date, end)} />
          <div>
            <Label htmlFor="appointment-video-url">
              Link da videochamada (opcional)
            </Label>
            <Input
              id="appointment-video-url"
              className="mt-1.5"
              name="videoUrl"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={recurring}
              onCheckedChange={(value) => setRecurring(value === true)}
              disabled
            />
            Sessão recorrente semanal (ainda não disponível)
          </label>
          <div
            className={cn(
              "rounded-lg border p-3 text-xs",
              whatsappConfigured
                ? "border-primary/20 bg-brand-soft/40 text-muted-foreground"
                : "border-amber-300 bg-amber-50 text-amber-900",
            )}
          >
            {notificationMessage}
          </div>
          {state.message ? (
            <p
              className={cn(
                "text-sm",
                state.ok ? "text-success" : "text-destructive",
              )}
            >
              {state.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {editing ? "Salvar alterações" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentDetails({
  appointment,
  onOpenChange,
  onStart,
  onEdit,
  onCancel,
}: {
  appointment: AppointmentView | null;
  onOpenChange: (open: boolean) => void;
  onStart: (item: AppointmentView) => void;
  onEdit: (item: AppointmentView) => void;
  onCancel: (item: AppointmentView) => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const isFinished = appointment?.status === "realizada" || Boolean(appointment?.sessionEndedAt);
  let sessionButtonLabel = "Iniciar sessão";
  if (isFinished) sessionButtonLabel = "Sessão finalizada";
  else if (pending) sessionButtonLabel = "Iniciando...";
  const start = () => {
    if (!appointment) return;
    setError(null);
    startTransition(async () => {
      const result = await startAppointmentSessionAction(appointment.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onOpenChange(false);
      onStart({ ...appointment, sessionStartedAt: appointment.sessionStartedAt ?? new Date().toISOString() });
    });
  };
  return (
    <Sheet open={Boolean(appointment)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(92vw,24rem)]">
        <SheetHeader>
          <SheetTitle>Detalhes do agendamento</SheetTitle>
          <SheetDescription className="sr-only">
            Ações e informações da sessão
          </SheetDescription>
        </SheetHeader>
        {appointment ? (
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs text-muted-foreground">Paciente</p>
              <p className="text-lg font-semibold">{appointment.patientName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Detail
                label="Data"
                value={formatBrazilianDate(appointment.startsAt)}
              />
              <Detail
                label="Horário"
                value={`${formatTime24(appointment.startsAt)} – ${formatTime24(appointment.endsAt)}`}
              />
              <Detail label="Tipo" value={appointment.type} />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
            </div>
            {appointment.videoUrl ? (
              <Button asChild variant="outline" className="w-full">
                <a href={appointment.videoUrl} target="_blank" rel="noreferrer">
                  <Video className="size-4" />
                  Abrir videochamada
                </a>
              </Button>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={start} disabled={pending || isFinished}>
                <Play className="size-4" />
                {sessionButtonLabel}
              </Button>
              <CapabilityNotice
                descriptor={unavailable}
                trigger={
                  <Button variant="outline">
                    <MessageCircle className="size-4" />
                    Agendar mensagem
                  </Button>
                }
              />
              <Button variant="outline" onClick={() => onEdit(appointment)} disabled={isFinished}>
                <CalendarIcon className="size-4" />
                Remarcar
              </Button>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => onEdit(appointment)} disabled={isFinished}>
                  <Edit3 className="size-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => onCancel(appointment)}
                  disabled={isFinished}
                >
                  <Trash2 className="size-4" />
                  Cancelar consulta
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function CancelAppointmentDialog({
  appointment,
  onOpenChange,
}: {
  appointment: AppointmentView | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const confirm = () => {
    if (!appointment) return;
    startTransition(async () => {
      const result = await cancelAppointmentAction(appointment.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      onOpenChange(false);
      router.refresh();
    });
  };
  return (
    <AlertDialog open={Boolean(appointment)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar esta consulta?</AlertDialogTitle>
          <AlertDialogDescription>
            {appointment
              ? `A consulta de ${appointment.patientName} em ${formatBrazilianDate(appointment.startsAt)} às ${formatTime24(appointment.startsAt)} será cancelada. A receita prevista vinculada também será cancelada.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Manter consulta</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {pending ? "Cancelando..." : "Cancelar consulta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SessionDialog({
  appointment,
  onOpenChange,
}: {
  appointment: AppointmentView | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [mood, setMood] = React.useState([5]);
  const [free, setFree] = React.useState("");
  const [subjective, setSubjective] = React.useState("");
  const [objective, setObjective] = React.useState("");
  const [assessment, setAssessment] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [clinicalContext, setClinicalContext] = React.useState<ClinicalSessionContext | null>(null);
  const [contextPending, startContextTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const discard = useDiscardConfirmation(
    [free, subjective, objective, assessment, plan].some((value) => value.trim().length > 0) || mood[0] !== 5,
  );
  React.useEffect(() => {
    if (!appointment) return;
    startContextTransition(async () => {
      const result = await getClinicalSessionContextAction(appointment.patientId);
      if (result.ok) {
        setClinicalContext(result.data as ClinicalSessionContext);
        return;
      }
      setFeedback(result.message);
    });
  }, [appointment]);
  React.useEffect(() => {
    if (!appointment || paused) return;
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [appointment, paused]);
  React.useEffect(() => {
    if (!appointment) {
      setSeconds(0);
      setPaused(false);
      setMood([5]);
      setFree("");
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
      setClinicalContext(null);
      setFeedback(null);
    }
  }, [appointment]);
  const close = React.useCallback(() => {
    setSeconds(0);
    setPaused(false);
    setMood([5]);
    setFree("");
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
    setClinicalContext(null);
    onOpenChange(false);
  }, [onOpenChange]);
  const requestClose = () => discard.requestDiscard(close);
  const finish = () => {
    if (!appointment) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await finishAppointmentSessionAction(appointment.id, {
        mood: mood[0],
        free,
        subjective,
        objective,
        assessment,
        plan,
      });
      if (!result.ok) {
        setFeedback(result.message);
        return;
      }
      close();
      router.refresh();
    });
  };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <>
      <Dialog
        open={Boolean(appointment)}
        onOpenChange={(next) => {
          if (!next) requestClose();
        }}
      >
        <DialogContent className="max-w-5xl p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-brand-soft/60 p-6">
            <div>
              <p className="text-xs text-muted-foreground">
                Sessão em andamento
              </p>
              <DialogTitle>{appointment?.patientName}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg border bg-card px-3 py-2 font-mono">
                <Clock className="mr-2 inline size-4 text-primary" />
                {time}
              </span>
              <Button
                variant="outline"
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? (
                  <Play className="size-4" />
                ) : (
                  <Pause className="size-4" />
                )}
                {paused ? "Retomar" : "Pausar"}
              </Button>
              <Button onClick={finish} disabled={pending}>
                {pending ? "Finalizando..." : "Finalizar sessão"}
              </Button>
            </div>
          </div>
          <div className="max-h-[calc(100dvh-12rem)] space-y-5 overflow-y-auto p-6">
            <Accordion type="multiple" className="space-y-3">
              <AccordionItem value="anamnesis" className="rounded-lg border px-4">
                <AccordionTrigger className="hover:no-underline">Resumo da anamnese</AccordionTrigger>
                <AccordionContent>
                  {contextPending && <p className="text-muted-foreground">Carregando prontuário...</p>}
                  {!contextPending && clinicalContext && <ClinicalAnamnesisSummary anamnesis={clinicalContext.anamnesis} />}
                  {!contextPending && !clinicalContext && <p className="text-muted-foreground">Nenhuma anamnese disponível.</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div>
              <h3 className="mb-4 font-semibold">Nova evolução</h3>
              <Label>Humor relatado: {mood[0]}/10</Label>
              <Slider
                className="mt-3"
                min={1}
                max={10}
                step={1}
                value={mood}
                onValueChange={setMood}
              />
              {feedback ? <p className="mt-2 text-sm text-destructive">{feedback}</p> : null}
            </div>
            <div>
              <Label htmlFor="session-free-record">Registro livre</Label>
              <Textarea
                id="session-free-record"
                className="mt-1.5 min-h-44"
                value={free}
                onChange={(event) => setFree(event.target.value)}
                placeholder="Anote livremente o que aconteceu na sessão..."
              />
            </div>
            <Accordion type="multiple" className="space-y-3">
              <AccordionItem value="soap" className="rounded-lg border px-4">
                <AccordionTrigger className="hover:no-underline">Registro estruturado (SOAP) — opcional</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ClinicalTextArea id="session-subjective" label="Subjetivo" value={subjective} onValueChange={setSubjective} />
                  <ClinicalTextArea id="session-objective" label="Objetivo" value={objective} onValueChange={setObjective} />
                  <ClinicalTextArea id="session-assessment" label="Avaliação" value={assessment} onValueChange={setAssessment} />
                  <ClinicalTextArea id="session-plan" label="Plano" value={plan} onValueChange={setPlan} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="history" className="rounded-lg border px-4">
                <AccordionTrigger className="hover:no-underline">Histórico de evoluções ({clinicalContext?.evolutions.length ?? 0})</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {clinicalContext?.evolutions.length ? clinicalContext.evolutions.map((evolution) => <div key={evolution.id} className="rounded-md bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{formatBrazilianDate(evolution.occurredAt)} · Humor {evolution.mood}/10</p><p className="mt-1 whitespace-pre-wrap">{evolution.free || evolution.assessment || "Registro SOAP"}</p></div>) : <p className="text-muted-foreground">Nenhuma evolução anterior.</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </DialogContent>
      </Dialog>
      <DiscardConfirmation
        open={discard.open}
        onCancel={discard.cancelDiscard}
        onConfirm={discard.confirmDiscard}
      />
    </>
  );
}
function ClinicalTextArea({ id, label, value, onValueChange }: { id: string; label: string; value: string; onValueChange: (value: string) => void }) {
  return <div><Label htmlFor={id}>{label}</Label><Textarea id={id} className="mt-1.5" value={value} onChange={(event) => onValueChange(event.target.value)} /></div>;
}
function ClinicalAnamnesisSummary({ anamnesis }: { anamnesis: Record<string, Record<string, string> | undefined> }) {
  const values = Object.values(anamnesis).flatMap((section) => Object.values(section ?? {})).filter((value) => value.trim());
  if (!values.length) return <p className="text-muted-foreground">A anamnese ainda não possui conteúdo preenchido.</p>;
  return <ul className="space-y-2">{values.map((value, index) => <li key={`${index}-${value.slice(0, 16)}`} className="rounded-md bg-muted/40 p-3 whitespace-pre-wrap">{value}</li>)}</ul>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
