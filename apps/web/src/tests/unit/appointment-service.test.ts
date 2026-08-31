import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { createAppointmentWithConfirmation } from "@/services/appointments/create-appointment-with-confirmation";

const prismaMock = vi.hoisted(() => ({
  patient: {
    findFirst: vi.fn()
  },
  $transaction: vi.fn()
}));
const financialReadyMock = vi.hoisted(() => vi.fn());
const whatsappConfigMock = vi.hoisted(() => vi.fn());
const overlapMock = vi.hoisted(() => vi.fn());
const sendConfirmationMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("@/services/patient-financial-profiles/patient-financial-profiles", () => ({
  assertPatientFinancialReady: financialReadyMock
}));

vi.mock("@/services/notifications/whatsapp-config", () => ({
  getWhatsAppConfig: whatsappConfigMock
}));

vi.mock("@/services/notifications/notification-attempts", () => ({
  sendAppointmentConfirmation: sendConfirmationMock
}));

vi.mock("@/services/appointments/appointments", () => ({
  hasAppointmentOverlap: overlapMock
}));

describe("appointment service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.patient.findFirst.mockResolvedValue({
      id: "patient-1",
      normalizedPhone: "5511999999999"
    });
    financialReadyMock.mockResolvedValue({ id: "profile-1", isComplete: true });
    whatsappConfigMock.mockReturnValue({
      accountSid: "AC123",
      authToken: "secret",
      from: "whatsapp:+14155238886"
    });
    overlapMock.mockResolvedValue(false);
    sendConfirmationMock.mockResolvedValue({ id: "notification-1" });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        appointment: {
          create: vi.fn().mockResolvedValue({ id: "appointment-1" })
        },
        notificationAttempt: {
          create: vi.fn().mockResolvedValue({ id: "notification-1" })
        }
      })
    );
  });

  it("creates appointment and starts notification lifecycle", async () => {
    const appointment = await createAppointmentWithConfirmation(
      "user-1",
      {
        patientId: "patient-1",
        startsAt: "2026-06-10T12:00:00.000Z",
        endsAt: "2026-06-10T13:00:00.000Z"
      },
      { now: new Date("2026-06-01T12:00:00.000Z") }
    );

    expect(appointment).toEqual({ id: "appointment-1" });
    expect(sendConfirmationMock).toHaveBeenCalledWith("user-1", "appointment-1");
  });

  it("blocks inactive or foreign patients", async () => {
    prismaMock.patient.findFirst.mockResolvedValue(null);

    await expect(
      createAppointmentWithConfirmation(
        "user-1",
        {
          patientId: "patient-2",
          startsAt: "2026-06-10T12:00:00.000Z",
          endsAt: "2026-06-10T13:00:00.000Z"
        },
        { now: new Date("2026-06-01T12:00:00.000Z") }
      )
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("blocks missing financial profile and missing WhatsApp configuration", async () => {
    financialReadyMock.mockRejectedValueOnce(new DomainError("PAYMENT_PROFILE_INCOMPLETE", "Financeiro pendente."));

    await expect(
      createAppointmentWithConfirmation(
        "user-1",
        {
          patientId: "patient-1",
          startsAt: "2026-06-10T12:00:00.000Z",
          endsAt: "2026-06-10T13:00:00.000Z"
        },
        { now: new Date("2026-06-01T12:00:00.000Z") }
      )
    ).rejects.toBeInstanceOf(DomainError);

    financialReadyMock.mockResolvedValue({ id: "profile-1", isComplete: true });
    whatsappConfigMock.mockReturnValueOnce(null);

    await expect(
      createAppointmentWithConfirmation(
        "user-1",
        {
          patientId: "patient-1",
          startsAt: "2026-06-10T12:00:00.000Z",
          endsAt: "2026-06-10T13:00:00.000Z"
        },
        { now: new Date("2026-06-01T12:00:00.000Z") }
      )
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("blocks overlapping appointments", async () => {
    overlapMock.mockResolvedValue(true);

    await expect(
      createAppointmentWithConfirmation(
        "user-1",
        {
          patientId: "patient-1",
          startsAt: "2026-06-10T12:00:00.000Z",
          endsAt: "2026-06-10T13:00:00.000Z"
        },
        { now: new Date("2026-06-01T12:00:00.000Z") }
      )
    ).rejects.toBeInstanceOf(DomainError);
  });
});
