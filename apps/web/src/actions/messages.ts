"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { cancelScheduledMessage } from "@/services/messages/scheduled-messages";
import { scheduleCustomMessage } from "@/services/messages/schedule-message";
import { scheduledMessageSchema } from "@/utils/validators/scheduled-message";

export async function scheduleMessageAction(input: unknown) {
  const user = await requireUser();
  const parsed = scheduledMessageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Revise a mensagem.",
    };
  }
  try {
    await scheduleCustomMessage(user.id, parsed.data);
    revalidatePath("/mensagens");
    revalidatePath("/dashboard");
    return {
      ok: true as const,
      message: "Mensagem adicionada à fila de envio.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: getDomainErrorMessage(error, "Não foi possível programar a mensagem."),
    };
  }
}

export async function cancelScheduledMessageAction(messageId: string) {
  const user = await requireUser();
  const canceled = await cancelScheduledMessage(user.id, messageId);
  revalidatePath("/mensagens");
  revalidatePath("/dashboard");
  return canceled
    ? { ok: true as const, message: "Mensagem cancelada." }
    : { ok: false as const, message: "A mensagem já foi processada ou não existe." };
}
