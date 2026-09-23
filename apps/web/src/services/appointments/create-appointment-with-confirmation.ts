import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { assertPatientFinancialReady } from "@/services/patient-financial-profiles/patient-financial-profiles";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";
import { buildAppointmentConfirmationMessage } from "@/services/notifications/appointment-confirmation-message";
import { buildAppointmentReminderMessage } from "@/services/notifications/appointment-reminder-message";
import {
  createScheduledMessage,
  enqueueCommittedMessages,
} from "@/services/messages/scheduled-messages";
import type { ParsedAppointmentInput } from "@/utils/validators/appointment";
import { createAppointmentFinanceEntry } from "@/services/finance/finance-entries";
import { hasAppointmentOverlap } from "./appointments";
import { syncAppointmentToGoogleCalendar } from "@/services/integrations/google-calendar";

export async function createAppointmentWithConfirmation(
  userId: string,
  input: Omit<ParsedAppointmentInput, "type" | "recurrenceCount"> & {
    type?: string;
    recurrenceCount?: number;
  },
  options?: {
    now?: Date;
  },
) {
  const now = options?.now ?? new Date();
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  const recurrenceCount = input.recurrenceCount ?? 1;
  const recurrenceGroupId = recurrenceCount > 1 ? randomUUID() : null;
  const occurrences = Array.from({ length: recurrenceCount }, (_, index) => ({
    index,
    startsAt: new Date(startsAt.getTime() + index * 7 * 24 * 60 * 60 * 1000),
    endsAt: new Date(endsAt.getTime() + index * 7 * 24 * 60 * 60 * 1000),
  }));

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
    include: { user: { select: { name: true } } },
  });

  if (!patient) {
    throw new DomainError("NOT_FOUND", "Paciente não encontrado ou inativo.");
  }

  const financialProfile = await assertPatientFinancialReady(userId, patient.id);

  const notificationScheduled =
    Boolean(getWhatsAppConfig()) && patient.whatsappConsent;

  for (const occurrence of occurrences) {
    if (await hasAppointmentOverlap(userId, occurrence.startsAt, occurrence.endsAt)) {
      throw new DomainError(
        "APPOINTMENT_OVERLAP",
        `Já existe uma consulta no horário de ${occurrence.startsAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.`,
      );
    }
  }

  const transactionResult = await prisma.$transaction(async (tx) => {
    const created = [];
    const queued: Array<{ id: string; scheduledFor: Date }> = [];
    for (const occurrence of occurrences) {
      const createdAppointment = await tx.appointment.create({
        data: {
          userId,
          patientId: patient.id,
          startsAt: occurrence.startsAt,
          endsAt: occurrence.endsAt,
          type: input.type ?? "Consulta",
          videoUrl: input.videoUrl ?? null,
          recurrenceGroupId,
          recurrenceIndex: recurrenceGroupId ? occurrence.index + 1 : null,
          recurrenceCount: recurrenceGroupId ? recurrenceCount : null,
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
        date: occurrence.startsAt,
      });
      created.push(createdAppointment);

      if (notificationScheduled && occurrence.index === 0) {
        const attempt = await tx.notificationAttempt.create({
          data: {
            userId,
            patientId: patient.id,
            appointmentId: createdAppointment.id,
            recipientPhone: patient.normalizedPhone,
            status: "pendente",
          },
        });
        const confirmation = await createScheduledMessage(tx, {
          userId,
          patientId: patient.id,
          appointmentId: createdAppointment.id,
          notificationAttemptId: attempt.id,
          channel: "whatsapp",
          purpose: "appointment_confirmation",
          recipientAddress: patient.normalizedPhone,
          bodyText: buildAppointmentConfirmationMessage({
            patientName: patient.name,
            therapistName: patient.user.name,
            startsAt: occurrence.startsAt,
          }),
          scheduledFor: now,
          provider: "twilio",
          dedupeKey: `appointment-confirmation:${createdAppointment.id}`,
        });
        queued.push(confirmation);
      }

      const reminderAt = new Date(
        occurrence.startsAt.getTime() - 24 * 60 * 60 * 1000,
      );
      if (notificationScheduled && reminderAt > now) {
        const reminder = await createScheduledMessage(tx, {
          userId,
          patientId: patient.id,
          appointmentId: createdAppointment.id,
          channel: "whatsapp",
          purpose: "appointment_reminder",
          recipientAddress: patient.normalizedPhone,
          bodyText: buildAppointmentReminderMessage({
            patientName: patient.name,
            therapistName: patient.user.name,
            startsAt: occurrence.startsAt,
          }),
          scheduledFor: reminderAt,
          provider: "twilio",
          dedupeKey: `appointment-reminder:${createdAppointment.id}`,
        });
        queued.push(reminder);
      }
    }
    return { appointments: created, scheduledMessages: queued };
  });

  const appointments = transactionResult.appointments;
  const firstAppointment = appointments[0];
  if (!firstAppointment) throw new DomainError("VALIDATION", "Nenhuma consulta foi criada.");
  await enqueueCommittedMessages(transactionResult.scheduledMessages);

  let calendarSyncedCount = 0;
  for (let index = 0; index < appointments.length; index += 5) {
    const batch = appointments.slice(index, index + 5);
    const results = await Promise.allSettled(batch.map((appointment) => syncAppointmentToGoogleCalendar(userId, appointment.id)));
    calendarSyncedCount += results.filter((result) => result.status === "fulfilled" && result.value.synced).length;
  }

  return {
    ...firstAppointment,
    appointments,
    createdCount: appointments.length,
    notificationScheduled,
    calendarSynced: calendarSyncedCount === appointments.length,
    calendarSyncedCount,
  };
}
