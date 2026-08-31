import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createAPIError } from "@/lib/errors/create-api-error";
import type { APIResponse, UserDTO } from "@/types/api";

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterUserInput): Promise<APIResponse<UserDTO>> {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    return createAPIError("Ja existe uma conta com este e-mail.", 409);
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash: hashPassword(input.password)
    }
  });

  return {
    status: 201,
    error: false,
    errorUserMessage: "",
    headers: null,
    data: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}
