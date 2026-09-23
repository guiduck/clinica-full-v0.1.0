"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Cake, CalendarClock, CreditCard, FileSignature, MessageSquare } from "lucide-react";
import { markNotificationReadAction } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AppShellView, ShellNotificationView } from "@/types/app-shell";

const presentation = {
  appointment: { Icon: CalendarClock, color: "bg-info/15 text-info" },
  payment: { Icon: CreditCard, color: "bg-destructive/10 text-destructive" },
  birthday: { Icon: Cake, color: "bg-primary/10 text-primary" },
  message: { Icon: MessageSquare, color: "bg-warning/15 text-warning" },
  document: { Icon: FileSignature, color: "bg-success/15 text-success" },
} as const;

function NotificationItem({ notification }: { notification: ShellNotificationView }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const { Icon, color } = presentation[notification.type];
  const open = () => startTransition(async () => {
    if (!notification.readAt) await markNotificationReadAction(notification.id);
    router.push(notification.href);
  });
  return (
    <button type="button" disabled={pending} onClick={open} className={cn("flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-muted/50", !notification.readAt && "bg-primary/[0.035]")}>
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", color)}><Icon aria-hidden="true" className="size-4" /></span>
      <span className="min-w-0"><b className="text-sm">{notification.title}</b><span className="mt-0.5 block text-xs text-muted-foreground">{notification.description}</span></span>
    </button>
  );
}

export function NotificationMenu({ shell }: { shell: AppShellView }) {
  const hasPendingMessages = shell.pendingMessageCount > 0;
  const hasItems = hasPendingMessages || shell.notifications.length > 0;
  const unreadCount = (shell.unreadCount ?? 0) + (hasPendingMessages ? 1 : 0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id="tour-notifications" variant="ghost" size="icon" className="relative" aria-label={`Notificações${unreadCount ? `, ${unreadCount} novas` : ""}`}>
          <Bell aria-hidden="true" className="size-5" />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <header className="border-b px-4 py-3"><p className="text-sm font-semibold">Notificações</p><p className="text-xs text-muted-foreground">{unreadCount} novas</p></header>
        <div className="max-h-80 overflow-auto">
          {hasPendingMessages && <button type="button" onClick={() => location.assign("/mensagens?tab=programadas")} className="flex w-full items-start gap-3 border-b px-4 py-3 text-left hover:bg-muted/50"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning/10 text-warning"><MessageSquare className="size-4" /></span><span><b className="text-sm">Mensagens programadas</b><span className="mt-0.5 block text-xs text-muted-foreground">{shell.pendingMessageCount} envio(s) na fila</span></span></button>}
          {shell.notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} />)}
          {!hasItems && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}