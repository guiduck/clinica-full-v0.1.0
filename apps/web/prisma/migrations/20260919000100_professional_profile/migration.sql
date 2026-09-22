ALTER TABLE "User"
ADD COLUMN "cpf" TEXT,
ADD COLUMN "specialty" TEXT,
ADD COLUMN "council" TEXT;

CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
