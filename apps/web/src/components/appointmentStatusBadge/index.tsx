import { Badge } from "@/components/ui/badge";
import { appointmentStatusStyle } from "@/constants/appointment-status";
import { cn } from "@/lib/utils";
import { formatStatusLabel } from "@/utils/formatters";

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      className={cn("font-medium", appointmentStatusStyle(status), className)}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
