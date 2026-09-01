import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidNormalizedCpf, isValidNormalizedPhone, normalizeCpf, normalizePhone } from "@/services/patients/normalization";

export const patientSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome do paciente."),
    phone: z.string().trim().min(1, "Informe o telefone do paciente."),
    email: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined)
      .pipe(z.string().email("Digite um e-mail valido.").optional()),
    cpf: z.string().trim().optional(),
    birthDate: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    chiefComplaint: z.string().trim().optional(),
    whatsappConsent: z.coerce.boolean().default(false),
    emailConsent: z.coerce.boolean().optional(),
    addressZipCode: z.string().trim().optional(),
    addressStreet: z.string().trim().optional(),
    addressNumber: z.string().trim().optional(),
    addressComplement: z.string().trim().optional(),
    addressCity: z.string().trim().optional(),
    addressState: z.string().trim().optional(),
    emergencyContactName: z.string().trim().optional(),
    emergencyContactPhone: z.string().trim().optional(),
    emergencyContactRelationship: z.string().trim().optional(),
    status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
    intent: z.enum(["save", "save_and_go_to_finance"]).default("save")
  })
  .superRefine((value, ctx) => {
    if (!isValidNormalizedPhone(normalizePhone(value.phone))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um telefone valido.",
        path: ["phone"]
      });
    }

    const cpf = normalizeCpf(value.cpf);
    if (cpf && !isValidNormalizedCpf(cpf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um CPF valido com 11 digitos.",
        path: ["cpf"]
      });
    }

    if (value.birthDate) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.birthDate);
      const date = match ? new Date(`${value.birthDate}T12:00:00.000Z`) : null;
      if (!match || !date || Number.isNaN(date.getTime()) || date.getUTCFullYear() !== Number(match[1]) || date.getUTCMonth() + 1 !== Number(match[2]) || date.getUTCDate() !== Number(match[3])) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe uma data de nascimento válida.", path: ["birthDate"] });
      }
    }
  });

export const patientWizardPatientSchema = patientSchema.superRefine((value, ctx) => {
  if (!value.cpf) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o CPF do paciente.", path: ["cpf"] });
  if (!value.birthDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe a data de nascimento.", path: ["birthDate"] });
  if (!value.email) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o e-mail do paciente.", path: ["email"] });
});

export const patientResolver = zodResolver(patientSchema);

export type PatientInput = z.input<typeof patientSchema>;
export type ParsedPatientInput = z.output<typeof patientSchema>;
