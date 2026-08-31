"use server";

import { requireUser } from "@/lib/auth/require-user";
import { updateUserUiPreference } from "@/services/ui-preferences/ui-preferences";
import type { UserUiPreferenceOperation } from "@/types/ui-preferences";

export async function updateUserUiPreferenceAction(input: UserUiPreferenceOperation) {
  const user = await requireUser();
  const preference = await updateUserUiPreference(user.id, input);
  return { ok: true as const, preference };
}
