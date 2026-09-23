"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { markAppNotificationRead } from "@/services/app-notifications/app-notifications";

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();
  await markAppNotificationRead(user.id, notificationId);
  revalidatePath("/", "layout");
}
