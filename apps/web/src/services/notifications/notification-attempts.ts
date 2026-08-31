import { prisma } from "@/lib/prisma";
import { buildAppointmentConfirmationMessage } from "./appointment-confirmation-message";
import { TwilioWhatsAppSender, type WhatsAppSender } from "./whatsapp-sender";

export async function sendAppointmentConfirmation(
  userId: string,
  appointmentId: string,
  sender: WhatsAppSender = new TwilioWhatsAppSender()
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      userId
    },
    include: {
      patient: true,
      user: true,
      notifications: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const attempt = appointment.notifications[0];
  const body = buildAppointmentConfirmationMessage({
    patientName: appointment.patient.name,
    therapistName: appointment.user.name,
    startsAt: appointment.startsAt
  });
  const result = await sender.sendAppointmentConfirmationMessage({
    to: appointment.patient.normalizedPhone,
    body
  });

  if (result.ok) {
    return prisma.notificationAttempt.update({
      where: {
        id: attempt.id
      },
      data: {
        status: "enviado",
        providerMessageId: result.providerMessageId,
        sentAt: new Date(),
        failureReason: null
      }
    });
  }

  return prisma.notificationAttempt.update({
    where: {
      id: attempt.id
    },
    data: {
      status: "falhou",
      failureReason: result.failureReason
    }
  });
}
