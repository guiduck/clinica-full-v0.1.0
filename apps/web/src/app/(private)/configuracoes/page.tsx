import { requireUser } from "@/lib/auth/require-user";
import { SettingsPage } from "@/components/settings/settings-page";
import { getGoogleCalendarConnectionStatus } from "@/services/integrations/google-calendar";
import { prisma } from "@/lib/prisma";
import { googleRedirectUri } from "@/services/auth/google-oauth";
import { GOOGLE_CALENDAR_CALLBACK_PATH } from "@/services/integrations/google-calendar";
export default async function ConfiguracoesPage() {
  const user = await requireUser();
  const [googleCalendar, professional] = await Promise.all([
    getGoogleCalendarConnectionStatus(user.id),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { cpf: true, specialty: true, council: true } }),
  ]);
  return <SettingsPage
    userName={user.name}
    userEmail={user.email}
    professional={professional}
    googleCalendar={googleCalendar}
    googleCalendarCallbackUri={googleRedirectUri(GOOGLE_CALENDAR_CALLBACK_PATH)}
  />;
}
