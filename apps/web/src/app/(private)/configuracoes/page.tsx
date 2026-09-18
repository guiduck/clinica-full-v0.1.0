import { requireUser } from "@/lib/auth/require-user";
import { SettingsPage } from "@/components/settings/settings-page";
import { getGoogleCalendarConnectionStatus } from "@/services/integrations/google-calendar";
export default async function ConfiguracoesPage() {
  const user = await requireUser();
  const googleCalendar = await getGoogleCalendarConnectionStatus(user.id);
  return <SettingsPage userName={user.name} userEmail={user.email} googleCalendar={googleCalendar} />;
}
