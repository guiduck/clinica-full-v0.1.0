import { Badge } from "@/components/ui/badge";
import type { NotificationStatus } from "@/types/notifications";

export function NotificationStatusChip({ status }: { status?: NotificationStatus | null }) {
  if (!status) {
    return <Badge tone="muted">Sem notificação</Badge>;
  }

  let tone: "success" | "danger" | "warning" = "warning";
  if (status === "enviado") tone = "success";
  if (status === "falhou") tone = "danger";

  return <Badge tone={tone}>{status}</Badge>;
}
