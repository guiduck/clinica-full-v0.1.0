import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appointmentSchema } from "@/utils/validators/appointment";

function futureIso(minutesFromNow: number) {
  return new Date(Date.now() + minutesFromNow * 60_000).toISOString();
}

describe("appointment validation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("requires patient and valid date range", () => {
    const result = appointmentSchema.safeParse({
      patientId: "",
      startsAt: futureIso(60),
      endsAt: futureIso(30)
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail");
    }
    expect(result.error.flatten().fieldErrors.patientId).toContain("Selecione um paciente.");
    expect(result.error.flatten().fieldErrors.endsAt).toContain("O fim deve ser depois do inicio.");
  });

  it("rejects past appointment starts", () => {
    const result = appointmentSchema.safeParse({
      patientId: "patient-1",
      startsAt: new Date(Date.now() - 60_000).toISOString(),
      endsAt: futureIso(30)
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail");
    }
    expect(result.error.flatten().fieldErrors.startsAt).toContain("A consulta não pode ser criada no passado.");
  });

  it("accepts a future appointment", () => {
    const result = appointmentSchema.safeParse({
      patientId: "patient-1",
      startsAt: futureIso(60),
      endsAt: futureIso(120)
    });

    expect(result.success).toBe(true);
  });
});
