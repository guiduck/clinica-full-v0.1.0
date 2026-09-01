"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingTourActions } from "@/hooks/onboarding/use-onboarding-tour-actions";
import type { AppShellView } from "@/types/app-shell";
import { NotificationMenu } from "./notification-menu";
import { UserMenu } from "./user-menu";

export type AppHeaderProps = Readonly<{
  userName: string;
  shell: AppShellView;
}>;

export function AppHeader({ userName, shell }: AppHeaderProps) {
  const { openNavigation } = useOnboardingTourActions();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-surface/80 px-4 backdrop-blur lg:ml-14 lg:px-8">
      <Button
        id="tour-sidebar-toggle-mobile"
        className="lg:hidden"
        variant="ghost"
        size="icon"
        aria-label="Abrir menu"
        onClick={openNavigation}
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>
      <div className="ml-auto flex items-center gap-1 lg:gap-2">
        <NotificationMenu shell={shell} />
        <UserMenu userName={userName} />
      </div>
    </header>
  );
}
