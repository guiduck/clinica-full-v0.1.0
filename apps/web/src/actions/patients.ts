"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { createPatient } from "@/services/patients/patients";
import { patientSchema } from "@/utils/validators/patient";

export type PatientActionState = {
  ok: boolean;
  message: string;
};

export type PatientWizardActionState =
  | { ok: true; patientId: string; patientName: string }
  | { ok: false; message: string };

export async function createPatientWizardAction(
  formData: FormData,
): Promise<PatientWizardActionState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = patientSchema.safeParse({
    ...raw,
    whatsappConsent: formData.get("whatsappConsent") === "on",
    intent: "save",
  });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Revise os dados do paciente.",
    };
  }
  try {
    const patient = await createPatient(user.id, parsed.data);
    revalidatePath("/pacientes");
    revalidatePath("/dashboard");
    return { ok: true, patientId: patient.id, patientName: patient.name };
  } catch (error) {
    return {
      ok: false,
      message: getDomainErrorMessage(
        error,
        "Nao foi possivel cadastrar o paciente.",
      ),
    };
  }
}

export async function createPatientAction(
  _state: PatientActionState,
  formData: FormData
): Promise<PatientActionState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = patientSchema.safeParse({
    ...raw,
    whatsappConsent: formData.get("whatsappConsent") === "on"
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise os dados do paciente."
    };
  }

  let patientId: string;

  try {
    const patient = await createPatient(user.id, parsed.data);
    patientId = patient.id;
  } catch (error) {
    return {
      ok: false,
      message: getDomainErrorMessage(error, "Nao foi possivel cadastrar o paciente.")
    };
  }

  revalidatePath("/pacientes");
  revalidatePath("/dashboard");

  if (parsed.data.intent === "save_and_go_to_finance") {
    redirect(`/pacientes/${patientId}/financeiro?focus=payment`);
  }

  redirect(`/pacientes/${patientId}`);
}
