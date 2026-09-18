import { z } from "zod";

export const passwordRecoverySchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("Digite um e-mail válido."),
});

export const passwordResetSchema = z.object({
  token: z.string().min(20, "O link de redefinição é inválido."),
  password: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string().min(1, "Confirme a nova senha."),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "As senhas não coincidem.",
});

export const passwordResetCodeSchema = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  code: z.string().trim().regex(/^\d{6}$/, "Digite o código de 6 números."),
  password: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string().min(1, "Confirme a nova senha."),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "As senhas não coincidem.",
});
