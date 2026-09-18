import { describe, expect, it } from "vitest";
import {
  financeEntryCreateSchema,
  financeEntryStatusSchema,
} from "@/utils/validators/finance-entry";

describe("finance entry validation", () => {
  it("normalizes BRL and Brazilian dates", () => {
    const parsed = financeEntryCreateSchema.parse({
      type: "receita",
      description: "Sessão avulsa",
      category: "Avulso",
      paymentMethod: "pix",
      valueCents: "1.234,56",
      date: "14/09/2026",
      dueDate: "20/09/2026",
      status: "previsto",
    });
    expect(parsed.valueCents).toBe(123456);
    expect(parsed.date.toISOString()).toContain("2026-09-14");
  });

  it("rejects invalid values, dates and transitions", () => {
    expect(financeEntryCreateSchema.safeParse({
      type: "despesa",
      description: "A",
      category: "",
      valueCents: "0",
      date: "31/02/2026",
      dueDate: "x",
    }).success).toBe(false);
    expect(financeEntryStatusSchema.safeParse({ entryId: "id", status: "previsto" }).success).toBe(false);
  });
});
