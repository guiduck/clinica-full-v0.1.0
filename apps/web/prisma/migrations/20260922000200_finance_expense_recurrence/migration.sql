ALTER TABLE "FinanceEntry"
ADD COLUMN "recurrenceGroupId" TEXT,
ADD COLUMN "recurrenceIndex" INTEGER,
ADD COLUMN "recurrenceCount" INTEGER;

CREATE INDEX "FinanceEntry_recurrenceGroupId_idx" ON "FinanceEntry"("recurrenceGroupId");
