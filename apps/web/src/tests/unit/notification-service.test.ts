import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildAppointmentConfirmationMessage } from "@/services/notifications/appointment-confirmation-message";
import { sendAppointmentConfirmation } from "@/services/notifications/notification-attempts";
import type { WhatsAppSender } from "@/services/notifications/whatsapp-sender";

const prismaMock = vi.hoisted(() => ({
  appointment: {
    findFirst: vi.fn()
  },
  notificationAttempt: {
    update: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

const appointment = {
  id: "appointment-1",
  startsAt: new Date("2026-06-10T12:00:00.000Z"),
  patient: {
    name: "Maria",
    normalizedPhone: "5511999999999"
  },
  user: {
    name: "Dra Ana"
  },
  notifications: [{ id: "notification-1" }]
};

describe("notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.appointment.findFirst.mockResolvedValue(appointment);
  });

  it("builds transactional Portuguese confirmation copy", () => {
    const message = buildAppointmentConfirmationMessage({
      patientName: "Maria",
      therapistName: "Dra Ana",
      startsAt: appointment.startsAt
    });

    expect(message).toContain("Olá, Maria.");
    expect(message).toContain("Dra Ana");
    expect(message).toContain("Responda apenas sim ou não");
  });

  it("moves pending notification to sent on provider success", async () => {
    const sender: WhatsAppSender = {
      sendAppointmentConfirmationMessage: vi.fn().mockResolvedValue({
        ok: true,
        providerMessageId: "twilio-1"
      })
    };
    prismaMock.notificationAttempt.update.mockResolvedValue({ id: "notification-1", status: "enviado" });

    await sendAppointmentConfirmation("user-1", "appointment-1", sender);

    expect(prismaMock.notificationAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "notification-1" },
        data: expect.objectContaining({
          status: "enviado",
          providerMessageId: "twilio-1",
          failureReason: null
        })
      })
    );
  });

  it("stores a safe failure reason on provider failure", async () => {
    const sender: WhatsAppSender = {
      sendAppointmentConfirmationMessage: vi.fn().mockResolvedValue({
        ok: false,
        failureReason: "Falha operacional ao enviar WhatsApp."
      })
    };

    await sendAppointmentConfirmation("user-1", "appointment-1", sender);

    expect(prismaMock.notificationAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "falhou",
          failureReason: "Falha operacional ao enviar WhatsApp."
        })
      })
    );
  });
});
