import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { cancelAppointment } from "@/services/appointments/cancel-appointment";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  transaction: vi.fn(),
  appointmentUpdate: vi.fn(),
  financeUpdate: vi.fn(),
  financeEventCreate: vi.fn(),
  removeGoogle: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { findFirst: mocks.findFirst },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/services/finance/finance-entries", () => ({
  snapshot: () => ({ status: "snapshot" }),
}));
vi.mock("@/services/integrations/google-calendar", () => ({
  removeAppointmentFromGoogleCalendar: mocks.removeGoogle,
}));

const appointment = {
  id: "appointment-1",
  userId: "user-1",
  patientId: "patient-1",
  status: "agendada",
  sessionStartedAt: null,
  sessionEndedAt: null,
  googleCalendarEventId: "google-1",
  financeEntry: { id: "finance-1", status: "previsto" },
};

describe("cancel appointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findFirst.mockResolvedValue(appointment);
    mocks.appointmentUpdate.mockResolvedValue({ ...appointment, status: "cancelada" });
    mocks.financeUpdate.mockResolvedValue({ ...appointment.financeEntry, status: "cancelado" });
    mocks.financeEventCreate.mockResolvedValue({ id: "event-1" });
    mocks.transaction.mockImplementation(async (callback) => callback({
      appointment: { update: mocks.appointmentUpdate },
      financeEntry: { update: mocks.financeUpdate },
      financeEntryEvent: { create: mocks.financeEventCreate },
    }));
    mocks.removeGoogle.mockResolvedValue({ removed: true });
  });

  it("cancels the appointment and predicted revenue atomically", async () => {
    const result = await cancelAppointment("user-1", "appointment-1");
    expect(result.calendarRemoved).toBe(true);
    expect(mocks.appointmentUpdate).toHaveBeenCalledWith({
      where: { id: "appointment-1" },
      data: { status: "cancelada" },
    });
    expect(mocks.financeUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "cancelado" }),
    }));
    expect(mocks.financeEventCreate).toHaveBeenCalledOnce();
    expect(mocks.removeGoogle).toHaveBeenCalledWith("user-1", "google-1");
  });

  it("rejects cancellation after a session has started", async () => {
    mocks.findFirst.mockResolvedValueOnce({
      ...appointment,
      sessionStartedAt: new Date(),
    });
    await expect(cancelAppointment("user-1", "appointment-1"))
      .rejects.toBeInstanceOf(DomainError);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
