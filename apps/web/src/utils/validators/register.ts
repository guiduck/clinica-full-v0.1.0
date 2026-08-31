import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidCpf } from "@/utils/validators/brazilian-documents";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("Digite um e-mail válido."),
  cpf: z.string().transform((value) => value.replace(/\D/g, "")).refine(isValidCpf, "Informe um CPF válido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  acceptedTerms: z.boolean().refine((value) => value, "Aceite os termos para continuar.")
});

export const registerResolver = zodResolver(registerSchema);

export type RegisterInput = z.input<typeof registerSchema>;
