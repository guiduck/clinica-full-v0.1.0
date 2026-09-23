"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { getDomainErrorMessage } from "@/lib/errors/domain-errors";
import { createAppointmentWithConfirmation } from "@/services/appointments/create-appointment-with-confirmation";
import { updateAppointment } from "@/services/appointments/update-appointment";
import { cancelAppointment } from "@/services/appointments/cancel-appointment";
import {
  finishAppointmentSession,
  startAppointmentSession,
} from "@/services/appointments/appointments";
import { appointmentSchema } from "@/utils/validators/appointment";
import { sessionFinishDraftSchema } from "@/utils/validators/clinical-drafts";

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

    const countMessage = result.createdCount > 1 ? `${result.createdCount} consultas semanais criadas.` : "Consulta criada.";
    const calendarMessage = result.calendarSynced
      ? ` ${result.createdCount > 1 ? "Todas foram sincronizadas" : "Google Agenda sincronizado"}.`
      : ` Google Agenda: ${result.calendarSyncedCount} de ${result.createdCount} sincronizada(s); conecte ou use “Sincronizar consultas pendentes”.`;

    if (!result.notificationScheduled) {
      return {
        ok: true,
        message:
          `${countMessage} O WhatsApp não está configurado, então não haverá confirmação nem lembretes automáticos.${calendarMessage}`,
      };
    }

    return {
      ok: true,
      message: `${countMessage} Confirmação da primeira consulta enviada para processamento.${calendarMessage}`,
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

export async function updateAppointmentAction(
  _state: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const user = await requireUser();
  const appointmentId = formData.get("appointmentId");
  if (typeof appointmentId !== "string" || !appointmentId) {
    return { ok: false, message: "Consulta não encontrada." };
  }
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise os dados da consulta." };
  }
  try {
    const updated = await updateAppointment(user.id, appointmentId, parsed.data);
    revalidatePath("/agenda");
    revalidatePath("/dashboard");
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/previsibilidade");
    revalidatePath(`/pacientes/${parsed.data.patientId}`);
    const calendarMessage = updated.calendarSynced
      ? " Google Agenda atualizado."
      : " Google Agenda não atualizado; conecte ou verifique a integração em Configurações → Segurança.";
    const notificationMessage = updated.timeChanged ? " Avise o paciente sobre o novo horário; nenhum WhatsApp automático foi enviado." : "";
    return { ok: true, message: `Consulta atualizada.${notificationMessage}${calendarMessage}` };
  } catch (error) {
    return { ok: false, message: getDomainErrorMessage(error, "Não foi possível atualizar a consulta.") };
  }
}

export async function cancelAppointmentAction(appointmentId: string) {
  const user = await requireUser();
  try {
    const result = await cancelAppointment(user.id, appointmentId);
    revalidatePath("/agenda");
    revalidatePath("/dashboard");
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/previsibilidade");
    revalidatePath(`/pacientes/${result.appointment.patientId}`);
    return {
      ok: true as const,
      message: result.calendarRemoved
        ? "Consulta cancelada e removida do Google Agenda."
        : "Consulta cancelada. Confira o Google Agenda se o evento ainda estiver visível.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: getDomainErrorMessage(error, "Não foi possível cancelar a consulta."),
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
  const parsed = sessionFinishDraftSchema.safeParse(input);
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
      message: result.evolution
        ? "Sessão finalizada e evolução salva com segurança."
        : "Sessão finalizada sem evolução clínica.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: getDomainErrorMessage(error, "Não foi possível finalizar a sessão."),
    };
  }
}
