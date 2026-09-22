"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Link2Off } from "lucide-react";
import { disconnectGoogleCalendarAction } from "@/actions/integrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GoogleCalendarCard({ connected, email, callbackUri }: { connected: boolean; email: string | null; callbackUri: string }) {
  const calendarResult = useSearchParams().get("calendar");
  const [pending, startTransition] = React.useTransition();
  const failed = ["failed", "invalid", "unavailable"].includes(calendarResult ?? "");
  return <Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary"><CalendarDays className="size-5" /></span><div className="min-w-0"><h2 className="font-semibold">Google Agenda</h2><p className="mt-1 text-sm text-muted-foreground">Depois de conectar, novas consultas serão enviadas automaticamente. Na Agenda, use “Sincronizar consultas pendentes” para as já criadas.</p>{connected ? <p className="mt-2 text-xs text-success">Conectado como {email}</p> : <p className="mt-2 text-xs text-muted-foreground">Ainda não conectado.</p>}{calendarResult === "connected" && <p role="status" className="mt-2 text-xs text-success">Conexão autorizada. Volte à Agenda para sincronizar consultas pendentes.</p>}{failed && <div role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs"><p className="font-medium text-destructive">O callback do Google Agenda não está autorizado.</p><p className="mt-1 text-muted-foreground">No cliente OAuth do Google Cloud, adicione exatamente esta URI de redirecionamento:</p><code className="mt-2 block overflow-x-auto rounded bg-background p-2 text-foreground">{callbackUri}</code><p className="mt-2 text-muted-foreground">Também habilite a Google Calendar API e o escopo <code>https://www.googleapis.com/auth/calendar.events</code>.</p></div>}</div></div>{connected ? <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => { await disconnectGoogleCalendarAction(); window.location.reload(); })}><Link2Off className="size-4" />Desconectar</Button> : <Button asChild><a href="/api/integrations/google-calendar/start">Conectar Google Agenda</a></Button>}</div></Card>;
}
