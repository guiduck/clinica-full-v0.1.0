"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { setSessionCookie } from "@/lib/auth/session";
import { loginUser } from "@/services/auth/login";
import type { APIResponse, AuthResponse } from "@/types/api";

export async function loginAndSetSession(input: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<APIResponse<AuthResponse>> {
  const result = await loginUser(input.email, input.password);

  if (!result.error && result.data) {
    await setSessionCookie(result.data.token, new Date(result.data.expiresAt));
    revalidateTag("current-user");
    revalidatePath("/dashboard");

    return {
      status: 200,
      error: false,
      errorUserMessage: "",
      headers: null,
      data: {
        user: result.data.user
      }
    };
  }

  return { status: result.status, error: true, errorUserMessage: result.errorUserMessage, headers: null, data: null };
}
