"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { deleteCurrentSession, setSessionCookie } from "@/lib/auth/session";
import { loginUser } from "@/services/auth/login";
import { registerUser } from "@/services/auth/register";
import type { APIResponse, AuthResponse } from "@/types/api";
import { registerSchema, type RegisterInput } from "@/utils/validators/register";

export async function registerAndLogin(input: RegisterInput): Promise<APIResponse<AuthResponse>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, error: true, errorUserMessage: parsed.error.issues[0]?.message ?? "Revise os dados informados.", data: null, headers: null };
  }

  const registerResult = await registerUser({ name: parsed.data.name, email: parsed.data.email, password: parsed.data.password });

  if (registerResult.error) {
    return {
      ...registerResult,
      data: null
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
        user: loginResult.data.user
      }
    };
  }

  return {
    ...loginResult,
    data: null
  };
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
