-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ativo', 'inativo', 'arquivado');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'card', 'cash', 'insurance');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('agendada');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('whatsapp');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pendente', 'enviado', 'falhou');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "normalizedPhone" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "normalizedCpf" TEXT,
    "birthDate" TIMESTAMP(3),
    "notes" TEXT,
    "whatsappConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" "PatientStatus" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientFinancialProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "preferredPaymentMethod" "PaymentMethod" NOT NULL,
    "defaultSessionPriceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "pixKeyType" TEXT,
    "pixKey" TEXT,
    "cardProvider" TEXT,
    "cardPaymentMethodRef" TEXT,
    "cardBrand" TEXT,
    "cardLast4" TEXT,
    "cardHolderName" TEXT,
    "insuranceName" TEXT,
    "insuranceMemberId" TEXT,
    "insuranceAuthorizationInfo" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientFinancialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'agendada',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'whatsapp',
    "status" "NotificationStatus" NOT NULL DEFAULT 'pendente',
    "recipientPhone" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'twilio',
    "providerMessageId" TEXT,
    "failureReason" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Patient_userId_status_idx" ON "Patient"("userId", "status");

-- CreateIndex
CREATE INDEX "Patient_userId_name_idx" ON "Patient"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_normalizedPhone_key" ON "Patient"("userId", "normalizedPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_normalizedCpf_key" ON "Patient"("userId", "normalizedCpf");

-- CreateIndex
CREATE UNIQUE INDEX "PatientFinancialProfile_patientId_key" ON "PatientFinancialProfile"("patientId");

-- CreateIndex
CREATE INDEX "PatientFinancialProfile_userId_idx" ON "PatientFinancialProfile"("userId");

-- CreateIndex
CREATE INDEX "PatientFinancialProfile_userId_isComplete_idx" ON "PatientFinancialProfile"("userId", "isComplete");

-- CreateIndex
CREATE INDEX "Appointment_userId_startsAt_idx" ON "Appointment"("userId", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_patientId_startsAt_idx" ON "Appointment"("patientId", "startsAt");

-- CreateIndex
CREATE INDEX "NotificationAttempt_userId_createdAt_idx" ON "NotificationAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationAttempt_appointmentId_idx" ON "NotificationAttempt"("appointmentId");

-- CreateIndex
CREATE INDEX "NotificationAttempt_patientId_idx" ON "NotificationAttempt"("patientId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFinancialProfile" ADD CONSTRAINT "PatientFinancialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFinancialProfile" ADD CONSTRAINT "PatientFinancialProfile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAttempt" ADD CONSTRAINT "NotificationAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAttempt" ADD CONSTRAINT "NotificationAttempt_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAttempt" ADD CONSTRAINT "NotificationAttempt_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
