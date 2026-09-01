import { Badge } from "@/components/ui/badge";
import type { NotificationStatus } from "@/types/notifications";

export function NotificationStatusChip({ status }: { status?: NotificationStatus | null }) {
  if (!status) {
    return <Badge tone="muted">Sem notificação</Badge>;
  }

  const tone = status === "enviado" ? "success" : status === "falhou" ? "danger" : "warning";

  return <Badge tone={tone}>{status}</Badge>;
}
