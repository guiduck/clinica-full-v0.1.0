import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("Digite um e-mail valido."),
  password: z.string().min(1, "Informe sua senha."),
  rememberMe: z.boolean().default(false)
});

export const loginResolver = zodResolver(loginSchema);

export type LoginInput = z.input<typeof loginSchema>;

