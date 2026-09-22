import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { encryptSensitiveValue } from "@/lib/security/encryption";
import { parseBrazilianDate } from "@/utils/normalizers";
import type { EvolutionDraft } from "@/utils/validators/clinical-drafts";

export async function listAppointments(userId: string) {
  return prisma.appointment.findMany({
    where: {
      userId
    },
    orderBy: {
      startsAt: "asc"
    },
    include: {
      patient: true,
      notifications: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    },
    take: 100
  });
}

export async function hasAppointmentOverlap(userId: string, startsAt: Date, endsAt: Date, excludeId?: string) {
  const overlap = await prisma.appointment.findFirst({
    where: {
      userId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startsAt: {
        lt: endsAt
      },
      endsAt: {
        gt: startsAt
      }
    },
    select: {
      id: true
    }
  });

  return Boolean(overlap);
}

export async function startAppointmentSession(userId: string, appointmentId: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId },
    select: { id: true, sessionStartedAt: true, status: true },
  });

  if (!appointment) {
    throw new DomainError("NOT_FOUND", "Consulta não encontrada.");
  }

  if (["cancelada", "recusada"].includes(appointment.status)) {
    throw new DomainError("VALIDATION", "Esta consulta não pode ser iniciada.");
  }

  if (appointment.sessionStartedAt) return appointment;

  return prisma.appointment.update({
    where: { id: appointment.id },
    data: { sessionStartedAt: new Date() },
    select: { id: true, sessionStartedAt: true, status: true },
  });
}

export async function finishAppointmentSession(
  userId: string,
  appointmentId: string,
  draft: EvolutionDraft,
) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId },
    select: { id: true, patientId: true, sessionStartedAt: true },
  });

  if (!appointment) {
    throw new DomainError("NOT_FOUND", "Consulta não encontrada.");
  }

  const date = parseBrazilianDate(draft.date);
  if (!date) throw new DomainError("VALIDATION", "Informe uma data válida.");
  const isoDate = date.toISOString().slice(0, 10);
  const occurredAt = new Date(`${isoDate}T${draft.time}:00-03:00`);
  const encryptedPayload = encryptSensitiveValue({
    free: draft.free,
    subjective: draft.subjective,
    objective: draft.objective,
    assessment: draft.assessment,
    plan: draft.plan,
  });
  const endedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const evolution = await tx.clinicalEvolution.upsert({
      where: { appointmentId },
      update: { occurredAt, mood: draft.mood, encryptedPayload },
      create: {
        userId,
        patientId: appointment.patientId,
        appointmentId,
        occurredAt,
        mood: draft.mood,
        encryptedPayload,
      },
    });
    await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "realizada",
        sessionStartedAt: appointment.sessionStartedAt ?? endedAt,
        sessionEndedAt: endedAt,
      },
    });
    return { evolution, patientId: appointment.patientId };
  });
}
