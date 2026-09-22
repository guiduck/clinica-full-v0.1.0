import { requireUser } from "@/lib/auth/require-user";
import { AppShell } from "@/components/appShell";
import { getUserUiPreference } from "@/services/ui-preferences/ui-preferences";
import { getAppShellView } from "@/services/app-shell/app-shell";
import { searchPatients } from "@/services/patients/patients";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";

export default async function PrivateLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const [preference, shell, patients] = await Promise.all([
    getUserUiPreference(user.id),
    getAppShellView(user.id),
    searchPatients(user.id),
  ]);

  return <AppShell
    userName={user.name}
    shell={shell}
    appointmentPatients={patients.map((patient) => ({
      id: patient.id,
      name: patient.name,
      hasCompleteFinancialProfile: Boolean(patient.financialProfile?.isComplete),
    }))}
    whatsappConfigured={Boolean(getWhatsAppConfig())}
    initialStep={preference.onboardingStep}
    initiallyOpen={!preference.onboardingCompletedAt && !preference.onboardingSkippedAt}
  >{children}</AppShell>;
}
