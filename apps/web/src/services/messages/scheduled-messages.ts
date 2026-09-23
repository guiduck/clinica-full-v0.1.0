import { Prisma, type MessageChannel, type MessagePurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEmailConfig } from "@/services/email/email-config";
import { sendTransactionalEmail } from "@/services/email/email-sender";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";
import { TwilioWhatsAppSender } from "@/services/notifications/whatsapp-sender";
import { enqueueScheduledMessage } from "./message-queue";

type MessageDatabase = Prisma.TransactionClient | typeof prisma;

export type CreateScheduledMessageInput = Readonly<{
  userId: string;
  patientId: string;
  appointmentId?: string | null;
  notificationAttemptId?: string | null;
  channel: MessageChannel;
  purpose: MessagePurpose;
  recipientAddress: string;
  subject?: string | null;
  bodyText: string;
  bodyHtml?: string | null;
  scheduledFor: Date;
  provider: string;
  dedupeKey: string;
}>;

export async function createScheduledMessage(
  database: MessageDatabase,
  input: CreateScheduledMessageInput,
) {
  return database.scheduledMessage.create({ data: input });
}

export async function enqueueCommittedMessages(
  messages: ReadonlyArray<{ id: string; scheduledFor: Date }>,
) {
  const results = await Promise.allSettled(
    messages.map((message) =>
      enqueueScheduledMessage(message.id, message.scheduledFor),
    ),
  );
  return results.filter(
    (result) => result.status === "fulfilled" && result.value,
  ).length;
}

export async function recoverQueuedMessages(now = new Date()) {
  const horizon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const messages = await prisma.scheduledMessage.findMany({
    where: {
      status: "queued",
      scheduledFor: { lte: horizon },
    },
    orderBy: { scheduledFor: "asc" },
    take: 500,
    select: { id: true, scheduledFor: true },
  });
  return enqueueCommittedMessages(messages);
}

export async function processScheduledMessage(scheduledMessageId: string) {
  const claimed = await prisma.scheduledMessage.updateMany({
    where: { id: scheduledMessageId, status: "queued" },
    data: { status: "processing", lockedAt: new Date() },
  });
  if (claimed.count === 0) return { skipped: true as const };

  const message = await prisma.scheduledMessage.findUnique({
    where: { id: scheduledMessageId },
    include: { patient: true },
  });
  if (!message) return { skipped: true as const };

  try {
    assertMessageCanBeSent(message);
    const delivery =
      message.channel === "whatsapp"
        ? await sendWhatsApp(message.recipientAddress, message.bodyText)
        : await sendEmail({
            to: message.recipientAddress,
            subject: message.subject ?? "Mensagem do consultório",
            text: message.bodyText,
            html: message.bodyHtml ?? plainTextToHtml(message.bodyText),
          });

    const now = new Date();
    await prisma.$transaction(async (transaction) => {
      await transaction.scheduledMessage.update({
        where: { id: message.id },
        data: {
          status: "sent",
          providerMessageId: delivery.providerMessageId,
          attempts: { increment: 1 },
          sentAt: now,
          lockedAt: null,
          lastError: null,
        },
      });
      await transaction.conversationMessage.upsert({
        where: { scheduledMessageId: message.id },
        create: {
          userId: message.userId,
          patientId: message.patientId,
          scheduledMessageId: message.id,
          channel: message.channel,
          direction: "outbound",
          status: "sent",
          fromAddress: delivery.fromAddress,
          toAddress: message.recipientAddress,
          body: message.bodyText,
          providerMessageId: delivery.providerMessageId,
          occurredAt: now,
        },
        update: {
          status: "sent",
          providerMessageId: delivery.providerMessageId,
          occurredAt: now,
        },
      });
      if (message.notificationAttemptId) {
        await transaction.notificationAttempt.update({
          where: { id: message.notificationAttemptId },
          data: {
            status: "enviado",
            providerMessageId: delivery.providerMessageId,
            sentAt: now,
            failureReason: null,
          },
        });
      }
    });
    return { skipped: false as const, sent: true as const };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Falha desconhecida no envio.";
    const attempts = message.attempts + 1;
    const willRetry = attempts < 5;
    await prisma.$transaction(async (transaction) => {
      await transaction.scheduledMessage.update({
        where: { id: message.id },
        data: {
          status: willRetry ? "queued" : "failed",
          attempts,
          lockedAt: null,
          lastError: reason.slice(0, 500),
        },
      });
      if (message.notificationAttemptId) {
        await transaction.notificationAttempt.update({
          where: { id: message.notificationAttemptId },
          data: {
            status: willRetry ? "pendente" : "falhou",
            failureReason: reason.slice(0, 500),
          },
        });
      }
      if (!willRetry) {
        await transaction.appNotification.upsert({
          where: { dedupeKey: `message-failed:${message.id}` },
          create: {
            userId: message.userId,
            patientId: message.patientId,
            type: "message",
            title: "Falha ao enviar mensagem",
            description: `Não foi possível enviar para ${message.patient.name} após 5 tentativas.`,
            href: `/mensagens?patientId=${encodeURIComponent(message.patientId)}&tab=programadas`,
            dedupeKey: `message-failed:${message.id}`,
          },
          update: {
            readAt: null,
            description: `Não foi possível enviar para ${message.patient.name} após 5 tentativas.`,
          },
        });
      }
    });
    throw error;
  }
}

function assertMessageCanBeSent(message: {
  channel: MessageChannel;
  patient: {
    status: string;
    emailConsent: boolean;
    whatsappConsent: boolean;
  };
}) {
  if (message.patient.status !== "ativo") {
    throw new Error("O paciente não está ativo.");
  }
  if (message.channel === "email" && !message.patient.emailConsent) {
    throw new Error("O paciente não autorizou comunicações por e-mail.");
  }
  if (message.channel === "whatsapp" && !message.patient.whatsappConsent) {
    throw new Error("O paciente não autorizou comunicações por WhatsApp.");
  }
}

async function sendWhatsApp(to: string, body: string) {
  const config = getWhatsAppConfig();
  if (!config) throw new Error("WhatsApp não configurado.");
  const result = await new TwilioWhatsAppSender().sendMessage({ to, body });
  if (!result.ok) throw new Error(result.failureReason);
  return {
    providerMessageId: result.providerMessageId,
    fromAddress: config.from,
  };
}

async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const config = getEmailConfig();
  if (!config) throw new Error("E-mail não configurado.");
  const providerMessageId = await sendTransactionalEmail(input);
  return {
    providerMessageId,
    fromAddress: config.from,
  };
}

function plainTextToHtml(value: string) {
  return `<p>${value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />")}</p>`;
}

export async function cancelScheduledMessage(
  userId: string,
  scheduledMessageId: string,
) {
  const result = await prisma.scheduledMessage.updateMany({
    where: {
      id: scheduledMessageId,
      userId,
      status: { in: ["queued", "failed"] },
    },
    data: {
      status: "canceled",
      canceledAt: new Date(),
      lockedAt: null,
    },
  });
  return result.count > 0;
}
