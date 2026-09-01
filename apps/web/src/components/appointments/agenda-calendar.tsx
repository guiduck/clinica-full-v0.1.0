"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
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
import { createAppointmentAction, type AppointmentActionState } from "@/actions/appointments";
import { AppointmentTimeSelect } from "@/components/appointments/appointment-time-select";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { DiscardConfirmation } from "@/components/feedback/discard-confirmation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDiscardConfirmation } from "@/hooks/use-discard-confirmation";
import { maskBrazilianDate } from "@/utils/masks";
import { formatBrazilianDate, formatStatusLabel, formatTime24 } from "@/utils/formatters";

type PatientOption = { id: string; name: string; hasCompleteFinancialProfile: boolean };
type AppointmentView = { id: string; patientId: string; patientName: string; startsAt: string; endsAt: string; status: string; type: string; videoUrl: string | null };
type View = "dia" | "semana" | "mes";
const initialAction: AppointmentActionState = { ok: false, message: "" };
const unavailable = { key: "agenda.mutation", mode: "unavailable", title: "Ação ainda não disponível", message: "Este controle reproduz o fluxo do protótipo, mas a alteração final depende do service de agenda. Nenhum agendamento foi modificado.", affectedAction: "mutate" } as const;
const hours = Array.from({ length: 24 }, (_, index) => index);
const startOfWeek = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
};
const dateKey = (date: Date | string) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};
const sameDay = (left: Date | string, right: Date | string) => dateKey(left) === dateKey(right);
const addDays = (date: Date, days: number) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };
const headerTitle = (date: Date, view: View) => view === "mes"
  ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
  : view === "dia"
    ? new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(date)
    : new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);

export function AgendaCalendar({ patients, appointments, initialView = "semana", initialDate, initialOpen, defaultPatientId }: {
  patients: PatientOption[];
  appointments: AppointmentView[];
  initialView?: View;
  initialDate?: string;
  initialOpen?: string;
  defaultPatientId?: string;
}) {
  const [view, setView] = React.useState<View>(initialView);
  const [referenceDate, setReferenceDate] = React.useState(() => initialDate ? new Date(`${initialDate}T12:00:00`) : new Date());
  const [newOpen, setNewOpen] = React.useState(initialOpen === "1");
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<AppointmentView | null>(() => appointments.find((item) => item.id === initialOpen) ?? null);
  const [session, setSession] = React.useState<AppointmentView | null>(null);
  const navigatePeriod = (direction: -1 | 1) => setReferenceDate((current) => {
    const next = new Date(current);
    if (view === "mes") next.setMonth(next.getMonth() + direction);
    else next.setDate(next.getDate() + direction * (view === "semana" ? 7 : 1));
    return next;
  });
  return (
    <main className="app-page space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Agenda</h1><p className="mt-1 text-muted-foreground">Sua agenda clínica completa</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => setBlockOpen(true)}><Ban className="size-4" />Bloquear horário</Button><Button onClick={() => setNewOpen(true)}><Plus className="size-4" />Novo agendamento</Button></div></header>
      <section className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5"><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => navigatePeriod(-1)} aria-label="Período anterior"><ChevronLeft className="size-4" /></Button><Button variant="outline" onClick={() => setReferenceDate(new Date())}>Hoje</Button><Button variant="outline" size="icon" onClick={() => navigatePeriod(1)} aria-label="Próximo período"><ChevronRight className="size-4" /></Button><h2 className="ml-2 font-semibold capitalize">{headerTitle(referenceDate, view)}</h2></div><Tabs value={view} onValueChange={(value) => setView(value as View)}><TabsList><TabsTrigger value="dia">Dia</TabsTrigger><TabsTrigger value="semana">Semana</TabsTrigger><TabsTrigger value="mes">Mês</TabsTrigger></TabsList></Tabs></div>
        {view === "mes" ? <MonthView referenceDate={referenceDate} appointments={appointments} onSelect={setSelected} /> : <TimeGrid view={view} referenceDate={referenceDate} appointments={appointments} onSelect={setSelected} />}
      </section>
      <NewAppointmentDialog open={newOpen} onOpenChange={setNewOpen} patients={patients} defaultPatientId={defaultPatientId} />
      <CapabilityNotice descriptor={unavailable} open={blockOpen} onOpenChange={setBlockOpen} />
      <AppointmentDetails appointment={selected} onOpenChange={(value) => { if (!value) setSelected(null); }} onStart={(appointment) => setSession(appointment)} />
      <SessionDialog appointment={session} onOpenChange={(value) => { if (!value) setSession(null); }} />
    </main>
  );
}

