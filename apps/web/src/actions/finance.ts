"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import {
  createManualFinanceEntry,
  setFinanceEntryStatus,
  updateFinanceEntry,
} from "@/services/finance/finance-entries";
import {
  financeEntryCreateSchema,
  financeEntryStatusSchema,
  financeEntryUpdateSchema,
} from "@/utils/validators/finance-entry";

export type FinanceActionState = { ok: boolean; message: string };

function revalidateFinance(patientId?: string) {
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/previsibilidade");
  revalidatePath("/dashboard");
  if (patientId) revalidatePath(`/pacientes/${patientId}`);
}

export async function createFinanceEntryAction(
  _state: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const user = await requireUser();
  const parsed = financeEntryCreateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise o lançamento." };
  try {
    await createManualFinanceEntry(user.id, parsed.data);
    revalidateFinance(parsed.data.patientId);
    return { ok: true, message: "Lançamento salvo." };
  } catch (error) {
    return { ok: false, message: getDomainErrorMessage(error, "Não foi possível salvar o lançamento.") };
  }
}

export async function updateFinanceEntryAction(
  entryId: string,
  _state: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const user = await requireUser();
  const parsed = financeEntryUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise o lançamento." };
  try {
    await updateFinanceEntry(user.id, entryId, parsed.data);
    revalidateFinance();
    return { ok: true, message: "Lançamento atualizado." };
  } catch (error) {
    return { ok: false, message: getDomainErrorMessage(error, "Não foi possível atualizar o lançamento.") };
  }
}

export async function setFinanceEntryStatusAction(formData: FormData): Promise<FinanceActionState> {
  const user = await requireUser();
  const parsed = financeEntryStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Lançamento inválido." };
  try {
    await setFinanceEntryStatus(user.id, parsed.data.entryId, parsed.data.status);
    revalidateFinance();
    return { ok: true, message: parsed.data.status === "efetivado" ? "Lançamento efetivado." : "Lançamento cancelado." };
  } catch (error) {
    return { ok: false, message: getDomainErrorMessage(error, "Não foi possível alterar o lançamento.") };
  }
}
