"use client";

import { OnboardingTour } from "@/components/onboardingTour";
import { AppointmentComposerProvider } from "@/components/appointmentComposer";
import { FinanceEntryComposerProvider } from "@/components/financeEntryComposer";
import { MessageComposerProvider } from "@/components/messageComposer";
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
    <FinanceEntryComposerProvider
      patients={appointmentPatients.map(({ id, name }) => ({ id, name }))}
    >
      <MessageComposerProvider
        patients={appointmentPatients.map((patient) => ({
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          emailConsent: patient.emailConsent,
          whatsappConsent: patient.whatsappConsent,
        }))}
      >
        <AppointmentComposerProvider
          patients={[...appointmentPatients]}
          whatsappConfigured={whatsappConfigured}
        >
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
      </MessageComposerProvider>
    </FinanceEntryComposerProvider>
  );
}

export const AppShell = Object.assign(AppShellComponent, {
  Header: AppHeader,
  Navigation: AppNavigation,
});

export { AppHeader } from "./app-header";
export { AppNavigation } from "./app-navigation";
