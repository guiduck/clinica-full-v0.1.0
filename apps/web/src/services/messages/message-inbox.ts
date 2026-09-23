import { prisma } from "@/lib/prisma";
import type { MessageInboxView } from "@/types/messages";

export async function getMessageInbox(userId: string): Promise<MessageInboxView> {
  const [messages, scheduled] = await Promise.all([
    prisma.conversationMessage.findMany({
      where: { userId },
      include: { patient: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 200,
    }),
    prisma.scheduledMessage.findMany({
      where: {
        userId,
        status: { in: ["queued", "processing", "failed"] },
      },
      include: { patient: { select: { name: true } } },
      orderBy: { scheduledFor: "asc" },
      take: 100,
    }),
  ]);

  return {
    messages: messages.map((message) => ({
      id: message.id,
      patientId: message.patientId,
      patientName: message.patient.name,
      channel: message.channel,
      direction: message.direction,
      status: message.status,
      body: message.body,
      occurredAt: message.occurredAt.toISOString(),
    })),
    scheduled: scheduled.map((message) => ({
      id: message.id,
      patientId: message.patientId,
      patientName: message.patient.name,
      channel: message.channel,
      purpose: message.purpose,
      status: message.status,
      subject: message.subject,
      body: message.bodyText,
      scheduledFor: message.scheduledFor.toISOString(),
      lastError: message.lastError,
    })),
  };
}

export async function getScheduledMessageSummary(userId: string) {
  return prisma.scheduledMessage.findMany({
    where: { userId, status: { in: ["queued", "processing", "failed"] } },
    include: { patient: { select: { name: true } } },
    orderBy: { scheduledFor: "asc" },
    take: 5,
  });
}
