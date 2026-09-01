"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { createAppointmentWithConfirmation } from "@/services/appointments/create-appointment-with-confirmation";
import { appointmentSchema } from "@/utils/validators/appointment";

export type AppointmentActionState = {
  ok: boolean;
  message: string;
};

export async function createAppointmentAction(
  _state: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const user = await requireUser();
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise os dados da consulta."
    };
  }

  try {
    await createAppointmentWithConfirmation(user.id, parsed.data);
    revalidatePath("/agenda");
    revalidatePath("/dashboard");
    revalidatePath(`/pacientes/${parsed.data.patientId}`);

    return {
      ok: true,
      message: "Consulta criada e confirmação enviada para processamento."
    };
  } catch (error) {
    return {
      ok: false,
      message: getDomainErrorMessage(error, "Não foi possível criar a consulta.")
    };
  }
}
