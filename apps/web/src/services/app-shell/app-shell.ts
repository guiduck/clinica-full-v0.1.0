import { prisma } from "@/lib/prisma";
import type { AppShellView } from "@/types/app-shell";
import { formatBrazilianDate, formatTime24 } from "@/utils/formatters";

export async function getAppShellView(userId: string): Promise<AppShellView> {
  const attempts = await prisma.notificationAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, status: true, createdAt: true, patient: { select: { name: true } }, appointment: { select: { id: true, startsAt: true } } }
  });

  return {
    pendingMessageCount: attempts.filter((attempt) => attempt.status === "pendente").length,
    notifications: attempts.map((attempt) => ({
      id: attempt.id,
      title: attempt.status === "enviado" ? "Confirmação enviada" : attempt.status === "falhou" ? "Falha no envio da confirmação" : "Confirmação aguardando envio",
      description: `${attempt.patient.name} · ${formatBrazilianDate(attempt.appointment.startsAt)} às ${formatTime24(attempt.appointment.startsAt)}`,
      href: `/agenda?open=${encodeURIComponent(attempt.appointment.id)}`,
      createdAt: attempt.createdAt.toISOString()
    }))
  };
}
