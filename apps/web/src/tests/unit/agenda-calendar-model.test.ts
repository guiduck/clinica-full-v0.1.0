import { describe, expect, it } from "vitest";
import {
  agendaDateKey,
  agendaVisibleDays,
  appointmentGridPosition,
  shiftAgendaReferenceDate,
  startOfAgendaWeek,
} from "@/components/appointments/agenda-calendar-model";

describe("agenda calendar model", () => {
  it("builds canonical day, week and month ranges", () => {
    const reference = new Date(2026, 8, 2, 12);
    expect(agendaVisibleDays(reference, "dia").map(agendaDateKey)).toEqual([
      "2026-09-02",
    ]);
    expect(agendaVisibleDays(reference, "semana").map(agendaDateKey)).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
    ]);
    expect(agendaVisibleDays(reference, "mes")).toHaveLength(42);
  });

  it("navigates each view by its canonical period", () => {
    const reference = new Date(2026, 8, 2, 12);
    expect(agendaDateKey(shiftAgendaReferenceDate(reference, "dia", 1))).toBe(
      "2026-09-03",
    );
    expect(
      agendaDateKey(shiftAgendaReferenceDate(reference, "semana", -1)),
    ).toBe("2026-08-26");
    expect(agendaDateKey(shiftAgendaReferenceDate(reference, "mes", 1))).toBe(
      "2026-10-02",
    );
  });

  it("positions appointments by local wall-clock time with a minimum height", () => {
    expect(
      appointmentGridPosition("2026-09-02T09:30:00-03:00", "2026-09-02T10:20:00-03:00"),
    ).toEqual({
      top: 608,
      height: 53.333333333333336,
    });
    expect(
      appointmentGridPosition("2026-09-02T09:00:00-03:00", "2026-09-02T09:10:00-03:00"),
    ).toEqual({
      top: 576,
      height: 34,
    });
  });

  it("normalizes week boundaries without mutating the input", () => {
    const reference = new Date(2026, 0, 1, 23, 45);
    const start = startOfAgendaWeek(reference);
    expect(agendaDateKey(start)).toBe("2025-12-28");
    expect(start.getHours()).toBe(0);
    expect(reference.getHours()).toBe(23);
  });
});
