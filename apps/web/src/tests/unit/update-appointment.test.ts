import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { updateAppointment } from "@/services/appointments/update-appointment";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  transaction: vi.fn(),
  appointmentUpdate: vi.fn(),
  financeUpdate: vi.fn(),
  financeEventCreate: vi.fn(),
  overlap: vi.fn(),
  googleSync: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { appointment: { findFirst: mocks.findFirst }, $transaction: mocks.transaction } }));
vi.mock("@/services/appointments/appointments", () => ({ hasAppointmentOverlap: mocks.overlap }));
vi.mock("@/services/finance/finance-entries", () => ({ snapshot: () => ({ status: "test" }) }));
vi.mock("@/services/integrations/google-calendar", () => ({ syncAppointmentToGoogleCalendar: mocks.googleSync }));

const input = {
  patientId: "patient-1",
  startsAt: "2027-01-15T09:00:00-03:00",
  endsAt: "2027-01-15T09:50:00-03:00",
  type: "Sessão individual",
  videoUrl: undefined,
};

describe("update appointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findFirst.mockResolvedValue({
      id: "appointment-1",
      patientId: "patient-1",
      startsAt: new Date("2027-01-15T11:00:00.000Z"),
      status: "agendada",
      sessionStartedAt: null,
      sessionEndedAt: null,
      patient: { name: "Ana" },
      financeEntry: { id: "finance-1", status: "previsto" },
    });
    mocks.overlap.mockResolvedValue(false);
    mocks.appointmentUpdate.mockResolvedValue({ id: "appointment-1" });
    mocks.financeUpdate.mockResolvedValue({ id: "finance-1", status: "previsto" });
    mocks.financeEventCreate.mockResolvedValue({ id: "event-1" });
    mocks.transaction.mockImplementation(async (callback) => callback({
      appointment: { update: mocks.appointmentUpdate },
      financeEntry: { update: mocks.financeUpdate },
      financeEntryEvent: { create: mocks.financeEventCreate },
    }));
    mocks.googleSync.mockResolvedValue({ synced: true });
  });

  it("remarcs the appointment and its predicted revenue atomically", async () => {
    const result = await updateAppointment("user-1", "appointment-1", input);
    expect(result.calendarSynced).toBe(true);
    expect(mocks.overlap).toHaveBeenCalledWith("user-1", new Date("2027-01-15T12:00:00.000Z"), new Date("2027-01-15T12:50:00.000Z"), "appointment-1");
    expect(mocks.appointmentUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "remarcada", startsAt: new Date("2027-01-15T12:00:00.000Z") }),
    }));
    expect(mocks.financeUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ date: new Date("2027-01-15T12:00:00.000Z"), dueDate: new Date("2027-01-15T12:00:00.000Z") }),
    }));
    expect(mocks.financeEventCreate).toHaveBeenCalledOnce();
  });

  it("does not move an already effective payment when the session changes", async () => {
    mocks.findFirst.mockResolvedValueOnce({
      id: "appointment-1", patientId: "patient-1", startsAt: new Date("2027-01-15T11:00:00.000Z"), status: "agendada",
      sessionStartedAt: null, sessionEndedAt: null, patient: { name: "Ana" }, financeEntry: { id: "finance-1", status: "efetivado" },
    });
    await updateAppointment("user-1", "appointment-1", input);
    expect(mocks.financeUpdate.mock.calls[0][0].data).not.toHaveProperty("date");
  });

  it("rejects conflicts before updating any records", async () => {
    mocks.overlap.mockResolvedValueOnce(true);
    await expect(updateAppointment("user-1", "appointment-1", input)).rejects.toBeInstanceOf(DomainError);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
