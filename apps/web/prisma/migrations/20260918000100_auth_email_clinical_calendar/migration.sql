-- Existing password users were already allowed to use the application before
-- e-mail verification existed, so they are backfilled as verified.
ALTER TABLE "User"
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
  ALTER COLUMN "passwordHash" DROP NOT NULL;

UPDATE "User" SET "emailVerifiedAt" = CURRENT_TIMESTAMP WHERE "emailVerifiedAt" IS NULL;

ALTER TABLE "Appointment"
  ADD COLUMN "sessionStartedAt" TIMESTAMP(3),
  ADD COLUMN "sessionEndedAt" TIMESTAMP(3),
  ADD COLUMN "googleCalendarEventId" TEXT;

CREATE TABLE "AuthToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OAuthAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClinicalAnamnesis" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "encryptedPayload" TEXT NOT NULL,
  "encryptionVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalAnamnesis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClinicalEvolution" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "appointmentId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "mood" INTEGER NOT NULL,
  "encryptedPayload" TEXT NOT NULL,
  "encryptionVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalEvolution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoogleCalendarConnection" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "googleAccountEmail" TEXT NOT NULL,
  "accessTokenEncrypted" TEXT,
  "refreshTokenEncrypted" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "scope" TEXT NOT NULL,
  "calendarId" TEXT NOT NULL DEFAULT 'primary',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GoogleCalendarConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash");
CREATE INDEX "AuthToken_userId_kind_expiresAt_idx" ON "AuthToken"("userId", "kind", "expiresAt");
CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key" ON "OAuthAccount"("provider", "providerAccountId");
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");
CREATE UNIQUE INDEX "ClinicalAnamnesis_patientId_key" ON "ClinicalAnamnesis"("patientId");
CREATE INDEX "ClinicalAnamnesis_userId_updatedAt_idx" ON "ClinicalAnamnesis"("userId", "updatedAt");
CREATE UNIQUE INDEX "ClinicalEvolution_appointmentId_key" ON "ClinicalEvolution"("appointmentId");
CREATE INDEX "ClinicalEvolution_userId_patientId_occurredAt_idx" ON "ClinicalEvolution"("userId", "patientId", "occurredAt");
CREATE UNIQUE INDEX "GoogleCalendarConnection_userId_key" ON "GoogleCalendarConnection"("userId");

ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalAnamnesis" ADD CONSTRAINT "ClinicalAnamnesis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalAnamnesis" ADD CONSTRAINT "ClinicalAnamnesis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalEvolution" ADD CONSTRAINT "ClinicalEvolution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalEvolution" ADD CONSTRAINT "ClinicalEvolution_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalEvolution" ADD CONSTRAINT "ClinicalEvolution_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarConnection" ADD CONSTRAINT "GoogleCalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
