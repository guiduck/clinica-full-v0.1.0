"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAppointmentAction, updateAppointmentAction, type AppointmentActionState } from "@/actions/appointments";
import { AppointmentTimeSelect } from "@/components/appointments/appointment-time-select";
import { keepOrAdvanceAppointmentEnd } from "@/components/appointments/appointment-time-options";
import { DatePickerInput } from "@/components/datePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { brazilianAppointmentDateTime } from "@/utils/appointment-datetime";
import { formatBrazilianDate, formatTime24 } from "@/utils/formatters";

export type AppointmentComposerPatient = { id: string; name: string; hasCompleteFinancialProfile: boolean };
export type EditableAppointment = { id: string; patientId: string; startsAt: string; endsAt: string; type: string; videoUrl: string | null };
const initialAction: AppointmentActionState = { ok: false, message: "" };

export function AppointmentComposerDialog({ open, onOpenChange, patients, defaultPatientId, editing, whatsappConfigured }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: AppointmentComposerPatient[];
  defaultPatientId?: string;
  editing?: EditableAppointment;
  whatsappConfigured: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(editing ? updateAppointmentAction : createAppointmentAction, initialAction);
  const [patientId, setPatientId] = React.useState(editing?.patientId ?? defaultPatientId ?? "");
  const [date, setDate] = React.useState(formatBrazilianDate(editing?.startsAt ?? new Date()));
  const [start, setStart] = React.useState(editing ? formatTime24(editing.startsAt) : "09:00");
  const [end, setEnd] = React.useState(editing ? formatTime24(editing.endsAt) : "09:50");
  const [type, setType] = React.useState(editing?.type ?? "Sessão individual");
  const [videoUrl, setVideoUrl] = React.useState(editing?.videoUrl ?? "");
  const [recurring, setRecurring] = React.useState(false);
  const [recurrenceCount, setRecurrenceCount] = React.useState(4);

  React.useEffect(() => {
    if (!editing && open) setPatientId(defaultPatientId ?? "");
  }, [defaultPatientId, editing, open]);

  React.useEffect(() => {
    if (!state.ok) return;
    toast.message(state.message);
    onOpenChange(false);
    router.refresh();
  }, [onOpenChange, router, state.ok, state.message]);

  const selectStart = (value: string) => {
    setStart(value);
    setEnd((current) => keepOrAdvanceAppointmentEnd(value, current));
  };
  let notificationMessage = "WhatsApp não configurado: a consulta será criada normalmente, mas não terá confirmação nem lembretes automáticos.";
  if (whatsappConfigured) notificationMessage = editing
    ? "Ao alterar o horário, avise o paciente manualmente. Esta edição não envia uma nova mensagem automática."
    : "A confirmação da primeira consulta será processada após salvar. As demais ficarão disponíveis para os futuros lembretes agendados.";
  let submitLabel = "Salvar";
  if (editing) submitLabel = "Salvar alterações";
  if (recurring) submitLabel = `Criar ${recurrenceCount} consultas`;
  if (pending) submitLabel = "Salvando...";

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{editing ? "Editar agendamento" : "Novo agendamento"}</DialogTitle><DialogDescription className="sr-only">Escolha paciente, data e horário da consulta</DialogDescription></DialogHeader>
      <form action={action} className="grid gap-4">
        {editing && <input type="hidden" name="appointmentId" value={editing.id} />}
        <div><Label htmlFor="appointment-patient">Paciente</Label><Select value={patientId} onValueChange={setPatientId} disabled={Boolean(editing)}><SelectTrigger id="appointment-patient" className="mt-1.5"><SelectValue placeholder="Selecione o paciente" /></SelectTrigger><SelectContent>{patients.map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.name}{patient.hasCompleteFinancialProfile ? "" : " — financeiro pendente"}</SelectItem>)}</SelectContent></Select><input type="hidden" name="patientId" value={patientId} /></div>
        <div><Label htmlFor="appointment-type">Tipo</Label><Select value={type} onValueChange={setType}><SelectTrigger id="appointment-type" className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sessão individual">Sessão individual</SelectItem><SelectItem value="Primeira consulta">Primeira consulta</SelectItem><SelectItem value="Retorno">Retorno</SelectItem></SelectContent></Select><input type="hidden" name="type" value={type} /></div>
        <div className="grid gap-3 sm:grid-cols-3"><div><Label htmlFor="appointment-date">Data</Label><DatePickerInput id="appointment-date" value={date} onValueChange={setDate} minDate={editing ? undefined : new Date()} aria-label="Data da consulta" /></div><AppointmentTimeSelect id="appointment-start" label="Início" value={start} onValueChange={selectStart} /><AppointmentTimeSelect id="appointment-end" label="Fim" value={end} onValueChange={setEnd} minimumExclusive={start} /></div>
        <input type="hidden" name="startsAt" value={brazilianAppointmentDateTime(date, start)} /><input type="hidden" name="endsAt" value={brazilianAppointmentDateTime(date, end)} />
        <div><Label htmlFor="appointment-video-url">Link da videochamada (opcional)</Label><Input id="appointment-video-url" className="mt-1.5" name="videoUrl" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://meet.google.com/..." /></div>
        {!editing && <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm"><Checkbox checked={recurring} onCheckedChange={(value) => setRecurring(value === true)} />Sessão recorrente semanal</label>{recurring && <div className="flex items-center gap-2"><Label htmlFor="recurrence-count">Total de consultas</Label><Input id="recurrence-count" className="w-24" type="number" min={2} max={52} value={recurrenceCount} onChange={(event) => setRecurrenceCount(Number(event.target.value))} /></div>}<input type="hidden" name="recurrenceCount" value={recurring ? recurrenceCount : 1} /></div>}
        <div className={cn("rounded-lg border p-3 text-xs", whatsappConfigured ? "border-primary/20 bg-brand-soft/40 text-muted-foreground" : "border-amber-300 bg-amber-50 text-amber-900")}>{notificationMessage}</div>
        {state.message && <p className={cn("text-sm", state.ok ? "text-success" : "text-destructive")}>{state.message}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{submitLabel}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
