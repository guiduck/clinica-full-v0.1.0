import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { requireUser } from "@/lib/auth/require-user";
import { getFinanceOverview } from "@/services/finance/finance-overview";

export default async function FinanceiroPage() {
  const user = await requireUser();
  const overview = await getFinanceOverview(user.id);
  return <FinanceDashboard {...overview} />;
}
