CREATE TYPE "FinanceEntryType" AS ENUM ('receita', 'despesa');
CREATE TYPE "FinanceEntryStatus" AS ENUM ('previsto', 'efetivado', 'cancelado');
CREATE TYPE "FinanceEntryOrigin" AS ENUM ('appointment', 'manual');
CREATE TYPE "FinanceEntryEventType" AS ENUM ('created', 'updated', 'effected', 'canceled');

CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "appointmentId" TEXT,
    "type" "FinanceEntryType" NOT NULL,
    "status" "FinanceEntryStatus" NOT NULL DEFAULT 'previsto',
    "origin" "FinanceEntryOrigin" NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod",
    "valueCents" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "effectiveAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FinanceEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceEntryEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "type" "FinanceEntryEventType" NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinanceEntryEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FinanceEntry_appointmentId_key" ON "FinanceEntry"("appointmentId");
CREATE INDEX "FinanceEntry_userId_date_idx" ON "FinanceEntry"("userId", "date");
CREATE INDEX "FinanceEntry_userId_type_status_idx" ON "FinanceEntry"("userId", "type", "status");
CREATE INDEX "FinanceEntry_patientId_date_idx" ON "FinanceEntry"("patientId", "date");
CREATE INDEX "FinanceEntryEvent_entryId_createdAt_idx" ON "FinanceEntryEvent"("entryId", "createdAt");
CREATE INDEX "FinanceEntryEvent_userId_createdAt_idx" ON "FinanceEntryEvent"("userId", "createdAt");

ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceEntryEvent" ADD CONSTRAINT "FinanceEntryEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceEntryEvent" ADD CONSTRAINT "FinanceEntryEvent_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "FinanceEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Convert eligible existing appointments into the canonical ledger without
-- deleting or rewriting any appointment/profile data.
INSERT INTO "FinanceEntry" (
    "id", "userId", "patientId", "appointmentId", "type", "status", "origin",
    "description", "category", "paymentMethod", "valueCents", "date", "dueDate",
    "effectiveAt", "canceledAt", "createdAt", "updatedAt"
)
SELECT
    CONCAT('fin_', MD5(RANDOM()::TEXT || a."id")),
    a."userId",
    a."patientId",
    a."id",
    'receita'::"FinanceEntryType",
    CASE
      WHEN a."status" = 'realizada' THEN 'efetivado'::"FinanceEntryStatus"
      WHEN a."status" IN ('cancelada', 'recusada') THEN 'cancelado'::"FinanceEntryStatus"
      ELSE 'previsto'::"FinanceEntryStatus"
    END,
    'appointment'::"FinanceEntryOrigin",
    CONCAT(a."type", ' — ', p."name"),
    'Avulso',
    f."preferredPaymentMethod",
    f."defaultSessionPriceCents",
    a."startsAt",
    a."startsAt",
    CASE WHEN a."status" = 'realizada' THEN a."updatedAt" ELSE NULL END,
    CASE WHEN a."status" IN ('cancelada', 'recusada') THEN a."updatedAt" ELSE NULL END,
    a."createdAt",
    CURRENT_TIMESTAMP
FROM "Appointment" a
JOIN "Patient" p ON p."id" = a."patientId"
JOIN "PatientFinancialProfile" f ON f."patientId" = a."patientId"
WHERE f."isComplete" = TRUE AND f."defaultSessionPriceCents" > 0;

INSERT INTO "FinanceEntryEvent" ("id", "userId", "entryId", "type", "afterState", "createdAt")
SELECT
    CONCAT('fev_', MD5(RANDOM()::TEXT || e."id")),
    e."userId",
    e."id",
    'created'::"FinanceEntryEventType",
    JSONB_BUILD_OBJECT(
      'id', e."id", 'patientId', e."patientId", 'appointmentId', e."appointmentId",
      'type', e."type", 'status', e."status", 'origin', e."origin",
      'description', e."description", 'category', e."category",
      'paymentMethod', e."paymentMethod", 'valueCents', e."valueCents",
      'date', e."date", 'dueDate', e."dueDate"
    ),
    CURRENT_TIMESTAMP
FROM "FinanceEntry" e;
