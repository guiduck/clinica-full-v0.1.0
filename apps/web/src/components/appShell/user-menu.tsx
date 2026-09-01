"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  RotateCcw,
  Settings,
} from "lucide-react";
import { logoutFromClient } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnboardingTourStore } from "@/components/onboardingTour";
import {
  APP_ONBOARDING_SETTINGS_PATH,
  APP_SETTINGS_PATH,
} from "@/constants/app-shell";
import { ONBOARDING_ADVANCE } from "@/constants/onboarding-tour";
import { useOnboardingTourActions } from "@/hooks/onboarding/use-onboarding-tour-actions";

export function UserMenu({ userName }: { userName: string }) {
  const router = useRouter();
  const tourActive = useOnboardingTourStore((state) => state.open);
  const userMenuOpen = useOnboardingTourStore((state) => state.userMenuOpen);
  const setUserMenuOpen = useOnboardingTourStore(
    (state) => state.setUserMenuOpen,
  );
  const { advanceFrom, restart } = useOnboardingTourActions();
  const settingsHref = tourActive
    ? APP_ONBOARDING_SETTINGS_PATH
    : APP_SETTINGS_PATH;
  const userInitial = userName.trim().charAt(0).toUpperCase() || "?";

  function handleOpenChange(open: boolean) {
    if (tourActive && !open) return;
    setUserMenuOpen(open);
    if (!open) return;
    advanceFrom(ONBOARDING_ADVANCE.USER_MENU);
  }

  function handleSettingsClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!tourActive) return;
    event.preventDefault();
    advanceFrom(ONBOARDING_ADVANCE.SETTINGS_SELECTED);
    window.location.assign(APP_ONBOARDING_SETTINGS_PATH);
  }

  async function signOut() {
    await logoutFromClient();
    router.replace("/login");
  }

  return (
    <DropdownMenu
      modal={false}
      open={userMenuOpen}
      onOpenChange={handleOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <Button id="tour-user-menu" variant="ghost" className="h-12 gap-2 px-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-tight">Minha conta</p>
            <p className="text-xs text-muted-foreground">Complete seu perfil</p>
          </div>
          <ChevronDown aria-hidden="true" className="hidden size-4 md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        id="tour-user-menu-panel"
        align="end"
        className="w-56"
        onInteractOutside={(event) => {
          if (tourActive) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (tourActive) event.preventDefault();
        }}
      >
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            id="tour-open-settings"
            href={settingsHref}
            onClick={handleSettingsClick}
          >
            <Settings aria-hidden="true" className="mr-2 size-4" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void restart()}>
          <RotateCcw aria-hidden="true" className="mr-2 size-4" />
          Reiniciar tutorial
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut aria-hidden="true" className="mr-2 size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
