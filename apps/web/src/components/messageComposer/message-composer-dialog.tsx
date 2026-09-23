"use client";

import * as React from "react";
import { CalendarClock, Mail, MessageCircle } from "lucide-react";
import { scheduleMessageAction } from "@/actions/messages";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { MessageChannelView, MessagePatientOption } from "@/types/messages";

function defaultScheduleValue() {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  date.setSeconds(0, 0);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function MessageComposerDialog({
  open,
  onOpenChange,
  patients,
  defaultPatientId,
  initialChannel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: MessagePatientOption[];
  defaultPatientId?: string;
  initialChannel: MessageChannelView;
}) {
  const [patientId, setPatientId] = React.useState(defaultPatientId ?? "");
  const [channel, setChannel] = React.useState<MessageChannelView>(initialChannel);
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState(defaultScheduleValue);
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!open) return;
    setPatientId(defaultPatientId ?? "");
    setChannel(initialChannel);
    setSubject("");
    setBody("");
    setScheduledAt(defaultScheduleValue());
    setResult(null);
  }, [defaultPatientId, initialChannel, open]);

  const patient = patients.find((item) => item.id === patientId);
  const canUseEmail = Boolean(patient?.email && patient.emailConsent);
  const canUseWhatsApp = Boolean(patient?.phone && patient.whatsappConsent);

  const submit = () => {
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      setResult({ ok: false, message: "Escolha uma data e hora válidas." });
      return;
    }
    startTransition(async () => {
      const next = await scheduleMessageAction({
        patientId,
        channel,
        subject: channel === "email" ? subject : undefined,
        body,
        scheduledFor: date.toISOString(),
      });
      setResult(next);
      if (next.ok) onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Programar mensagem</DialogTitle>
          <DialogDescription>
            Escolha o canal e o horário. O worker fará o envio e registrará a conversa no inbox.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger aria-label="Paciente">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs
            value={channel}
            onValueChange={(value) => setChannel(value as MessageChannelView)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="whatsapp" disabled={Boolean(patientId) && !canUseWhatsApp}>
                <MessageCircle className="size-4" /> WhatsApp
              </TabsTrigger>
              <TabsTrigger value="email" disabled={Boolean(patientId) && !canUseEmail}>
                <Mail className="size-4" /> E-mail
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {patient && ((channel === "email" && !canUseEmail) || (channel === "whatsapp" && !canUseWhatsApp)) ? (
            <p className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
              Este paciente não possui contato ou consentimento válido para o canal escolhido.
            </p>
          ) : null}
          {channel === "email" ? (
            <div className="space-y-1.5">
              <Label htmlFor="message-subject">Assunto</Label>
              <Input
                id="message-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={160}
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="message-body">Mensagem</Label>
            <Textarea
              id="message-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={7}
              maxLength={2000}
              placeholder="Escreva uma mensagem sem informações clínicas sensíveis."
            />
            <p className="text-right text-xs text-muted-foreground">{body.length}/2000</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message-scheduled-at">Enviar em</Label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="message-scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {result ? (
            <p
              role="status"
              className={cn(
                "rounded-lg p-3 text-sm",
                result.ok
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {result.message}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={
              pending ||
              !patientId ||
              !body.trim() ||
              !scheduledAt ||
              (channel === "email" ? !canUseEmail || !subject.trim() : !canUseWhatsApp)
            }
          >
            {pending ? "Programando..." : "Programar envio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
