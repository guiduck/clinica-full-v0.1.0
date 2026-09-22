import { z } from "zod";
import { parseBrazilianDate } from "@/utils/normalizers";

const optionalClinicalText = z
  .string()
  .trim()
  .max(10_000)
  .optional()
  .default("");

export const anamneseDraftSchema = z.object({
  hda: z
    .object({
      description: optionalClinicalText,
      precipitants: optionalClinicalText,
      previousAttempts: optionalClinicalText,
    })
    .optional(),
  personal: z
    .object({
      narrative: optionalClinicalText,
      supportNetwork: optionalClinicalText,
    })
    .optional(),
  habits: z
    .object({
      sleep: optionalClinicalText,
      diet: optionalClinicalText,
      physicalActivity: optionalClinicalText,
      alcohol: optionalClinicalText,
      tobacco: optionalClinicalText,
      drugs: optionalClinicalText,
      leisure: optionalClinicalText,
    })
    .optional(),
  mental: z
    .object({
      appearance: optionalClinicalText,
      attitude: optionalClinicalText,
      consciousness: optionalClinicalText,
      affect: optionalClinicalText,
      thought: optionalClinicalText,
    })
    .optional(),
  diagnosis: z
    .object({ cidDsm: optionalClinicalText, objectives: optionalClinicalText })
    .optional(),
});
export type AnamneseDraft = z.output<typeof anamneseDraftSchema>;

const brazilianDate = z
  .string()
  .refine((value) => parseBrazilianDate(value) !== null, "Informe uma data válida em dd/mm/aaaa.");
const time24 = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm.");

const evolutionContentFields = {
  mood: z.number().int().min(1).max(10),
  free: optionalClinicalText,
  subjective: optionalClinicalText,
  objective: optionalClinicalText,
  assessment: optionalClinicalText,
  plan: optionalClinicalText,
};

const hasClinicalContent = (draft: { free: string; subjective: string; objective: string; assessment: string; plan: string }) =>
  [draft.free, draft.subjective, draft.objective, draft.assessment, draft.plan].some((value) => value.trim());

export const evolutionDraftSchema = z
  .object({
    date: brazilianDate,
    time: time24,
    appointmentId: z.string().trim().min(1, "Selecione a consulta relacionada."),
    ...evolutionContentFields,
  })
  .refine(hasClinicalContent, { message: "Informe um registro livre ou ao menos um campo SOAP." });
export type EvolutionDraft = z.output<typeof evolutionDraftSchema>;

export const sessionFinishDraftSchema = z.object(evolutionContentFields);
export type SessionFinishDraft = z.output<typeof sessionFinishDraftSchema>;
