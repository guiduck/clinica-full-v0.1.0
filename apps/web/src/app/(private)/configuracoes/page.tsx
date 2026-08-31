import { requireUser } from "@/lib/auth/require-user";
import { SettingsPage } from "@/components/settings/settings-page";
export default async function ConfiguracoesPage() {
  const user = await requireUser();
  return <SettingsPage userName={user.name} userEmail={user.email} />;
}