function TimeGrid({ view, referenceDate, appointments, onSelect }: { view: "dia" | "semana"; referenceDate: Date; appointments: AppointmentView[]; onSelect: (item: AppointmentView) => void }) {
  const days = view === "dia" ? [referenceDate] : Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(referenceDate), index));
  return <div className="max-h-[calc(100dvh-14rem)] overflow-auto"><div className="min-w-[760px]">
    <div className="sticky top-0 z-10 grid border-b bg-card" style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(130px, 1fr))` }}><div />{days.map((day) => <div key={dateKey(day)} className={cn("border-l p-3 text-center", sameDay(day, new Date()) && "bg-primary/5")}><p className="text-xs capitalize text-muted-foreground">{new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(day)}</p><p className="text-lg font-semibold">{day.getDate()}</p></div>)}</div>
    <div className="relative grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(130px, 1fr))` }}>
      <div>{hours.map((hour) => <div key={hour} className="h-16 border-b pr-2 pt-1 text-right text-xs text-muted-foreground">{String(hour).padStart(2, "0")}:00</div>)}</div>
      {days.map((day) => <div key={dateKey(day)} className={cn("relative border-l", sameDay(day, new Date()) && "bg-primary/[0.025]")}>{hours.map((hour) => <div key={hour} className="h-16 border-b" />)}{appointments.filter((item) => sameDay(item.startsAt, day)).map((item) => {
        const start = new Date(item.startsAt), end = new Date(item.endsAt);
        const top = (start.getHours() * 60 + start.getMinutes()) / 60 * 64;
        const height = Math.max(34, ((end.getTime() - start.getTime()) / 3_600_000) * 64);
        return <button type="button" key={item.id} onClick={() => onSelect(item)} className="absolute inset-x-1 z-10 overflow-hidden rounded-md border-l-2 border-primary bg-primary/15 px-2 py-1 text-left text-xs text-primary hover:bg-primary/25" style={{ top, height }}><b className="block truncate text-foreground">{item.patientName}</b><span>{formatTime24(item.startsAt)}–{formatTime24(item.endsAt)}</span></button>;
      })}</div>)}
    </div>
  </div></div>;
}

function MonthView({ referenceDate, appointments, onSelect }: { referenceDate: Date; appointments: AppointmentView[]; onSelect: (item: AppointmentView) => void }) {
  const first = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  return <div className="grid grid-cols-7 border-t">{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => <div key={label} className="border-b border-r p-2 text-center text-xs font-medium text-muted-foreground">{label}</div>)}{days.map((day) => <div key={dateKey(day)} className={cn("min-h-28 border-b border-r p-2", day.getMonth() !== referenceDate.getMonth() && "bg-muted/20 text-muted-foreground")}><p className={cn("mb-1 grid size-6 place-items-center rounded-full text-xs", sameDay(day, new Date()) && "bg-primary text-primary-foreground")}>{day.getDate()}</p>{appointments.filter((item) => sameDay(item.startsAt, day)).slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => onSelect(item)} className="mb-1 block w-full truncate rounded bg-primary/15 px-1.5 py-1 text-left text-[11px] text-primary">{formatTime24(item.startsAt)} {item.patientName}</button>)}</div>)}</div>;
}

