"use client";

import Link from "next/link";
import { LogOut, Menu, Wallet } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/tooltip";
import {
  APP_FINANCE_ITEMS,
  APP_NAVIGATION_ITEMS,
} from "@/constants/app-shell";
import { cn } from "@/lib/utils";
import { isActiveNavigationPath } from "@/utils/app-shell/navigation";

export type NavigationRailProps = Readonly<{
  financeOpen: boolean;
  path: string;
  onFinanceOpenChange: (open: boolean) => void;
  onNavigationOpen: () => void;
  onSignOut: () => void;
}>;

export function NavigationRail({
  financeOpen,
  path,
  onFinanceOpenChange,
  onNavigationOpen,
  onSignOut,
}: NavigationRailProps) {
  const financeActive = path.startsWith("/financeiro");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-4 lg:flex">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
        C
      </div>
      <Tooltip content="Abrir menu" side="right" delayDuration={80}>
        <Button
          id="tour-sidebar-toggle"
          variant="ghost"
          size="icon"
          className="mt-1"
          onClick={onNavigationOpen}
          aria-label="Abrir menu"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </Tooltip>
      <nav
        aria-label="Atalhos"
        className="mt-2 flex flex-1 flex-col items-center gap-1"
      >
        {APP_NAVIGATION_ITEMS.map((item) => (
          <Tooltip
            key={item.href}
            content={item.label}
            side="right"
            delayDuration={80}
          >
            <Link
              href={item.href}
              aria-label={item.label}
              className={cn(
                "grid size-10 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground",
                isActiveNavigationPath(path, item.href) &&
                  "bg-accent text-accent-foreground",
              )}
            >
              <item.icon aria-hidden="true" className="size-4" />
            </Link>
          </Tooltip>
        ))}
        <Popover open={financeOpen} onOpenChange={onFinanceOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Financeiro"
              onMouseEnter={() => onFinanceOpenChange(true)}
              className={cn(
                "grid size-10 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground",
                financeActive && "bg-accent text-accent-foreground",
              )}
            >
              <Wallet aria-hidden="true" className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-52 p-1"
            onMouseLeave={() => onFinanceOpenChange(false)}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Financeiro
            </p>
            {APP_FINANCE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onFinanceOpenChange(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted",
                  path === item.href && "bg-accent text-accent-foreground",
                )}
              >
                <item.icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            ))}
          </PopoverContent>
        </Popover>
      </nav>
      <Tooltip content="Sair" side="right" delayDuration={80}>
        <button
          type="button"
          onClick={onSignOut}
          className="grid size-11 place-items-center rounded-lg text-foreground/60 hover:bg-muted hover:text-foreground"
          aria-label="Sair"
        >
          <LogOut aria-hidden="true" className="size-4" />
        </button>
      </Tooltip>
    </aside>
  );
}
