import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function materializeOperationalNotifications(userId: string, now = new Date()) {
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const [patients, overdueEntries, appointments] = await Promise.all([
    prisma.patient.findMany({
      where: { userId, status: "ativo", birthDate: { not: null } },
      select: { id: true, name: true, birthDate: true },
    }),
    prisma.financeEntry.findMany({
      where: { userId, type: "receita", status: "previsto", dueDate: { lt: today } },
      select: { id: true, description: true, dueDate: true, patientId: true, patient: { select: { name: true } } },
      take: 50,
    }),
    prisma.appointment.findMany({
      where: { userId, startsAt: { gte: tomorrow, lt: dayAfterTomorrow }, status: { in: ["agendada", "confirmada", "remarcada"] } },
      select: { id: true, startsAt: true, patientId: true, patient: { select: { name: true } } },
    }),
  ]);

  const year = today.getFullYear();
  const birthdayRows = patients
    .filter((patient) => patient.birthDate?.getUTCDate() === today.getDate() && patient.birthDate.getUTCMonth() === today.getMonth())
    .map((patient) => ({
      userId,
      patientId: patient.id,
      type: "birthday" as const,
      title: `Aniversário de ${patient.name}`,
      description: "Envie uma mensagem de felicitações ao paciente.",
      href: `/mensagens?patientId=${encodeURIComponent(patient.id)}`,
      dedupeKey: `birthday:${patient.id}:${year}`,
    }));
  const paymentRows = overdueEntries.map((entry) => ({
    userId,
    patientId: entry.patientId,
    type: "payment" as const,
    title: "Receita vencida",
    description: `${entry.patient?.name ?? entry.description} possui um pagamento em atraso.`,
    href: "/financeiro?tab=receitas&status=previsto",
    dedupeKey: `payment-overdue:${entry.id}`,
  }));
  const appointmentRows = appointments.map((appointment) => ({
    userId,
    patientId: appointment.patientId,
    type: "appointment" as const,
    title: "Atendimento amanhã",
    description: `${appointment.patient.name} às ${appointment.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`,
    href: `/agenda?date=${appointment.startsAt.toISOString().slice(0, 10)}&open=${encodeURIComponent(appointment.id)}`,
    dedupeKey: `appointment-tomorrow:${appointment.id}`,
  }));
  const rows = [...birthdayRows, ...paymentRows, ...appointmentRows];
  if (rows.length) await prisma.appNotification.createMany({ data: rows, skipDuplicates: true });
}

export async function markAppNotificationRead(userId: string, notificationId: string) {
  await prisma.appNotification.updateMany({ where: { id: notificationId, userId }, data: { readAt: new Date() } });
}
