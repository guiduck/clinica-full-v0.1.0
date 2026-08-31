"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Users,
  Wallet,
} from "lucide-react";
import { logoutFromClient } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: Calendar },
] as const;
const financeItems = [
  { href: "/financeiro", label: "Fluxo de caixa", icon: Wallet },
  { href: "/financeiro/previsibilidade", label: "Previsibilidade", icon: LineChart },
] as const;
const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

export function AppNavigation({
  open,
  onOpenChange,
  tourActive,
}: Readonly<{ open: boolean; onOpenChange: (value: boolean) => void; tourActive: boolean }>) {
  const path = usePathname();
  const router = useRouter();
  const financeActive = path.startsWith("/financeiro");
  const [financeOpen, setFinanceOpen] = React.useState(false);
  const signOut = async () => {
    await logoutFromClient();
    router.replace("/login");
  };
  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-4 lg:flex">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">C</div>
        <Tooltip delayDuration={80}><TooltipTrigger asChild><Button id="tour-sidebar-toggle" variant="ghost" size="icon" className="mt-1" onClick={() => onOpenChange(true)} aria-label="Abrir menu"><Menu className="size-5" /></Button></TooltipTrigger><TooltipContent side="right">Abrir menu</TooltipContent></Tooltip>
        <nav aria-label="Atalhos" className="mt-2 flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => <Tooltip key={item.href} delayDuration={80}><TooltipTrigger asChild><Link href={item.href} aria-label={item.label} className={cn("grid size-10 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground", isActive(path, item.href) && "bg-accent text-accent-foreground")}><item.icon className="size-4" /></Link></TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip>)}
          <Popover open={financeOpen} onOpenChange={setFinanceOpen}>
            <PopoverTrigger asChild><button type="button" aria-label="Financeiro" onMouseEnter={() => setFinanceOpen(true)} className={cn("grid size-10 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground", financeActive && "bg-accent text-accent-foreground")}><Wallet className="size-4" /></button></PopoverTrigger>
            <PopoverContent side="right" align="start" sideOffset={8} className="w-52 p-1" onMouseLeave={() => setFinanceOpen(false)} onOpenAutoFocus={(event) => event.preventDefault()}>
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Financeiro</p>
              {financeItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setFinanceOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted", path === item.href && "bg-accent text-accent-foreground")}><item.icon className="size-4" />{item.label}</Link>)}
            </PopoverContent>
          </Popover>
        </nav>
        <Tooltip delayDuration={80}><TooltipTrigger asChild><button onClick={() => void signOut()} className="grid size-10 place-items-center rounded-lg text-foreground/60 hover:bg-muted hover:text-foreground" aria-label="Sair"><LogOut className="size-4" /></button></TooltipTrigger><TooltipContent side="right">Sair</TooltipContent></Tooltip>
      </aside>

      <Sheet open={open} onOpenChange={(value) => { if (value || !tourActive) onOpenChange(value); }}>
        <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-4 sm:max-w-xs" onInteractOutside={(event) => { if (tourActive) event.preventDefault(); }} onEscapeKeyDown={(event) => { if (tourActive) event.preventDefault(); }}>
          <div className="mb-6 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">C</div>
            <div><p className="font-semibold leading-tight">Clínica Ágil</p><p className="text-xs text-muted-foreground">Gestão clínica</p></div>
          </div>
          <nav aria-label="Navegação principal" className="flex-1 space-y-1">
            {navItems.map((item) => <Link id={`tour-nav-${item.href.slice(1)}`} key={item.href} href={item.href} onClick={() => { if (!tourActive) onOpenChange(false); }} className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground", isActive(path, item.href) && "bg-accent text-accent-foreground")}><item.icon className="size-4" />{item.label}</Link>)}
            <div id="tour-nav-financeiro" className={cn("rounded-xl border border-transparent", financeActive && "border-primary/15")}>
              <div className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground/70", financeActive && "bg-accent text-accent-foreground")}><Wallet className="size-4" /><span className="flex-1">Financeiro</span><ChevronDown className="size-3.5" /></div>
              <div className="ml-7 mt-1 space-y-1">{financeItems.map((item) => <Link key={item.href} href={item.href} onClick={() => { if (!tourActive) onOpenChange(false); }} className={cn("flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-medium text-foreground/60 hover:bg-muted hover:text-foreground", path === item.href && "bg-muted text-foreground")}><item.icon className="size-3.5" />{item.label}</Link>)}</div>
            </div>
          </nav>
          <button onClick={() => void signOut()} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"><LogOut className="size-4" />Sair</button>
        </SheetContent>
      </Sheet>

      <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t bg-surface lg:hidden">
        {[...navItems, { href: "/financeiro", label: "Financeiro", icon: Wallet }].map((item) => <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground", isActive(path, item.href) && "text-primary")}><item.icon className="size-5" />{item.label}</Link>)}
      </nav>
    </TooltipProvider>
  );
}
