"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { createPatientWizard } from "@/services/patients/create-patient-wizard";
import { createPatient } from "@/services/patients/patients";
import { patientSchema, patientWizardPatientSchema } from "@/utils/validators/patient";
import { patientFinancialProfileSchema } from "@/utils/validators/patient-financial-profile";

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
  const patientParsed = patientWizardPatientSchema.safeParse({
    ...raw,
    whatsappConsent: formData.get("whatsappConsent") === "on",
    emailConsent: formData.get("emailConsent") === "on",
    intent: "save",
  });
  if (!patientParsed.success) {
    return {
      ok: false,
      message:
        patientParsed.error.issues[0]?.message ?? "Revise os dados do paciente.",
    };
  }
  const financialParsed = patientFinancialProfileSchema.safeParse(raw);
  if (!financialParsed.success) return { ok: false, message: financialParsed.error.issues[0]?.message ?? "Revise os dados de pagamento." };
  try {
    const { patient } = await createPatientWizard(user.id, { patient: patientParsed.data, financial: financialParsed.data });
    revalidatePath("/pacientes");
    revalidatePath("/dashboard");
    revalidatePath("/agenda");
    return { ok: true, patientId: patient.id, patientName: patient.name };
  } catch (error) {
    return {
      ok: false,
      message: getDomainErrorMessage(
        error,
        "Não foi possível cadastrar o paciente.",
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
      message: getDomainErrorMessage(error, "Não foi possível cadastrar o paciente.")
    };
  }

  revalidatePath("/pacientes");
  revalidatePath("/dashboard");

  if (parsed.data.intent === "save_and_go_to_finance") {
    redirect(`/pacientes/${patientId}/financeiro?focus=payment`);
  }

  redirect(`/pacientes/${patientId}`);
}
