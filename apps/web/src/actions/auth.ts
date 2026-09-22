"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { deleteCurrentSession, setSessionCookie } from "@/lib/auth/session";
import { loginUser } from "@/services/auth/login";
import { registerUser } from "@/services/auth/register";
import type { APIResponse, AuthResponse } from "@/types/api";
import { registerSchema, type RegisterInput } from "@/utils/validators/register";
import { requestPasswordReset, resetPassword, resetPasswordWithCode, sendAccountVerification } from "@/services/auth/email-flows";
import { prisma } from "@/lib/prisma";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { passwordRecoverySchema, passwordResetCodeSchema, passwordResetSchema } from "@/utils/validators/auth-email";

export async function registerAndLogin(input: RegisterInput): Promise<APIResponse<AuthResponse & { next: "dashboard" | "verify-email" }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, error: true, errorUserMessage: parsed.error.issues[0]?.message ?? "Revise os dados informados.", data: null, headers: null };
  }

  const registerResult = await registerUser({ name: parsed.data.name, email: parsed.data.email, cpf: parsed.data.cpf, password: parsed.data.password });

  if (registerResult.error) {
    return { status: registerResult.status, error: true, errorUserMessage: registerResult.errorUserMessage, headers: null, data: null };
  }

  if (registerResult.data?.requiresEmailVerification) {
    return {
      status: 201,
      error: false,
      errorUserMessage: "",
      headers: null,
      data: { user: registerResult.data, next: "verify-email" },
    };
  }

  const loginResult = await loginUser(parsed.data.email, parsed.data.password);

  if (!loginResult.error && loginResult.data) {
    await setSessionCookie(loginResult.data.token, new Date(loginResult.data.expiresAt));
    revalidateTag("current-user");
    revalidatePath("/dashboard");

    return {
      status: 200,
      error: false,
      errorUserMessage: "",
      headers: null,
      data: {
        user: loginResult.data.user,
        next: "dashboard",
      }
    };
  }

  return { status: loginResult.status, error: true, errorUserMessage: loginResult.errorUserMessage, headers: null, data: null };
}

export type PublicAuthActionState = { ok: boolean; message: string };

export async function requestPasswordResetAction(input: { email: string }): Promise<PublicAuthActionState> {
  const parsed = passwordRecoverySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Informe um e-mail válido." };
  try {
    await requestPasswordReset(parsed.data.email);
    return { ok: true, message: "Se existir uma conta com esse e-mail, enviaremos um código válido por 15 minutos." };
  } catch (error) {
    return { ok: false, message: getDomainErrorMessage(error, "Não foi possível solicitar a redefinição agora.") };
  }
}

export async function resetPasswordWithCodeAction(input: { email: string; code: string; password: string; confirmPassword: string }): Promise<PublicAuthActionState> {
  const parsed = passwordResetCodeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise o código e a nova senha." };
  try {
    await resetPasswordWithCode(parsed.data.email, parsed.data.code, parsed.data.password);
    return { ok: true, message: "Senha alterada. Agora você já pode entrar." };
  } catch (error) {
    return { ok: false, message: getDomainErrorMessage(error, "Não foi possível redefinir a senha.") };
  }
}

export async function resetPasswordAction(input: { token: string; password: string; confirmPassword: string }): Promise<PublicAuthActionState> {
  const parsed = passwordResetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise a nova senha." };
  try {
    await resetPassword(parsed.data.token, parsed.data.password);
    return { ok: true, message: "Senha alterada. Agora você já pode entrar." };
  } catch (error) {
    return { ok: false, message: getDomainErrorMessage(error, "Não foi possível redefinir a senha.") };
  }
}

export async function resendVerificationAction(email: string): Promise<PublicAuthActionState> {
  const parsed = passwordRecoverySchema.safeParse({ email });
  if (!parsed.success) return { ok: false, message: "Informe um e-mail válido." };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user && !user.emailVerifiedAt) {
    try {
      await sendAccountVerification(user);
    } catch (error) {
      return { ok: false, message: getDomainErrorMessage(error, "Não foi possível reenviar a confirmação.") };
    }
  }
  return { ok: true, message: "Se a conta estiver pendente, um novo link será enviado." };
}

export async function logout() {
  await deleteCurrentSession();
  revalidateTag("current-user");
  revalidatePath("/");
  redirect("/login");
}

export async function logoutFromClient() {
  await deleteCurrentSession();
  revalidateTag("current-user");
  revalidatePath("/");
  return { ok: true as const };
}
