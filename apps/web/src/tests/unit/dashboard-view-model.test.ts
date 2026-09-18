import { describe, expect, it } from "vitest";
import {
  buildDashboardFinanceViewModel,
  buildDashboardViewModel,
  dashboardFinanceMonthHref,
} from "@/components/dashboard/dashboard-view-model";
import type { FinanceEntryView } from "@/types/finance";

describe("dashboard view model", () => {
  it("derives active patients and ordered appointment buckets from real records", () => {
    const now = new Date(2026, 8, 1, 8);
    const model = buildDashboardViewModel(
      [
        { id: "p1", name: "Ana", status: "ativo" },
        { id: "p2", name: "Bia", status: "inativo" },
      ],
      [
        {
          id: "later",
          patientId: "p1",
          patientName: "Ana",
          startsAt: "2026-09-02T11:00:00",
          endsAt: "2026-09-02T11:50:00",
          status: "agendada",
        },
        {
          id: "today",
          patientId: "p1",
          patientName: "Ana",
          startsAt: "2026-09-01T09:00:00",
          endsAt: "2026-09-01T09:50:00",
          status: "agendada",
        },
        {
          id: "cancelled",
          patientId: "p2",
          patientName: "Bia",
          startsAt: "2026-09-01T10:00:00",
          endsAt: "2026-09-01T10:50:00",
          status: "cancelada",
        },
      ],
      now,
    );
    expect(model.activePatientCount).toBe(1);
    expect(model.todayCount).toBe(1);
    expect(model.tomorrowCount).toBe(1);
    expect(model.upcoming.map((item) => item.id)).toEqual(["today", "later"]);
  });

  it("returns stable empty buckets and a contextual finance link", () => {
    expect(buildDashboardViewModel([], [], new Date(2026, 8, 1))).toMatchObject(
      {
        activePatientCount: 0,
        todayCount: 0,
        tomorrowCount: 0,
        upcoming: [],
      },
    );
    expect(dashboardFinanceMonthHref(2026, 2)).toBe(
      "/financeiro?period=custom&from=01/02/2026&to=28/02/2026",
    );
  });
});

describe("dashboard finance view model", () => {
  it("derives visible totals and series from canonical finance entries", () => {
    const entries: FinanceEntryView[] = [{
      id: "revenue",
      appointmentId: "appointment",
      patientId: "patient",
      patientName: "Ana",
      description: "Sessão",
      category: "Avulso",
      type: "receita",
      paymentMethod: "pix",
      status: "efetivado",
      valueCents: 15_000,
      date: "2026-09-01T12:00:00",
      dueDate: "2026-09-01T12:00:00",
    }];
    const result = buildDashboardFinanceViewModel(
      entries,
      "6m",
      new Date("2026-09-10T12:00:00"),
    );
    expect(result.summary.effectiveRevenue).toBe(15_000);
    expect(result.series).toHaveLength(6);
    expect(result.series.at(-1)).toMatchObject({
      key: "2026-09",
      saldo: 150,
    });
  });
});
