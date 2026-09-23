"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, Mail, MessageCircle, Plus, X } from "lucide-react";
import { cancelScheduledMessageAction } from "@/actions/messages";
import { useMessageComposer } from "@/components/messageComposer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MessageInboxView } from "@/types/messages";

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export function MessageInbox({ inbox, initialPatientId, initialTab = "conversas" }: {
  inbox: MessageInboxView;
  initialPatientId?: string;
  initialTab?: "conversas" | "programadas";
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [patientId, setPatientId] = React.useState(initialPatientId ?? inbox.messages[0]?.patientId ?? "");
  const [canceling, startTransition] = React.useTransition();
  const { openMessageComposer } = useMessageComposer();
  const patients = Array.from(new Map(inbox.messages.map((message) => [message.patientId, message.patientName])).entries());
  const messages = inbox.messages.filter((message) => !patientId || message.patientId === patientId).slice().reverse();

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Mensagens</h1>
          <p className="text-muted-foreground">Conversas e envios programados por e-mail ou WhatsApp.</p>
        </div>
        <Button onClick={() => openMessageComposer(patientId ? { patientId } : undefined)}>
          <Plus className="size-4" /> Programar mensagem
        </Button>
      </header>
      <div className="flex gap-2 rounded-lg bg-brand-soft p-1 sm:w-fit">
        <Button variant={tab === "conversas" ? "default" : "ghost"} onClick={() => setTab("conversas")}>Conversas</Button>
        <Button variant={tab === "programadas" ? "default" : "ghost"} onClick={() => setTab("programadas")}>Programadas ({inbox.scheduled.length})</Button>
      </div>
      {tab === "conversas" ? (
        <div className="grid min-h-[32rem] gap-4 lg:grid-cols-[18rem_1fr]">
          <Card className="divide-y overflow-hidden">
            {patients.length ? patients.map(([id, name]) => (
              <button key={id} type="button" onClick={() => setPatientId(id)} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50", patientId === id && "bg-primary/10")}>
                <span className="grid size-9 place-items-center rounded-full bg-brand-soft font-semibold text-primary">{name.slice(0, 1).toUpperCase()}</span>
                <span className="truncate font-medium">{name}</span>
              </button>
            )) : <p className="p-6 text-sm text-muted-foreground">Nenhuma conversa ainda.</p>}
          </Card>
          <Card className="flex flex-col p-4">
            <div className="flex-1 space-y-3 overflow-auto py-2">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.direction === "outbound" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[82%] rounded-2xl px-4 py-3 text-sm", message.direction === "outbound" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <div className="mb-1 flex items-center gap-1 text-[11px] opacity-75">{message.channel === "email" ? <Mail className="size-3" /> : <MessageCircle className="size-3" />}{message.direction === "inbound" ? "Recebida" : "Enviada"}</div>
                    <p className="whitespace-pre-wrap">{message.body}</p>
                    <p className="mt-1 text-right text-[10px] opacity-70">{dateTime(message.occurredAt)}</p>
                  </div>
                </div>
              ))}
              {!messages.length && <p className="grid h-full place-items-center text-sm text-muted-foreground">Selecione uma conversa ou programe a primeira mensagem.</p>}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-3">
          {inbox.scheduled.map((message) => (
            <Card key={message.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className={cn("grid size-10 place-items-center rounded-full", message.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-info/15 text-info")}><CalendarClock className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{message.patientName} · {message.channel === "email" ? "E-mail" : "WhatsApp"}</p>
                <p className="truncate text-sm text-muted-foreground">{message.body}</p>
                <p className="text-xs text-muted-foreground">{dateTime(message.scheduledFor)} · {message.status}</p>
                {message.lastError && <p className="mt-1 text-xs text-destructive">{message.lastError}</p>}
              </div>
              <Button size="icon" variant="ghost" className="text-destructive" aria-label="Cancelar mensagem" disabled={canceling} onClick={() => startTransition(async () => { await cancelScheduledMessageAction(message.id); window.location.reload(); })}><X className="size-4" /></Button>
            </Card>
          ))}
          {!inbox.scheduled.length && <Card className="p-10 text-center text-muted-foreground">Nenhuma mensagem aguardando envio.</Card>}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Respostas recebidas pelo número Twilio são associadas ao último contato do paciente.</p>
      <Link className="text-sm text-primary hover:underline" href="/configuracoes?tab=mensagens">Configurar mensagens automáticas</Link>
    </div>
  );
}
