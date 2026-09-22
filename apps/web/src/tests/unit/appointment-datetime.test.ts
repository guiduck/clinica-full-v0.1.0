import { describe, expect, it } from "vitest";
import { brazilianAppointmentDateTime, saoPauloAppointmentParts } from "@/utils/appointment-datetime";

describe("appointment timezone", () => {
  it("converts Brazilian wall time to an unambiguous São Paulo instant", () => {
    const value = brazilianAppointmentDateTime("19/09/2026", "09:00");
    expect(value).toBe("2026-09-19T09:00:00-03:00");
    expect(new Date(value).toISOString()).toBe("2026-09-19T12:00:00.000Z");
    expect(saoPauloAppointmentParts(value)).toEqual({ date: "2026-09-19", hour: 9, minute: 0 });
  });

  it("rejects incomplete dates before they reach the server", () => {
    expect(brazilianAppointmentDateTime("19/09", "09:00")).toBe("");
  });
});
