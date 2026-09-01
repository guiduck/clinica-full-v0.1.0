"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  APP_FINANCE_ITEMS,
  APP_NAVIGATION_ITEMS,
} from "@/constants/app-shell";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { isActiveNavigationPath } from "@/utils/app-shell/navigation";

export type NavigationSheetProps = Readonly<{
  open: boolean;
  path: string;
  tourActive: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
}>;

export function NavigationSheet({
  open,
  path,
  tourActive,
  onOpenChange,
  onSignOut,
}: NavigationSheetProps) {
  const financeActive = path.startsWith("/financeiro");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && tourActive) return;
    onOpenChange(nextOpen);
  }

  function closeAfterNavigation() {
    if (tourActive) return;
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="left"
        className="flex w-72 flex-col bg-sidebar p-4 sm:max-w-xs"
        onInteractOutside={(event) => {
          if (tourActive) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (tourActive) event.preventDefault();
        }}
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
            C
          </div>
          <div>
            <p className="font-semibold leading-tight">{SITE_NAME}</p>
            <p className="text-xs text-muted-foreground">Gestão clínica</p>
          </div>
        </div>
        <nav aria-label="Navegação principal" className="flex-1 space-y-1">
          {APP_NAVIGATION_ITEMS.map((item) => (
            <Link
              id={`tour-nav-${item.href.slice(1)}`}
              key={item.href}
              href={item.href}
              onClick={closeAfterNavigation}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground",
                isActiveNavigationPath(path, item.href) &&
                  "bg-accent text-accent-foreground",
              )}
            >
              <item.icon aria-hidden="true" className="size-4" />
              {item.label}
            </Link>
          ))}
          <div
            id="tour-nav-financeiro"
            className={cn(
              "rounded-xl border border-transparent",
              financeActive && "border-primary/15",
            )}
          >
            <div
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground/70",
                financeActive && "bg-accent text-accent-foreground",
              )}
            >
              <Wallet aria-hidden="true" className="size-4" />
              <span className="flex-1">Financeiro</span>
              <ChevronDown aria-hidden="true" className="size-3.5" />
            </div>
            <div className="ml-7 mt-1 space-y-1">
              {APP_FINANCE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeAfterNavigation}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-medium text-foreground/60 hover:bg-muted hover:text-foreground",
                    path === item.href && "bg-muted text-foreground",
                  )}
                >
                  <item.icon aria-hidden="true" className="size-3.5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <button
          type="button"
          onClick={onSignOut}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
        >
          <LogOut aria-hidden="true" className="size-4" />
          Sair
        </button>
      </SheetContent>
    </Sheet>
  );
}
