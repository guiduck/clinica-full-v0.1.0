"use client";

import * as React from "react";
import { CalendarDays, Link2Off } from "lucide-react";
import { disconnectGoogleCalendarAction } from "@/actions/integrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GoogleCalendarCard({ connected, email }: { connected: boolean; email: string | null }) {
  const [pending, startTransition] = React.useTransition();
  return <Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary"><CalendarDays className="size-5" /></span><div><h2 className="font-semibold">Google Agenda</h2><p className="mt-1 text-sm text-muted-foreground">Consultas novas podem ser copiadas automaticamente para o seu calendário.</p>{connected ? <p className="mt-2 text-xs text-success">Conectado como {email}</p> : <p className="mt-2 text-xs text-muted-foreground">Ainda não conectado.</p>}</div></div>{connected ? <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => { await disconnectGoogleCalendarAction(); window.location.reload(); })}><Link2Off className="size-4" />Desconectar</Button> : <Button asChild><a href="/api/integrations/google-calendar/start">Conectar Google Agenda</a></Button>}</div></Card>;
}
