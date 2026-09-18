import type { FinanceEntryView } from "@/types/finance";
import {
  buildFinanceSummary,
  filterFinanceEntries,
} from "@/components/finance/finance-view-model";

export type DashboardPatientRecord = {
  id: string;
  name: string;
  status: string;
};
export type DashboardAppointmentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  startsAt: string;
  endsAt: string;
  status: string;
};

export function buildDashboardViewModel(
  patients: DashboardPatientRecord[],
  appointments: DashboardAppointmentRecord[],
  now = new Date(),
) {
  const todayKey = now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const activeAppointments = appointments.filter(
    (item) => !["cancelada", "recusada"].includes(item.status),
  );
  const upcoming = activeAppointments
    .filter((item) => new Date(item.startsAt) >= now)
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, 5);
  return {
    activePatientCount: patients.filter((patient) => patient.status === "ativo")
      .length,
    todayCount: activeAppointments.filter(
      (item) => new Date(item.startsAt).toDateString() === todayKey,
    ).length,
    tomorrowCount: activeAppointments.filter(
      (item) =>
        new Date(item.startsAt).toDateString() === tomorrow.toDateString(),
    ).length,
    upcoming,
  };
}

export function dashboardFinanceMonthHref(year: number, month: number) {
  const paddedMonth = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return `/financeiro?period=custom&from=01/${paddedMonth}/${year}&to=${lastDay}/${paddedMonth}/${year}`;
}

export type DashboardFinancePeriod = "week" | "1m" | "3m" | "6m" | "1y";
const FINANCE_PERIOD_MONTHS: Record<Exclude<DashboardFinancePeriod, "week">, number> = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
};

function dashboardFinanceRange(period: DashboardFinancePeriod, now: Date) {
  if (period === "week") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
      end: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
      ),
      months: 1,
    };
  }
  const months = FINANCE_PERIOD_MONTHS[period];
  return {
    start: new Date(now.getFullYear(), now.getMonth() - months + 1, 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    months,
  };
}

export function buildDashboardFinanceViewModel(
  entries: FinanceEntryView[],
  period: DashboardFinancePeriod,
  now = new Date(),
) {
  const range = dashboardFinanceRange(period, now);
  const filtered = filterFinanceEntries(entries, {
    start: range.start,
    end: range.end,
  });
  const summary = buildFinanceSummary(filtered);
  const series = Array.from({ length: range.months }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (range.months - 1 - index),
      1,
    );
    const monthSummary = buildFinanceSummary(
      filterFinanceEntries(filtered, {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0,
          23,
          59,
          59,
        ),
      }),
    );
    return {
      mes: date
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      saldo: monthSummary.effectiveBalance / 100,
    };
  });
  return { summary, series };
}
