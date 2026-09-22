ALTER TABLE "Appointment"
ADD COLUMN "recurrenceGroupId" TEXT,
ADD COLUMN "recurrenceIndex" INTEGER,
ADD COLUMN "recurrenceCount" INTEGER;

CREATE INDEX "Appointment_recurrenceGroupId_idx" ON "Appointment"("recurrenceGroupId");
