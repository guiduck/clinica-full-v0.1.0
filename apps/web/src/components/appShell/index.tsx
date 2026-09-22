"use client";

import { OnboardingTour } from "@/components/onboardingTour";
import { AppointmentComposerProvider } from "@/components/appointmentComposer";
import { Tooltip } from "@/components/tooltip";
import type { AppShellProps } from "@/types/app-shell";
import { AppHeader } from "./app-header";
import { AppNavigation } from "./app-navigation";

function AppShellComponent({
  children,
  userName,
  shell,
  appointmentPatients = [],
  whatsappConfigured = false,
  initialStep,
  initiallyOpen,
}: AppShellProps) {
  return (
    <AppointmentComposerProvider patients={[...appointmentPatients]} whatsappConfigured={whatsappConfigured}>
      <OnboardingTour.Provider initialStep={initialStep} initiallyOpen={initiallyOpen}>
        <Tooltip.Provider>
        <div className="min-h-screen bg-background">
          <AppNavigation />
          <AppHeader userName={userName} shell={shell} />
          <main className="min-w-0 pb-16 lg:ml-14 lg:pb-0">{children}</main>
          <OnboardingTour userName={userName} />
        </div>
        </Tooltip.Provider>
      </OnboardingTour.Provider>
    </AppointmentComposerProvider>
  );
}

export const AppShell = Object.assign(AppShellComponent, {
  Header: AppHeader,
  Navigation: AppNavigation,
});

export { AppHeader } from "./app-header";
export { AppNavigation } from "./app-navigation";
