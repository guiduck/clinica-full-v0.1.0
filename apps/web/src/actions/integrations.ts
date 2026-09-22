"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { disconnectGoogleCalendar, syncUpcomingAppointmentsToGoogleCalendar } from "@/services/integrations/google-calendar";

export async function disconnectGoogleCalendarAction() {
  const user = await requireUser();
  await disconnectGoogleCalendar(user.id);
  revalidatePath("/configuracoes");
  return { ok: true as const };
}

export async function syncUpcomingAppointmentsAction() {
  const user = await requireUser();
  try {
    const result = await syncUpcomingAppointmentsToGoogleCalendar(user.id);
    revalidatePath("/agenda");
    return { ok: true as const, ...result };
  } catch {
    return { ok: false as const, message: "Não foi possível sincronizar. Verifique a conexão do Google Agenda em Configurações → Segurança." };
  }
}
