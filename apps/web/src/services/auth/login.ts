import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createAPIError } from "@/lib/errors/create-api-error";
import type { APIResponse, AuthResponse } from "@/types/api";

export async function loginUser(email: string, password: string): Promise<APIResponse<AuthResponse & { token: string; expiresAt: string }>> {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase()
    }
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return createAPIError("E-mail ou senha invalidos.", 401);
  }

  const session = await createSession(user.id);

  return {
    status: 200,
    error: false,
    errorUserMessage: "",
    headers: null,
    data: {
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }
  };
}
