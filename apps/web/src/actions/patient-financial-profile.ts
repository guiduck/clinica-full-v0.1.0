"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { upsertPatientFinancialProfile } from "@/services/patient-financial-profiles/patient-financial-profiles";
import { patientFinancialProfileSchema } from "@/utils/validators/patient-financial-profile";

export type FinancialProfileActionState = {
  ok: boolean;
  message: string;
};

export async function upsertPatientFinancialProfileAction(
  patientId: string,
  _state: FinancialProfileActionState,
  formData: FormData
): Promise<FinancialProfileActionState> {
  const user = await requireUser();
  const parsed = patientFinancialProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise os dados de pagamento."
    };
  }

  try {
    await upsertPatientFinancialProfile(user.id, patientId, parsed.data);
    revalidatePath(`/pacientes/${patientId}`);
    revalidatePath(`/pacientes/${patientId}/financeiro`);
    revalidatePath("/agenda");

    return {
      ok: true,
      message: "Dados de pagamento salvos."
    };
  } catch (error) {
    return {
      ok: false,
      message: getDomainErrorMessage(error, "Não foi possível salvar os dados de pagamento.")
    };
  }
}
