-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('email', 'whatsapp');
CREATE TYPE "MessagePurpose" AS ENUM ('appointment_confirmation', 'appointment_reminder', 'patient_welcome', 'custom');
CREATE TYPE "ScheduledMessageStatus" AS ENUM ('queued', 'processing', 'sent', 'failed', 'canceled');
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');
CREATE TYPE "ConversationMessageStatus" AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed', 'received');
CREATE TYPE "AppNotificationType" AS ENUM ('appointment', 'payment', 'birthday', 'message', 'document');

-- CreateTable
CREATE TABLE "ScheduledMessage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "appointmentId" TEXT,
  "notificationAttemptId" TEXT,
  "channel" "MessageChannel" NOT NULL,
  "purpose" "MessagePurpose" NOT NULL,
  "status" "ScheduledMessageStatus" NOT NULL DEFAULT 'queued',
  "recipientAddress" TEXT NOT NULL,
  "subject" TEXT,
  "bodyText" TEXT NOT NULL,
  "bodyHtml" TEXT,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "provider" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "lockedAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "dedupeKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduledMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationMessage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "scheduledMessageId" TEXT,
  "channel" "MessageChannel" NOT NULL,
  "direction" "MessageDirection" NOT NULL,
  "status" "ConversationMessageStatus" NOT NULL,
  "fromAddress" TEXT NOT NULL,
  "toAddress" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AppNotification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientId" TEXT,
  "type" "AppNotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppNotification_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "ScheduledMessage_notificationAttemptId_key" ON "ScheduledMessage"("notificationAttemptId");
CREATE UNIQUE INDEX "ScheduledMessage_providerMessageId_key" ON "ScheduledMessage"("providerMessageId");
CREATE UNIQUE INDEX "ScheduledMessage_dedupeKey_key" ON "ScheduledMessage"("dedupeKey");
CREATE INDEX "ScheduledMessage_status_scheduledFor_idx" ON "ScheduledMessage"("status", "scheduledFor");
CREATE INDEX "ScheduledMessage_userId_createdAt_idx" ON "ScheduledMessage"("userId", "createdAt");
CREATE INDEX "ScheduledMessage_patientId_createdAt_idx" ON "ScheduledMessage"("patientId", "createdAt");
CREATE INDEX "ScheduledMessage_appointmentId_idx" ON "ScheduledMessage"("appointmentId");
CREATE UNIQUE INDEX "ConversationMessage_scheduledMessageId_key" ON "ConversationMessage"("scheduledMessageId");
CREATE UNIQUE INDEX "ConversationMessage_providerMessageId_key" ON "ConversationMessage"("providerMessageId");
CREATE INDEX "ConversationMessage_userId_occurredAt_idx" ON "ConversationMessage"("userId", "occurredAt");
CREATE INDEX "ConversationMessage_userId_patientId_occurredAt_idx" ON "ConversationMessage"("userId", "patientId", "occurredAt");
CREATE INDEX "ConversationMessage_fromAddress_toAddress_occurredAt_idx" ON "ConversationMessage"("fromAddress", "toAddress", "occurredAt");
CREATE UNIQUE INDEX "AppNotification_dedupeKey_key" ON "AppNotification"("dedupeKey");
CREATE INDEX "AppNotification_userId_readAt_createdAt_idx" ON "AppNotification"("userId", "readAt", "createdAt");
CREATE INDEX "AppNotification_patientId_createdAt_idx" ON "AppNotification"("patientId", "createdAt");

-- ForeignKeys
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_notificationAttemptId_fkey" FOREIGN KEY ("notificationAttemptId") REFERENCES "NotificationAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_scheduledMessageId_fkey" FOREIGN KEY ("scheduledMessageId") REFERENCES "ScheduledMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
