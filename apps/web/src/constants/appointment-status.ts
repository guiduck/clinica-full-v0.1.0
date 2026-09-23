export const APPOINTMENT_STATUS_STYLES: Record<string, string> = {
  agendada: "border-info/20 bg-info/15 text-info",
  confirmada: "border-success/20 bg-success/15 text-success",
  realizada: "border-info/30 bg-info/20 text-info",
  falta: "border-destructive/20 bg-destructive/15 text-destructive",
  cancelada: "border-border bg-muted text-muted-foreground",
  remarcada: "border-warning/20 bg-warning/15 text-warning",
  pendente: "border-warning/20 bg-warning/15 text-warning",
  recusada: "border-destructive/20 bg-destructive/15 text-destructive",
};

export function appointmentStatusStyle(status: string) {
  return (
    APPOINTMENT_STATUS_STYLES[status] ??
    "border-border bg-muted text-muted-foreground"
  );
}