function NewAppointmentDialog({ open, onOpenChange, patients, defaultPatientId }: { open: boolean; onOpenChange: (open: boolean) => void; patients: PatientOption[]; defaultPatientId?: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createAppointmentAction, initialAction);
  const [patientId, setPatientId] = React.useState(defaultPatientId ?? "");
  const [date, setDate] = React.useState(formatBrazilianDate(new Date()));
  const [start, setStart] = React.useState("09:00");
  const [end, setEnd] = React.useState("09:50");
  const [type, setType] = React.useState("Sessão individual");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [recurring, setRecurring] = React.useState(false);
  React.useEffect(() => {
    if (state.ok) {
      onOpenChange(false);
      router.refresh();
    }
  }, [onOpenChange, router, state.ok]);
  const iso = (value: string, time: string) => {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}T${time}`;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Novo agendamento</DialogTitle><DialogDescription className="sr-only">Crie uma sessão para um paciente</DialogDescription></DialogHeader><form action={action} className="grid gap-4"><div><Label htmlFor="appointment-patient">Paciente</Label><Select value={patientId} onValueChange={setPatientId}><SelectTrigger id="appointment-patient" className="mt-1.5"><SelectValue placeholder="Selecione o paciente" /></SelectTrigger><SelectContent>{patients.map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.name}{patient.hasCompleteFinancialProfile ? "" : " — financeiro pendente"}</SelectItem>)}</SelectContent></Select><input type="hidden" name="patientId" value={patientId} /></div><div><Label htmlFor="appointment-type">Tipo</Label><Select value={type} onValueChange={setType}><SelectTrigger id="appointment-type" className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sessão individual">Sessão individual</SelectItem><SelectItem value="Primeira consulta">Primeira consulta</SelectItem><SelectItem value="Retorno">Retorno</SelectItem></SelectContent></Select><input type="hidden" name="type" value={type} /></div><div className="grid gap-3 sm:grid-cols-3"><div><Label htmlFor="appointment-date">Data</Label><Input id="appointment-date" className="mt-1.5" inputMode="numeric" value={date} onChange={(event) => setDate(maskBrazilianDate(event.target.value))} /></div><AppointmentTimeSelect id="appointment-start" label="Início" value={start} onValueChange={setStart} /><AppointmentTimeSelect id="appointment-end" label="Fim" value={end} onValueChange={setEnd} /></div><input type="hidden" name="startsAt" value={iso(date, start)} /><input type="hidden" name="endsAt" value={iso(date, end)} /><div><Label htmlFor="appointment-video-url">Link da videochamada (opcional)</Label><Input id="appointment-video-url" className="mt-1.5" name="videoUrl" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://meet.google.com/..." /></div><label className="flex items-center gap-2 text-sm"><Checkbox checked={recurring} onCheckedChange={(value) => setRecurring(value === true)} />Sessão recorrente semanal (horário fixo)</label><div className="rounded-lg border border-primary/20 bg-brand-soft/40 p-3 text-xs text-muted-foreground">Enviaremos uma confirmação por WhatsApp 48h antes da sessão. O paciente poderá confirmar, cancelar ou remarcar por lá.</div>{state.message ? <p className={cn("text-sm", state.ok ? "text-success" : "text-destructive")}>{state.message}</p> : null}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={pending}>Salvar</Button></DialogFooter></form></DialogContent></Dialog>;
}

function AppointmentDetails({ appointment, onOpenChange, onStart }: { appointment: AppointmentView | null; onOpenChange: (open: boolean) => void; onStart: (item: AppointmentView) => void }) {
  return <Sheet open={Boolean(appointment)} onOpenChange={onOpenChange}><SheetContent side="right" className="w-[min(92vw,24rem)]"><SheetHeader><SheetTitle>Detalhes do agendamento</SheetTitle><SheetDescription className="sr-only">Ações e informações da sessão</SheetDescription></SheetHeader>{appointment ? <div className="mt-6 space-y-5"><div><p className="text-xs text-muted-foreground">Paciente</p><p className="text-lg font-semibold">{appointment.patientName}</p></div><div className="grid grid-cols-2 gap-4"><Detail label="Data" value={formatBrazilianDate(appointment.startsAt)} /><Detail label="Horário" value={`${formatTime24(appointment.startsAt)} – ${formatTime24(appointment.endsAt)}`} /><Detail label="Tipo" value={appointment.type} /><div><p className="text-xs text-muted-foreground">Status</p><Badge>{formatStatusLabel(appointment.status)}</Badge></div></div>{appointment.videoUrl ? <Button asChild variant="outline" className="w-full"><a href={appointment.videoUrl} target="_blank" rel="noreferrer"><Video className="size-4" />Abrir videochamada</a></Button> : null}<div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => onStart(appointment)}><Play className="size-4" />Iniciar sessão</Button><CapabilityNotice descriptor={unavailable} trigger={<Button variant="outline"><MessageCircle className="size-4" />Agendar mensagem</Button>} /><CapabilityNotice descriptor={unavailable} trigger={<Button variant="outline"><CalendarIcon className="size-4" />Remarcar</Button>} /></div><div className="border-t pt-4"><div className="grid grid-cols-2 gap-2"><CapabilityNotice descriptor={unavailable} trigger={<Button variant="outline"><Edit3 className="size-4" />Editar</Button>} /><CapabilityNotice descriptor={unavailable} trigger={<Button variant="outline"><Trash2 className="size-4" />Excluir agendamento</Button>} /></div></div></div> : null}</SheetContent></Sheet>;
}

function SessionDialog({ appointment, onOpenChange }: { appointment: AppointmentView | null; onOpenChange: (open: boolean) => void }) {
  const [seconds, setSeconds] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [mood, setMood] = React.useState([5]);
  const [free, setFree] = React.useState("");
  const discard = useDiscardConfirmation(free.trim().length > 0 || mood[0] !== 5);
  React.useEffect(() => {
    if (!appointment || paused) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [appointment, paused]);
  React.useEffect(() => { if (!appointment) { setSeconds(0); setPaused(false); setMood([5]); setFree(""); } }, [appointment]);
  const close = React.useCallback(() => { setSeconds(0); setPaused(false); setMood([5]); setFree(""); onOpenChange(false); }, [onOpenChange]);
  const requestClose = () => discard.requestDiscard(close);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return <><Dialog open={Boolean(appointment)} onOpenChange={(next) => { if (!next) requestClose(); }}><DialogContent className="max-w-5xl p-0"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-brand-soft/60 p-6"><div><p className="text-xs text-muted-foreground">Sessão em andamento</p><DialogTitle>{appointment?.patientName}</DialogTitle></div><div className="flex items-center gap-2"><span className="rounded-lg border bg-card px-3 py-2 font-mono"><Clock className="mr-2 inline size-4 text-primary" />{time}</span><Button variant="outline" onClick={() => setPaused((value) => !value)}>{paused ? <Play className="size-4" /> : <Pause className="size-4" />}{paused ? "Retomar" : "Pausar"}</Button><CapabilityNotice descriptor={unavailable} trigger={<Button>Finalizar sessão</Button>} /></div></div><div className="max-h-[calc(100dvh-12rem)] space-y-5 overflow-y-auto p-6"><div className="rounded-lg border p-4 text-sm">Resumo da anamnese <span className="float-right">⌄</span></div><div><h3 className="mb-4 font-semibold">Nova evolução</h3><Label>Humor relatado: {mood[0]}/10</Label><Slider className="mt-3" min={1} max={10} step={1} value={mood} onValueChange={setMood} /></div><div><Label htmlFor="session-free-record">Registro livre</Label><Textarea id="session-free-record" className="mt-1.5 min-h-44" value={free} onChange={(event) => setFree(event.target.value)} placeholder="Anote livremente o que aconteceu na sessão..." /></div><div className="rounded-lg border p-4 text-sm">Registro estruturado (SOAP) — opcional <span className="float-right">⌄</span></div><div className="rounded-lg border p-4 text-sm">Histórico de evoluções (0) <span className="float-right">⌄</span></div></div></DialogContent></Dialog><DiscardConfirmation open={discard.open} onCancel={discard.cancelDiscard} onConfirm={discard.confirmDiscard} /></>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm">{value}</p></div>; }
