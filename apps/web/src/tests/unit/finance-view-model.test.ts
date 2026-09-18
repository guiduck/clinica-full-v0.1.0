import { describe, expect, it } from "vitest";
import {
  buildFinanceSummary,
  filterFinanceEntries,
  financeCategoryTotals,
  financeMonthlySeries,
} from "@/components/finance/finance-view-model";
import type { FinanceEntryView } from "@/types/finance";

const entry = (overrides: Partial<FinanceEntryView>): FinanceEntryView => ({
  id: "entry",
  appointmentId: "appointment",
  patientId: "patient",
  patientName: "Ana",
  description: "Sessão",
  category: "Avulso",
  type: "receita",
  paymentMethod: "pix",
  status: "previsto",
  valueCents: 10_000,
  date: "2026-09-01T12:00:00",
  dueDate: "2026-09-01T12:00:00",
  ...overrides,
});

describe("finance view model", () => {
  const entries = [
    entry({ id: "r1", status: "efetivado", valueCents: 20_000 }),
    entry({ id: "r2", status: "previsto", valueCents: 10_000 }),
    entry({
      id: "d1",
      type: "despesa",
      status: "efetivado",
      category: "Aluguel",
      valueCents: 5_000,
    }),
    entry({ id: "cancel", status: "cancelado", valueCents: 99_000 }),
  ];

  it("uses one canonical recut for KPI, balance and forecast totals", () => {
    expect(buildFinanceSummary(entries)).toEqual({
      effectiveRevenue: 20_000,
      effectiveExpense: 5_000,
      expectedRevenue: 10_000,
      expectedExpense: 0,
      effectiveBalance: 15_000,
      predictedBalance: 25_000,
    });
  });

  it("applies table filters without changing the canonical records", () => {
    expect(
      filterFinanceEntries(entries, {
        type: "receita",
        status: "pendentes",
        query: "ana",
      }).map((item) => item.id),
    ).toEqual(["r2"]);
    expect(entries).toHaveLength(4);
  });

  it("feeds flow, monthly balance and category charts from the same entries", () => {
    expect(financeCategoryTotals(entries, "despesa")).toEqual([
      { name: "Aluguel", value: 5_000 },
    ]);
    expect(financeMonthlySeries(entries, 2026)[8]).toMatchObject({
      month: 9,
      effectiveBalance: 15_000,
      predictedBalance: 25_000,
    });
  });
});
