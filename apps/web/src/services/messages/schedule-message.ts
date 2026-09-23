import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { getEmailConfig } from "@/services/email/email-config";
import { patientWelcomeEmail } from "@/emails/patient-welcome";
import { getPublicAppUrl } from "@/services/email/email-config";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";
import type { ParsedScheduledMessageInput } from "@/utils/validators/scheduled-message";
import {
  createScheduledMessage,
  enqueueCommittedMessages,
} from "./scheduled-messages";

export async function scheduleCustomMessage(
  userId: string,
  input: ParsedScheduledMessageInput,
) {
  const patient = await prisma.patient.findFirst({
    where: { id: input.patientId, userId, status: "ativo" },
    select: {
      id: true,
      email: true,
      normalizedPhone: true,
      emailConsent: true,
      whatsappConsent: true,
    },
  });
  if (!patient) throw new DomainError("NOT_FOUND", "Paciente não encontrado.");

  const recipientAddress =
    input.channel === "email" ? patient.email : patient.normalizedPhone;
  if (!recipientAddress) {
    throw new DomainError(
      "VALIDATION",
      input.channel === "email"
        ? "O paciente não possui e-mail."
        : "O paciente não possui WhatsApp.",
    );
  }
  if (input.channel === "email" && !patient.emailConsent) {
    throw new DomainError("VALIDATION", "O paciente não autorizou e-mails.");
  }
  if (input.channel === "whatsapp" && !patient.whatsappConsent) {
    throw new DomainError("VALIDATION", "O paciente não autorizou WhatsApp.");
  }

  let provider: string | null = null;
  if (input.channel === "email") {
    provider = getEmailConfig()?.provider ?? null;
  } else if (getWhatsAppConfig()) {
    provider = "twilio";
  }
  if (!provider) {
    throw new DomainError(
      "VALIDATION",
      input.channel === "email"
        ? "O provedor de e-mail não está configurado."
        : "A Twilio não está configurada.",
    );
  }

  const scheduledFor = new Date(input.scheduledFor);
  if (scheduledFor.getTime() < Date.now() - 60_000) {
    throw new DomainError("VALIDATION", "A data de envio não pode estar no passado.");
  }

  const message = await createScheduledMessage(prisma, {
    userId,
    patientId: patient.id,
    channel: input.channel,
    purpose: "custom",
    recipientAddress,
    subject: input.channel === "email" ? input.subject : null,
    bodyText: input.body,
    scheduledFor,
    provider,
    dedupeKey: `custom:${userId}:${randomUUID()}`,
  });
  await enqueueCommittedMessages([message]);
  return message;
}

export async function schedulePatientWelcomeEmail(input: {
  userId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  professionalName: string;
}) {
  const emailConfig = getEmailConfig();
  if (!emailConfig) {
    throw new DomainError(
      "EMAIL_NOT_CONFIGURED",
      "O provedor de e-mail ainda não foi configurado.",
    );
  }
  const content = patientWelcomeEmail(
    input.patientName,
    input.professionalName,
    getPublicAppUrl(),
  );
  const message = await createScheduledMessage(prisma, {
    userId: input.userId,
    patientId: input.patientId,
    channel: "email",
    purpose: "patient_welcome",
    recipientAddress: input.patientEmail,
    subject: content.subject,
    bodyText: content.text,
    bodyHtml: content.html,
    scheduledFor: new Date(),
    provider: emailConfig.provider,
    dedupeKey: `patient-welcome:${input.patientId}`,
  });
  await enqueueCommittedMessages([message]);
  return message;
}
