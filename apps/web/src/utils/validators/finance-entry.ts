import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { normalizeBrlCents, parseBrazilianDate } from "@/utils/normalizers";

const optionalId = z.string().trim().optional().transform((value) => value || undefined);
const paymentMethod = z.enum(["pix", "card", "cash", "insurance"]);
const positiveCents = z.string().trim().transform((value, ctx) => {
  const cents = normalizeBrlCents(value);
  if (cents === null || cents <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe um valor maior que zero." });
    return z.NEVER;
  }
  return cents;
});
const brazilianDate = z.string().trim().transform((value, ctx) => {
  const date = parseBrazilianDate(value);
  if (!date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe uma data válida no formato dd/mm/aaaa." });
    return z.NEVER;
  }
  return date;
});

export const financeEntryCreateSchema = z.object({
  type: z.enum(["receita", "despesa"]),
  patientId: optionalId,
  description: z.string().trim().min(2, "Informe uma descrição.").max(160),
  category: z.string().trim().min(1, "Escolha uma categoria.").max(80),
  paymentMethod: paymentMethod.optional(),
  valueCents: positiveCents,
  date: brazilianDate,
  dueDate: brazilianDate,
  status: z.enum(["previsto", "efetivado"]).default("previsto"),
});

export const financeEntryUpdateSchema = financeEntryCreateSchema.pick({
  description: true,
  category: true,
  paymentMethod: true,
  valueCents: true,
  date: true,
  dueDate: true,
});

export const financeEntryStatusSchema = z.object({
  entryId: z.string().trim().min(1),
  status: z.enum(["efetivado", "cancelado"]),
});

export const financeEntryCreateResolver = zodResolver(financeEntryCreateSchema);
export type ParsedFinanceEntryCreateInput = z.output<typeof financeEntryCreateSchema>;
export type ParsedFinanceEntryUpdateInput = z.output<typeof financeEntryUpdateSchema>;
