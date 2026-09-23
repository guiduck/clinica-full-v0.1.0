import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { createAppointmentWithConfirmation } from "@/services/appointments/create-appointment-with-confirmation";

const prismaMock = vi.hoisted(() => ({
  patient: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}));
const financialReadyMock = vi.hoisted(() => vi.fn());
const whatsappConfigMock = vi.hoisted(() => vi.fn());
const overlapMock = vi.hoisted(() => vi.fn());
const createScheduledMessageMock = vi.hoisted(() => vi.fn());
const enqueueCommittedMessagesMock = vi.hoisted(() => vi.fn());
const appointmentCreateMock = vi.hoisted(() => vi.fn());
const notificationCreateMock = vi.hoisted(() => vi.fn());
const financeEntryCreateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock(
  "@/services/patient-financial-profiles/patient-financial-profiles",
  () => ({
    assertPatientFinancialReady: financialReadyMock,
  }),
);

vi.mock("@/services/notifications/whatsapp-config", () => ({
  getWhatsAppConfig: whatsappConfigMock,
}));

vi.mock("@/services/messages/scheduled-messages", () => ({
  createScheduledMessage: createScheduledMessageMock,
  enqueueCommittedMessages: enqueueCommittedMessagesMock,
}));

vi.mock("@/services/appointments/appointments", () => ({
  hasAppointmentOverlap: overlapMock,
}));

vi.mock("@/services/finance/finance-entries", () => ({
  createAppointmentFinanceEntry: financeEntryCreateMock,
}));

vi.mock("@/services/integrations/google-calendar", () => ({
  syncAppointmentToGoogleCalendar: vi.fn().mockResolvedValue({ synced: false }),
}));

describe("appointment service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.patient.findFirst.mockResolvedValue({
      id: "patient-1",
      name: "Ana",
      normalizedPhone: "5511999999999",
      whatsappConsent: true,
      user: { name: "Dra. Joana" },
    });
    financialReadyMock.mockResolvedValue({
      id: "profile-1",
      isComplete: true,
      preferredPaymentMethod: "pix",
      defaultSessionPriceCents: 15000,
    });
    whatsappConfigMock.mockReturnValue({
      accountSid: "AC123",
      authToken: "secret",
      from: "whatsapp:+14155238886",
    });
    overlapMock.mockResolvedValue(false);
    createScheduledMessageMock.mockImplementation(async (_tx, input) => ({ id: input.dedupeKey, scheduledFor: input.scheduledFor }));
    enqueueCommittedMessagesMock.mockResolvedValue(1);
    appointmentCreateMock.mockResolvedValue({ id: "appointment-1" });
    notificationCreateMock.mockResolvedValue({ id: "notification-1" });
    financeEntryCreateMock.mockResolvedValue({ id: "finance-1" });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        appointment: { create: appointmentCreateMock },
        notificationAttempt: { create: notificationCreateMock },
      }),
    );
  });

  it("creates appointment and starts notification lifecycle", async () => {
    const appointment = await createAppointmentWithConfirmation(
      "user-1",
      {
        patientId: "patient-1",
        startsAt: "2026-06-10T12:00:00.000Z",
        endsAt: "2026-06-10T13:00:00.000Z",
      },
      { now: new Date("2026-06-01T12:00:00.000Z") },
    );

    expect(appointment).toEqual(expect.objectContaining({
      id: "appointment-1",
      notificationScheduled: true,
      calendarSynced: false,
      createdCount: 1,
    }));
    expect(notificationCreateMock).toHaveBeenCalledOnce();
    expect(financeEntryCreateMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        appointmentId: "appointment-1",
        patientId: "patient-1",
        valueCents: 15000,
      }),
    );
    expect(createScheduledMessageMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ purpose: "appointment_confirmation", appointmentId: "appointment-1" }),
    );
    expect(enqueueCommittedMessagesMock).toHaveBeenCalledOnce();
  });

  it("creates every weekly occurrence and its finance entry atomically", async () => {
    appointmentCreateMock
      .mockResolvedValueOnce({ id: "appointment-1" })
      .mockResolvedValueOnce({ id: "appointment-2" })
      .mockResolvedValueOnce({ id: "appointment-3" });

    const appointment = await createAppointmentWithConfirmation(
      "user-1",
      {
        patientId: "patient-1",
        startsAt: "2026-06-10T12:00:00.000Z",
        endsAt: "2026-06-10T13:00:00.000Z",
        recurrenceCount: 3,
      },
      { now: new Date("2026-06-01T12:00:00.000Z") },
    );

    expect(appointment.createdCount).toBe(3);
    expect(appointmentCreateMock).toHaveBeenCalledTimes(3);
    expect(financeEntryCreateMock).toHaveBeenCalledTimes(3);
    expect(overlapMock).toHaveBeenCalledTimes(3);
    expect(appointmentCreateMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: expect.objectContaining({
          startsAt: new Date("2026-06-24T12:00:00.000Z"),
          recurrenceIndex: 3,
          recurrenceCount: 3,
        }),
      }),
    );
    expect(notificationCreateMock).toHaveBeenCalledOnce();
    expect(createScheduledMessageMock).toHaveBeenCalledTimes(4);
    expect(enqueueCommittedMessagesMock).toHaveBeenCalledOnce();
  });

  it("blocks inactive or foreign patients", async () => {
    prismaMock.patient.findFirst.mockResolvedValue(null);

    await expect(
      createAppointmentWithConfirmation(
        "user-1",
        {
          patientId: "patient-2",
          startsAt: "2026-06-10T12:00:00.000Z",
          endsAt: "2026-06-10T13:00:00.000Z",
        },
        { now: new Date("2026-06-01T12:00:00.000Z") },
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("blocks a missing financial profile", async () => {
    financialReadyMock.mockRejectedValueOnce(
      new DomainError("PAYMENT_PROFILE_INCOMPLETE", "Financeiro pendente."),
    );

    await expect(
      createAppointmentWithConfirmation(
        "user-1",
        {
          patientId: "patient-1",
          startsAt: "2026-06-10T12:00:00.000Z",
          endsAt: "2026-06-10T13:00:00.000Z",
        },
        { now: new Date("2026-06-01T12:00:00.000Z") },
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("creates the appointment without scheduling messages when WhatsApp is unavailable", async () => {
    whatsappConfigMock.mockReturnValue(null);

    const appointment = await createAppointmentWithConfirmation(
      "user-1",
      {
        patientId: "patient-1",
        startsAt: "2026-06-10T12:00:00.000Z",
        endsAt: "2026-06-10T13:00:00.000Z",
      },
      { now: new Date("2026-06-01T12:00:00.000Z") },
    );

    expect(appointment).toEqual(expect.objectContaining({
      id: "appointment-1",
      notificationScheduled: false,
      calendarSynced: false,
      createdCount: 1,
    }));
    expect(notificationCreateMock).not.toHaveBeenCalled();
    expect(createScheduledMessageMock).not.toHaveBeenCalled();
  });

  it("blocks overlapping appointments", async () => {
    overlapMock.mockResolvedValue(true);

    await expect(
      createAppointmentWithConfirmation(
        "user-1",
        {
          patientId: "patient-1",
          startsAt: "2026-06-10T12:00:00.000Z",
          endsAt: "2026-06-10T13:00:00.000Z",
        },
        { now: new Date("2026-06-01T12:00:00.000Z") },
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
