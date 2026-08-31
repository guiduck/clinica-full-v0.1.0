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
    whatsappConsent: z.coerce.boolean().default(false),
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
  });

export const patientResolver = zodResolver(patientSchema);

export type PatientInput = z.input<typeof patientSchema>;
export type ParsedPatientInput = z.output<typeof patientSchema>;
