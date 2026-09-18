import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createAPIError } from "@/lib/errors/create-api-error";
import type { APIResponse, UserDTO } from "@/types/api";
import { isEmailVerificationRequired } from "@/services/email/email-config";
import { sendAccountVerification } from "@/services/auth/email-flows";

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterUserInput): Promise<APIResponse<UserDTO & { requiresEmailVerification: boolean }>> {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    return createAPIError("Ja existe uma conta com este e-mail.", 409);
  }

  const requiresEmailVerification = isEmailVerificationRequired();
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash: hashPassword(input.password),
      emailVerifiedAt: requiresEmailVerification ? null : new Date(),
    }
  });

  if (requiresEmailVerification) {
    try {
      await sendAccountVerification(user);
    } catch {
      await prisma.user.delete({ where: { id: user.id } });
      return createAPIError("Não foi possível enviar a confirmação. Confira o provedor de e-mail e tente novamente.", 502);
    }
  }

  return {
    status: 201,
    error: false,
    errorUserMessage: "",
    headers: null,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      requiresEmailVerification,
    }
  };
}
