"use client";

import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AppShellView } from "@/types/app-shell";

export function NotificationMenu({ shell }: { shell: AppShellView }) {
  const hasPendingMessages = shell.pendingMessageCount > 0;
  const hasNotifications = shell.notifications.length > 0;
  const hasUnreadItems = hasPendingMessages || hasNotifications;
  const unreadCount =
    shell.notifications.length + (hasPendingMessages ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="tour-notifications"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell aria-hidden="true" className="size-5" />
          {hasUnreadItems && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <header className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          <p className="text-xs text-muted-foreground">{unreadCount} novas</p>
        </header>
        <div className="max-h-80 overflow-auto">
          {hasPendingMessages && (
            <Link
              href="/configuracoes?tab=mensagens"
              className="flex items-start gap-3 border-b px-4 py-3 hover:bg-muted/50"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning/10 text-warning">
                <MessageSquare aria-hidden="true" className="size-4" />
              </span>
              <span>
                <b className="text-sm">Mensagens a confirmar</b>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {shell.pendingMessageCount} envio(s) aguardam confirmação
                </span>
              </span>
            </Link>
          )}
          {shell.notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.href}
              className="block border-b px-4 py-3 last:border-0 hover:bg-muted/50"
            >
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {notification.description}
              </p>
            </Link>
          ))}
          {!hasUnreadItems && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
