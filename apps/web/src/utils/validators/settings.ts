import { z } from "zod";
import { isValidCpf } from "@/utils/validators/brazilian-documents";

const digits = (value: string) => value.replace(/\D/g, "");

export function isValidCnpj(value: string) {
  const number = digits(value);
  if (number.length !== 14 || /^(\d)\1{13}$/.test(number)) return false;
  const calculate = (length: 12 | 13) => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const total = number
      .slice(0, length)
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return (
    calculate(12) === Number(number[12]) && calculate(13) === Number(number[13])
  );
}

export const settingsAccountSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  email: z.string().email("Informe um e-mail válido."),
  specialty: z.string().trim().optional(),
  cpf: z.string().refine(isValidCpf, "CPF inválido."),
  council: z.string().trim().optional(),
});

export const settingsContactSchema = z.object({
  phone: z
    .string()
    .refine(
      (value) => [10, 11].includes(digits(value).length),
      "Telefone inválido.",
    ),
  street: z.string().trim().min(1, "Informe o logradouro."),
  city: z.string().trim().min(1, "Informe a cidade."),
  state: z.string().regex(/^[A-Za-z]{2}$/, "Informe uma UF válida."),
  zip: z
    .string()
    .refine((value) => digits(value).length === 8, "CEP inválido."),
  clinicName: z.string().trim().optional(),
  clinicCnpj: z
    .string()
    .optional()
    .refine((value) => !value || isValidCnpj(value), "CNPJ inválido."),
  clinicPhone: z
    .string()
    .optional()
    .refine(
      (value) => !value || [10, 11].includes(digits(value).length),
      "Telefone inválido.",
    ),
});

export const settingsImageSchema = z.object({
  size: z.number().max(2 * 1024 * 1024, "A imagem deve ter no máximo 2 MB."),
  type: z.string().regex(/^image\//, "Escolha um arquivo de imagem."),
});
export const settingsPlanSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do plano."),
  sessions: z.coerce.number().int().min(1, "Informe ao menos uma sessão."),
  months: z.coerce.number().int().min(1, "Informe ao menos um mês."),
  valueCents: z.coerce.number().int().positive("Informe um valor positivo."),
});

const allowedPlaceholders = new Set([
  "nomePaciente",
  "data",
  "horario",
  "valor",
  "vencimento",
]);
export const messageTemplateSchema = z
  .string()
  .trim()
  .min(1, "O texto do template é obrigatório.")
  .superRefine((value, context) => {
    for (const match of value.matchAll(/{{\s*([^{}]+)\s*}}/g)) {
      if (!allowedPlaceholders.has(match[1].trim()))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Etiqueta desconhecida: ${match[1].trim()}`,
        });
    }
  });
