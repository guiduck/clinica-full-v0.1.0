import { requireUser } from "@/lib/auth/require-user";
import { AppShell } from "@/components/appShell";
import { getUserUiPreference } from "@/services/ui-preferences/ui-preferences";
import { getAppShellView } from "@/services/app-shell/app-shell";

export default async function PrivateLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const [preference, shell] = await Promise.all([getUserUiPreference(user.id), getAppShellView(user.id)]);

  return <AppShell userName={user.name} shell={shell} initialStep={preference.onboardingStep} initiallyOpen={!preference.onboardingCompletedAt && !preference.onboardingSkippedAt}>{children}</AppShell>;
}
