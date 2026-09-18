import { describe, expect, it } from "vitest";
import {
  APPOINTMENT_TIME_OPTIONS,
  isAppointmentTimeAfter,
  keepOrAdvanceAppointmentEnd,
} from "@/components/appointments/appointment-time-options";

describe("appointment time options", () => {
  it("uses complete ten-minute slots in 24-hour format", () => {
    expect(APPOINTMENT_TIME_OPTIONS).toHaveLength(144);
    expect(APPOINTMENT_TIME_OPTIONS[0]).toBe("00:00");
    expect(APPOINTMENT_TIME_OPTIONS.at(-1)).toBe("23:50");
  });

  it("accepts only end times strictly after the start", () => {
    expect(isAppointmentTimeAfter("17:50", "18:00")).toBe(false);
    expect(isAppointmentTimeAfter("18:00", "18:00")).toBe(false);
    expect(isAppointmentTimeAfter("18:10", "18:00")).toBe(true);
  });

  it("preserves a valid end or advances an invalid end by fifty minutes", () => {
    expect(keepOrAdvanceAppointmentEnd("09:00", "10:30")).toBe("10:30");
    expect(keepOrAdvanceAppointmentEnd("18:00", "09:50")).toBe("18:50");
    expect(keepOrAdvanceAppointmentEnd("23:50", "09:50")).toBe("");
  });
});
