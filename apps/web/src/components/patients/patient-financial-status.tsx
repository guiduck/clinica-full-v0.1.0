import { Badge } from "@/components/ui/badge";

export function PatientFinancialStatus({ isComplete }: { isComplete: boolean }) {
  return (
    <Badge tone={isComplete ? "success" : "warning"}>
      {isComplete ? "Apto para agendar" : "Dados de pagamento pendentes"}
    </Badge>
  );
}
