"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { saveAnamnesis, saveClinicalEvolution } from "@/services/clinical/clinical-records";
import { anamneseDraftSchema, evolutionDraftSchema } from "@/utils/validators/clinical-drafts";

export async function saveAnamnesisAction(patientId: string, input: unknown) {
  const user = await requireUser();
  const parsed = anamneseDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Revise a anamnese." };
  try {
    await saveAnamnesis(user.id, patientId, parsed.data);
    revalidatePath(`/pacientes/${patientId}`);
    return { ok: true as const, message: "Anamnese salva com criptografia." };
  } catch (error) {
    return { ok: false as const, message: getDomainErrorMessage(error, "Não foi possível salvar a anamnese.") };
  }
}

export async function saveEvolutionAction(patientId: string, input: unknown) {
  const user = await requireUser();
  const parsed = evolutionDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Revise a evolução." };
  try {
    const data = await saveClinicalEvolution(user.id, patientId, parsed.data);
    revalidatePath(`/pacientes/${patientId}`);
    revalidatePath("/agenda");
    return { ok: true as const, message: "Evolução salva com criptografia.", data };
  } catch (error) {
    return { ok: false as const, message: getDomainErrorMessage(error, "Não foi possível salvar a evolução.") };
  }
}
