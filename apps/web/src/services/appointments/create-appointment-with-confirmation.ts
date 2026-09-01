import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { assertPatientFinancialReady } from "@/services/patient-financial-profiles/patient-financial-profiles";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";
import { sendAppointmentConfirmation } from "@/services/notifications/notification-attempts";
import type { ParsedAppointmentInput } from "@/utils/validators/appointment";
import { hasAppointmentOverlap } from "./appointments";

export async function createAppointmentWithConfirmation(
  userId: string,
  input: ParsedAppointmentInput,
  options?: {
    now?: Date;
  }
) {
  const now = options?.now ?? new Date();
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (startsAt < now) {
    throw new DomainError("VALIDATION", "A consulta não pode ser criada no passado.");
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: input.patientId,
      userId,
      status: "ativo"
    }
  });

  if (!patient) {
    throw new DomainError("NOT_FOUND", "Paciente não encontrado ou inativo.");
  }

  await assertPatientFinancialReady(userId, patient.id);

  if (!getWhatsAppConfig()) {
    throw new DomainError("WHATSAPP_NOT_CONFIGURED", "Configure o WhatsApp antes de criar consultas.");
  }

  if (await hasAppointmentOverlap(userId, startsAt, endsAt)) {
    throw new DomainError("APPOINTMENT_OVERLAP", "Ja existe uma consulta nesse horario.");
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const createdAppointment = await tx.appointment.create({
      data: {
        userId,
        patientId: patient.id,
        startsAt,
        endsAt
      }
    });

    await tx.notificationAttempt.create({
      data: {
        userId,
        patientId: patient.id,
        appointmentId: createdAppointment.id,
        recipientPhone: patient.normalizedPhone,
        status: "pendente"
      }
    });

    return createdAppointment;
  });

  await sendAppointmentConfirmation(userId, appointment.id);

  return appointment;
}
