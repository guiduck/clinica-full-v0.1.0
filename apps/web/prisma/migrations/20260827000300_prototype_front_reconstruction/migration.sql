-- This migration is intentionally additive. Existing rows are preserved and no
-- synthetic values are backfilled for formerly optional patient data.

ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'confirmada';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'realizada';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'falta';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'cancelada';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'remarcada';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'pendente';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'recusada';

ALTER TABLE "Patient"
  ADD COLUMN "chiefComplaint" TEXT,
  ADD COLUMN "emailConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "addressZipCode" TEXT,
  ADD COLUMN "addressStreet" TEXT,
  ADD COLUMN "addressNumber" TEXT,
  ADD COLUMN "addressComplement" TEXT,
  ADD COLUMN "addressCity" TEXT,
  ADD COLUMN "addressState" TEXT,
  ADD COLUMN "emergencyContactName" TEXT,
  ADD COLUMN "emergencyContactPhone" TEXT,
  ADD COLUMN "emergencyContactRelationship" TEXT;

ALTER TABLE "PatientFinancialProfile"
  ADD COLUMN "cardInstallments" INTEGER;

ALTER TABLE "Appointment"
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'Consulta',
  ADD COLUMN "videoUrl" TEXT;

CREATE TABLE "UserUiPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "onboardingStep" INTEGER NOT NULL DEFAULT 0,
  "onboardingCompletedAt" TIMESTAMP(3),
  "onboardingSkippedAt" TIMESTAMP(3),
  "dashboardSectionOrder" JSONB,
  "hideFinancialValues" BOOLEAN NOT NULL DEFAULT false,
  "dismissedNewsBannerAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserUiPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserUiPreference_userId_key" ON "UserUiPreference"("userId");
CREATE INDEX "UserUiPreference_userId_idx" ON "UserUiPreference"("userId");

ALTER TABLE "UserUiPreference"
  ADD CONSTRAINT "UserUiPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
