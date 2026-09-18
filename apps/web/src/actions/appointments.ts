"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { createAppointmentWithConfirmation } from "@/services/appointments/create-appointment-with-confirmation";
import {
  finishAppointmentSession,
  startAppointmentSession,
} from "@/services/appointments/appointments";
import { appointmentSchema } from "@/utils/validators/appointment";
import { evolutionDraftSchema } from "@/utils/validators/clinical-drafts";

export type AppointmentActionState = {
  ok: boolean;
  message: string;
};

export async function createAppointmentAction(
  _state: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const user = await requireUser();
  const parsed = appointmentSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Revise os dados da consulta.",
    };
  }

  try {
    const result = await createAppointmentWithConfirmation(
      user.id,
      parsed.data,
    );
    revalidatePath("/agenda");
    revalidatePath("/dashboard");
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/previsibilidade");
    revalidatePath(`/pacientes/${parsed.data.patientId}`);

    if (!result.notificationScheduled) {
      return {
        ok: true,
        message:
          "Consulta criada. O WhatsApp não está configurado, então não haverá confirmação nem lembretes automáticos.",
      };
    }

    return {
      ok: true,
      message: "Consulta criada e confirmação enviada para processamento.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getDomainErrorMessage(
        error,
        "Não foi possível criar a consulta.",
      ),
    };
  }
}

export async function startAppointmentSessionAction(appointmentId: string) {
  const user = await requireUser();
  try {
    await startAppointmentSession(user.id, appointmentId);
    revalidatePath("/agenda");
    return { ok: true as const, message: "Sessão iniciada." };
  } catch (error) {
    return {
      ok: false as const,
      message: getDomainErrorMessage(error, "Não foi possível iniciar a sessão."),
    };
  }
}

export async function finishAppointmentSessionAction(
  appointmentId: string,
  input: unknown,
) {
  const user = await requireUser();
  const parsed = evolutionDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Revise a evolução clínica.",
    };
  }

  try {
    const result = await finishAppointmentSession(user.id, appointmentId, parsed.data);
    revalidatePath("/agenda");
    revalidatePath(`/pacientes/${result.patientId}`);
    revalidatePath("/financeiro");
    return {
      ok: true as const,
      message: "Sessão finalizada e evolução salva com segurança.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: getDomainErrorMessage(error, "Não foi possível finalizar a sessão."),
    };
  }
}
