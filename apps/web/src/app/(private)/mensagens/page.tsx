import { MessageInbox } from "@/components/messages/message-inbox";
import { requireUser } from "@/lib/auth/require-user";
import { getMessageInbox } from "@/services/messages/message-inbox";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ patientId?: string; tab?: string }> }) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const inbox = await getMessageInbox(user.id);
  return <MessageInbox inbox={inbox} initialPatientId={params.patientId} initialTab={params.tab === "programadas" ? "programadas" : "conversas"} />;
}
