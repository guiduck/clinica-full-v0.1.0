import { ForecastView } from "@/components/finance/forecast-view";
import { requireUser } from "@/lib/auth/require-user";
import { getFinanceOverview } from "@/services/finance/finance-overview";

export default async function PrevisibilidadePage() {
  const user = await requireUser();
  const overview = await getFinanceOverview(user.id);
  return <ForecastView {...overview} />;
}
