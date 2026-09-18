import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { assertPatientFinancialReady } from "@/services/patient-financial-profiles/patient-financial-profiles";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";
import { sendAppointmentConfirmation } from "@/services/notifications/notification-attempts";
import type { ParsedAppointmentInput } from "@/utils/validators/appointment";
import { createAppointmentFinanceEntry } from "@/services/finance/finance-entries";
import { hasAppointmentOverlap } from "./appointments";
import { syncAppointmentToGoogleCalendar } from "@/services/integrations/google-calendar";

export async function createAppointmentWithConfirmation(
  userId: string,
  input: Omit<ParsedAppointmentInput, "type"> & { type?: string },
  options?: {
    now?: Date;
  },
) {
  const now = options?.now ?? new Date();
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (startsAt < now) {
    throw new DomainError(
      "VALIDATION",
      "A consulta não pode ser criada no passado.",
    );
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: input.patientId,
      userId,
      status: "ativo",
    },
  });

  if (!patient) {
    throw new DomainError("NOT_FOUND", "Paciente não encontrado ou inativo.");
  }

  const financialProfile = await assertPatientFinancialReady(userId, patient.id);

  const notificationScheduled = Boolean(getWhatsAppConfig());

  if (await hasAppointmentOverlap(userId, startsAt, endsAt)) {
    throw new DomainError(
      "APPOINTMENT_OVERLAP",
      "Ja existe uma consulta nesse horario.",
    );
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const createdAppointment = await tx.appointment.create({
      data: {
        userId,
        patientId: patient.id,
        startsAt,
        endsAt,
        type: input.type ?? "Consulta",
        videoUrl: input.videoUrl ?? null,
      },
    });

    await createAppointmentFinanceEntry(tx, {
      userId,
      patientId: patient.id,
      patientName: patient.name,
      appointmentId: createdAppointment.id,
      appointmentType: input.type ?? "Consulta",
      paymentMethod: financialProfile.preferredPaymentMethod,
      valueCents: financialProfile.defaultSessionPriceCents,
      date: startsAt,
    });

    if (notificationScheduled) {
      await tx.notificationAttempt.create({
        data: {
          userId,
          patientId: patient.id,
          appointmentId: createdAppointment.id,
          recipientPhone: patient.normalizedPhone,
          status: "pendente",
        },
      });
    }

    return createdAppointment;
  });

  if (notificationScheduled) {
    await sendAppointmentConfirmation(userId, appointment.id);
  }

  let calendarSynced = false;
  try {
    calendarSynced = (await syncAppointmentToGoogleCalendar(userId, appointment.id)).synced;
  } catch {
    calendarSynced = false;
  }

  return { ...appointment, notificationScheduled, calendarSynced };
}
