"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, MessageSquare, RotateCcw, Settings } from "lucide-react";
import { logoutFromClient } from "@/actions/auth";
import { updateUserUiPreferenceAction } from "@/actions/ui-preferences";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AppShellView } from "@/types/app-shell";

type Props = Readonly<{
  userName: string;
  shell: AppShellView;
  userMenuOpen: boolean;
  onUserMenuOpenChange: (value: boolean) => void;
  onNavigationOpenChange: (value: boolean) => void;
  tourActive: boolean;
  onboardingStep: number;
}>;

export function AppHeader({ userName, shell, userMenuOpen, onUserMenuOpenChange, onNavigationOpenChange, tourActive }: Props) {
  const router = useRouter();
  const restart = async () => {
    await updateUserUiPreferenceAction({ operation: "restart_onboarding" });
    window.dispatchEvent(new CustomEvent("onboarding:restart"));
    router.push("/dashboard?tourStep=1");
  };
  const signOut = async () => {
    await logoutFromClient();
    router.replace("/login");
  };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-surface/80 px-4 backdrop-blur lg:ml-14 lg:px-8">
      <Button id="tour-sidebar-toggle-mobile" className="lg:hidden" variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => onNavigationOpenChange(true)}><Menu className="size-5" /></Button>
      <div className="ml-auto flex items-center gap-1 lg:gap-2">
        <Popover>
          <PopoverTrigger asChild><Button id="tour-notifications" variant="ghost" size="icon" className="relative" aria-label="Notificações"><Bell className="size-5" />{shell.notifications.length || shell.pendingMessageCount ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" /> : null}</Button></PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b px-4 py-3"><p className="text-sm font-semibold">Notificações</p><p className="text-xs text-muted-foreground">{shell.notifications.length + (shell.pendingMessageCount ? 1 : 0)} novas</p></div>
            <div className="max-h-80 overflow-auto">
              {shell.pendingMessageCount ? <Link href="/configuracoes?tab=mensagens" className="flex items-start gap-3 border-b px-4 py-3 hover:bg-muted/50"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning/10 text-warning"><MessageSquare className="size-4" /></span><span><b className="text-sm">Mensagens a confirmar</b><span className="mt-0.5 block text-xs text-muted-foreground">{shell.pendingMessageCount} envio(s) aguardam confirmação</span></span></Link> : null}
              {shell.notifications.map((notification) => <Link key={notification.id} href={notification.href} className="block border-b px-4 py-3 last:border-0 hover:bg-muted/50"><p className="text-sm font-medium">{notification.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{notification.description}</p></Link>)}
              {!shell.notifications.length && !shell.pendingMessageCount ? <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação.</p> : null}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu modal={false} open={userMenuOpen} onOpenChange={(value) => { if (tourActive && !value) return; onUserMenuOpenChange(value); if (tourActive && value) window.dispatchEvent(new CustomEvent("tour:user-menu-opened")); }}>
          <DropdownMenuTrigger asChild><Button id="tour-user-menu" variant="ghost" className="h-12 gap-2 px-2"><Avatar className="size-8"><AvatarFallback className="bg-primary text-xs text-primary-foreground">{userName.trim().charAt(0).toUpperCase() || "?"}</AvatarFallback></Avatar><div className="hidden text-left md:block"><p className="text-sm font-medium leading-tight">Minha conta</p><p className="text-xs text-muted-foreground">Complete seu perfil</p></div><ChevronDown className="hidden size-4 md:block" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent id="tour-user-menu-panel" align="end" className="w-56" onInteractOutside={(event) => { if (tourActive) event.preventDefault(); }} onEscapeKeyDown={(event) => { if (tourActive) event.preventDefault(); }}>
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel><DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                id="tour-open-settings"
                href={tourActive ? "/configuracoes?tourStep=10" : "/configuracoes"}
                onClick={(event) => {
                  if (tourActive) {
                    event.preventDefault();
                    window.dispatchEvent(new CustomEvent("tour:settings-selected"));
                    window.location.assign("/configuracoes?tourStep=10");
                  }
                }}
              >
                <Settings className="mr-2 size-4" />Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void restart()}><RotateCcw className="mr-2 size-4" />Reiniciar tutorial</DropdownMenuItem>
            <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void signOut()}><LogOut className="mr-2 size-4" />Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
