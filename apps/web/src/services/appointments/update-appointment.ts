import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { snapshot } from "@/services/finance/finance-entries";
import { syncAppointmentToGoogleCalendar } from "@/services/integrations/google-calendar";
import type { ParsedAppointmentInput } from "@/utils/validators/appointment";
import { hasAppointmentOverlap } from "./appointments";

export async function updateAppointment(userId: string, appointmentId: string, input: ParsedAppointmentInput) {
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (startsAt < new Date()) {
    throw new DomainError("VALIDATION", "A consulta não pode ser remarcada para o passado.");
  }
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId },
    include: { patient: { select: { name: true } }, financeEntry: true },
  });
  if (!existing) throw new DomainError("NOT_FOUND", "Consulta não encontrada.");
  if (existing.patientId !== input.patientId) {
    throw new DomainError("VALIDATION", "O paciente da consulta não pode ser alterado.");
  }
  if (existing.sessionStartedAt || existing.sessionEndedAt || ["realizada", "cancelada", "recusada"].includes(existing.status)) {
    throw new DomainError("VALIDATION", "Esta consulta não pode mais ser editada.");
  }
  if (await hasAppointmentOverlap(userId, startsAt, endsAt, appointmentId)) {
    throw new DomainError("APPOINTMENT_OVERLAP", "Já existe uma consulta nesse horário.");
  }
  const timeChanged = existing.startsAt.getTime() !== startsAt.getTime() || existing.endsAt.getTime() !== endsAt.getTime();

  const updated = await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        startsAt,
        endsAt,
        type: input.type,
        videoUrl: input.videoUrl ?? null,
        status: existing.startsAt.getTime() !== startsAt.getTime() ? "remarcada" : existing.status,
      },
    });
    if (existing.financeEntry && existing.financeEntry.status !== "cancelado") {
      const entry = await tx.financeEntry.update({
        where: { id: existing.financeEntry.id },
        data: {
          description: `${input.type} — ${existing.patient.name}`,
          ...(existing.financeEntry.status === "previsto" ? { date: startsAt, dueDate: startsAt } : {}),
        },
      });
      await tx.financeEntryEvent.create({
        data: {
          userId,
          entryId: entry.id,
          type: "updated",
          beforeState: snapshot(existing.financeEntry),
          afterState: snapshot(entry),
        },
      });
    }
    return appointment;
  });

  let calendarSynced = false;
  try {
    calendarSynced = (await syncAppointmentToGoogleCalendar(userId, appointmentId)).synced;
  } catch {
    calendarSynced = false;
  }
  return { ...updated, calendarSynced, timeChanged };
}
