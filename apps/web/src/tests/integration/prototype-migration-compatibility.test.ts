import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "prisma/migrations/20260827000300_prototype_front_reconstruction/migration.sql"
);

describe("prototype reconstruction migration compatibility", () => {
  const sql = fs.readFileSync(migrationPath, "utf8");

  it("keeps the migration additive and preserves legacy records", () => {
    expect(sql).not.toMatch(/\bDROP\b/i);
    expect(sql).not.toMatch(/DELETE\s+FROM/i);
    expect(sql).not.toMatch(/UPDATE\s+"Patient"/i);
    expect(sql).toContain('ADD COLUMN "chiefComplaint" TEXT');
    expect(sql).toContain('ADD COLUMN "emailConsent" BOOLEAN NOT NULL DEFAULT false');
  });

  it("adds only the approved persisted extensions", () => {
    expect(sql).toContain('CREATE TABLE "UserUiPreference"');
    expect(sql).toContain('ADD COLUMN "cardInstallments" INTEGER');
    expect(sql).toContain('ADD COLUMN "type" TEXT NOT NULL DEFAULT \'Consulta\'');
    expect(sql).toContain('ADD COLUMN "videoUrl" TEXT');
    expect(sql).not.toMatch(/ClinicalRecord|FinancialEntry|Receipt|Document|Signature|ScheduleBlock|MessageQueue/);
  });
});
