"use client";

import { OnboardingTour } from "@/components/onboardingTour";
import { Tooltip } from "@/components/tooltip";
import type { AppShellProps } from "@/types/app-shell";
import { AppHeader } from "./app-header";
import { AppNavigation } from "./app-navigation";

function AppShellComponent({
  children,
  userName,
  shell,
  initialStep,
  initiallyOpen,
}: AppShellProps) {
  return (
    <OnboardingTour.Provider
      initialStep={initialStep}
      initiallyOpen={initiallyOpen}
    >
      <Tooltip.Provider>
        <div className="min-h-screen bg-background">
          <AppNavigation />
          <AppHeader userName={userName} shell={shell} />
          <main className="min-w-0 pb-16 lg:ml-14 lg:pb-0">{children}</main>
          <OnboardingTour userName={userName} />
        </div>
      </Tooltip.Provider>
    </OnboardingTour.Provider>
  );
}

export const AppShell = Object.assign(AppShellComponent, {
  Header: AppHeader,
  Navigation: AppNavigation,
});

export { AppHeader } from "./app-header";
export { AppNavigation } from "./app-navigation";
