"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import { settingsAccountSchema } from "@/utils/validators/settings";

export async function saveProfessionalProfileAction(input: unknown) {
  const user = await requireUser();
  const parsed = settingsAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Revise os dados profissionais." };
  }
  if (parsed.data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { ok: false as const, message: "A troca de e-mail precisa de um fluxo de verificação próprio e ainda não está disponível." };
  }
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        cpf: parsed.data.cpf.replace(/\D/g, ""),
        specialty: parsed.data.specialty || null,
        council: parsed.data.council || null,
      },
    });
    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
    return { ok: true as const, message: "Dados profissionais salvos." };
  } catch {
    return { ok: false as const, message: "Não foi possível salvar. Verifique se o CPF já está associado a outra conta." };
  }
}
