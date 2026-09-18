"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { disconnectGoogleCalendar } from "@/services/integrations/google-calendar";

export async function disconnectGoogleCalendarAction() {
  const user = await requireUser();
  await disconnectGoogleCalendar(user.id);
  revalidatePath("/configuracoes");
  return { ok: true as const };
}
