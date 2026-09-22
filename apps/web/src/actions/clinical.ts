"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { DomainError, getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { saveAnamnesis, saveClinicalEvolution } from "@/services/clinical/clinical-records";
import { anamneseDraftSchema, evolutionDraftSchema } from "@/utils/validators/clinical-drafts";
import { getClinicalRecord } from "@/services/clinical/clinical-records";

export async function saveAnamnesisAction(patientId: string, input: unknown) {
  const user = await requireUser();
  const parsed = anamneseDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Revise a anamnese." };
  try {
    await saveAnamnesis(user.id, patientId, parsed.data);
    revalidatePath(`/pacientes/${patientId}`);
    return { ok: true as const, message: "Anamnese salva com criptografia." };
  } catch (error) {
    return { ok: false as const, message: error instanceof DomainError && error.code === "CONFIGURATION"
      ? "O salvamento clínico está indisponível por uma configuração de segurança. Nenhum dado foi salvo. Avise o responsável técnico."
      : getDomainErrorMessage(error, "Não foi possível salvar a anamnese.") };
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
    return { ok: false as const, message: error instanceof DomainError && error.code === "CONFIGURATION"
      ? "O salvamento clínico está indisponível por uma configuração de segurança. Nenhum dado foi salvo. Avise o responsável técnico."
      : getDomainErrorMessage(error, "Não foi possível salvar a evolução.") };
  }
}

export async function getClinicalSessionContextAction(patientId: string) {
  const user = await requireUser();
  try {
    const data = await getClinicalRecord(user.id, patientId);
    return { ok: true as const, data };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof DomainError && error.code === "CONFIGURATION"
        ? "O prontuário não pôde ser aberto porque a chave clínica da VPS está inválida."
        : getDomainErrorMessage(error, "Não foi possível carregar o contexto clínico."),
    };
  }
}
