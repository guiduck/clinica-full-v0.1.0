"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Link2Off } from "lucide-react";
import { disconnectGoogleCalendarAction } from "@/actions/integrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GoogleCalendarCard({ connected, email }: { connected: boolean; email: string | null }) {
  const calendarResult = useSearchParams().get("calendar");
  const [pending, startTransition] = React.useTransition();
  return <Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary"><CalendarDays className="size-5" /></span><div><h2 className="font-semibold">Google Agenda</h2><p className="mt-1 text-sm text-muted-foreground">Depois de conectar, novas consultas serão enviadas automaticamente. Na Agenda, use “Sincronizar consultas pendentes” para as já criadas.</p>{connected ? <p className="mt-2 text-xs text-success">Conectado como {email}</p> : <p className="mt-2 text-xs text-muted-foreground">Ainda não conectado.</p>}{calendarResult === "connected" && <p role="status" className="mt-2 text-xs text-success">Conexão autorizada. Volte à Agenda para sincronizar consultas pendentes.</p>}{["failed", "invalid", "unavailable"].includes(calendarResult ?? "") && <p role="alert" className="mt-2 text-xs text-destructive">Não foi possível conectar o Google Agenda. Verifique a autorização e tente novamente.</p>}</div></div>{connected ? <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => { await disconnectGoogleCalendarAction(); window.location.reload(); })}><Link2Off className="size-4" />Desconectar</Button> : <Button asChild><a href="/api/integrations/google-calendar/start">Conectar Google Agenda</a></Button>}</div></Card>;
}
