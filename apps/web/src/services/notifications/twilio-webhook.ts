import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/services/patients/normalization";

export function validateTwilioSignature(input: {
  authToken: string;
  signature: string;
  url: string;
  params: URLSearchParams;
}) {
  const pairs = [...input.params.keys()]
    .sort()
    .map((key) => `${key}${input.params.get(key) ?? ""}`)
    .join("");
  const expected = createHmac("sha1", input.authToken)
    .update(`${input.url}${pairs}`)
    .digest("base64");
  const receivedBuffer = Buffer.from(input.signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function handleTwilioWhatsAppWebhook(params: URLSearchParams) {
  const providerMessageId = params.get("MessageSid") || params.get("SmsSid");
  const messageStatus = params.get("MessageStatus");
  if (providerMessageId && messageStatus) {
    await updateDeliveryStatus(providerMessageId, messageStatus);
  }

  const body = params.get("Body")?.trim();
  const from = params.get("From");
  const to = params.get("To");
  if (!providerMessageId || !body || !from || !to) return;

  const existing = await prisma.conversationMessage.findUnique({
    where: { providerMessageId },
    select: { id: true },
  });
  if (existing) return;

  const latestOutbound = await prisma.conversationMessage.findFirst({
    where: {
      channel: "whatsapp",
      direction: "outbound",
      fromAddress: to,
      toAddress: from,
    },
    orderBy: { occurredAt: "desc" },
    select: { userId: true, patientId: true },
  });

  let owner = latestOutbound;
  if (!owner) {
    const normalizedPhone = normalizePhone(from);
    const candidates = await prisma.patient.findMany({
      where: {
        normalizedPhone,
        status: "ativo",
        whatsappConsent: true,
      },
      select: { userId: true, id: true },
      take: 2,
    });
    if (candidates.length === 1) {
      owner = {
        userId: candidates[0].userId,
        patientId: candidates[0].id,
      };
    }
  }
  if (!owner) {
    console.warn("[twilio-webhook] resposta sem destinatário inequívoco", {
      providerMessageId,
      from,
      to,
    });
    return;
  }

  await prisma.$transaction(async (transaction) => {
    const patient = await transaction.patient.findUnique({
      where: { id: owner.patientId },
      select: { name: true },
    });
    await transaction.conversationMessage.create({
      data: {
        userId: owner.userId,
        patientId: owner.patientId,
        channel: "whatsapp",
        direction: "inbound",
        status: "received",
        fromAddress: from,
        toAddress: to,
        body,
        providerMessageId,
        occurredAt: new Date(),
      },
    });
    await transaction.appNotification.upsert({
      where: { dedupeKey: `twilio-inbound:${providerMessageId}` },
      create: {
        userId: owner.userId,
        patientId: owner.patientId,
        type: "message",
        title: "Nova resposta no WhatsApp",
        description: `${patient?.name ?? "Paciente"} respondeu à conversa.`,
        href: `/mensagens?patientId=${encodeURIComponent(owner.patientId)}`,
        dedupeKey: `twilio-inbound:${providerMessageId}`,
      },
      update: { readAt: null },
    });
  });
}

async function updateDeliveryStatus(providerMessageId: string, status: string) {
  const mapped = mapTwilioStatus(status);
  await prisma.conversationMessage.updateMany({
    where: { providerMessageId },
    data: { status: mapped },
  });
  if (mapped === "failed") {
    const scheduled = await prisma.scheduledMessage.findUnique({
      where: { providerMessageId },
      select: { id: true, userId: true, patientId: true },
    });
    if (scheduled) {
      await prisma.$transaction([
        prisma.scheduledMessage.update({
          where: { id: scheduled.id },
          data: { status: "failed", lastError: `Twilio: ${status}` },
        }),
        prisma.appNotification.upsert({
          where: { dedupeKey: `twilio-failed:${providerMessageId}` },
          create: {
            userId: scheduled.userId,
            patientId: scheduled.patientId,
            type: "message",
            title: "WhatsApp não entregue",
            description: "A Twilio informou uma falha definitiva na entrega.",
            href: `/mensagens?patientId=${encodeURIComponent(scheduled.patientId)}&tab=programadas`,
            dedupeKey: `twilio-failed:${providerMessageId}`,
          },
          update: { readAt: null },
        }),
      ]);
    }
  }
}

function mapTwilioStatus(status: string) {
  if (status === "delivered") return "delivered" as const;
  if (status === "read") return "read" as const;
  if (["failed", "undelivered"].includes(status)) return "failed" as const;
  return "sent" as const;
}
