import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { snapshot } from "@/services/finance/finance-entries";
import { removeAppointmentFromGoogleCalendar } from "@/services/integrations/google-calendar";

export async function cancelAppointment(userId: string, appointmentId: string) {
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId },
    include: { financeEntry: true },
  });
  if (!existing) throw new DomainError("NOT_FOUND", "Consulta não encontrada.");
  if (existing.status === "cancelada") {
    let calendarRemoved = false;
    try {
      calendarRemoved = (
        await removeAppointmentFromGoogleCalendar(
          userId,
          existing.googleCalendarEventId,
        )
      ).removed;
    } catch {
      calendarRemoved = false;
    }
    return { appointment: existing, calendarRemoved };
  }
  if (existing.sessionStartedAt || existing.sessionEndedAt || existing.status === "realizada") {
    throw new DomainError("VALIDATION", "Uma sessão iniciada ou realizada não pode ser cancelada.");
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const canceled = await tx.appointment.update({
      where: { id: existing.id },
      data: { status: "cancelada" },
    });
    if (existing.financeEntry && existing.financeEntry.status === "previsto") {
      const entry = await tx.financeEntry.update({
        where: { id: existing.financeEntry.id },
        data: { status: "cancelado", canceledAt: new Date() },
      });
      await tx.financeEntryEvent.create({
        data: {
          userId,
          entryId: entry.id,
          type: "canceled",
          beforeState: snapshot(existing.financeEntry),
          afterState: snapshot(entry),
        },
      });
    }
    return canceled;
  });

  let calendarRemoved = false;
  try {
    calendarRemoved = (
      await removeAppointmentFromGoogleCalendar(
        userId,
        existing.googleCalendarEventId,
      )
    ).removed;
  } catch {
    calendarRemoved = false;
  }
  return { appointment, calendarRemoved };
}
