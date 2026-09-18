import type { FinanceEntryView } from "@/types/finance";

export type FinanceFilters = {
  type?: "receita" | "despesa";
  status?: FinanceEntryView["status"] | "pendentes";
  category?: string;
  query?: string;
  start?: Date;
  end?: Date;
};

export function filterFinanceEntries(
  entries: FinanceEntryView[],
  filters: FinanceFilters,
) {
  const query = filters.query?.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.type && entry.type !== filters.type) return false;
    const status = filters.status === "pendentes" ? "previsto" : filters.status;
    if (status && entry.status !== status) return false;
    if (
      filters.category &&
      filters.category !== "todas" &&
      entry.category !== filters.category
    )
      return false;
    if (
      query &&
      !`${entry.description} ${entry.patientName}`.toLowerCase().includes(query)
    )
      return false;
    const date = new Date(entry.date);
    if (filters.start && date < filters.start) return false;
    if (filters.end && date > filters.end) return false;
    return true;
  });
}

export function buildFinanceSummary(entries: FinanceEntryView[]) {
  const active = entries.filter((entry) => entry.status !== "cancelado");
  const sum = (
    type: FinanceEntryView["type"],
    status?: FinanceEntryView["status"],
  ) =>
    active
      .filter(
        (entry) => entry.type === type && (!status || entry.status === status),
      )
      .reduce((total, entry) => total + entry.valueCents, 0);
  const effectiveRevenue = sum("receita", "efetivado");
  const effectiveExpense = sum("despesa", "efetivado");
  const expectedRevenue = sum("receita", "previsto");
  const expectedExpense = sum("despesa", "previsto");
  return {
    effectiveRevenue,
    effectiveExpense,
    expectedRevenue,
    expectedExpense,
    effectiveBalance: effectiveRevenue - effectiveExpense,
    predictedBalance:
      effectiveRevenue + expectedRevenue - effectiveExpense - expectedExpense,
  };
}

export function financeCategoryTotals(
  entries: FinanceEntryView[],
  type: FinanceEntryView["type"],
) {
  const totals = new Map<string, number>();
  entries
    .filter((entry) => entry.type === type && entry.status === "efetivado")
    .forEach((entry) =>
      totals.set(
        entry.category,
        (totals.get(entry.category) ?? 0) + entry.valueCents,
      ),
    );
  return [...totals.entries()].map(([name, value]) => ({ name, value }));
}

export function financeMonthlySeries(
  entries: FinanceEntryView[],
  year: number,
) {
  return Array.from({ length: 12 }, (_, month) => {
    const relevant = entries.filter((entry) => {
      const date = new Date(entry.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    const summary = buildFinanceSummary(relevant);
    return { month: month + 1, ...summary };
  });
}
