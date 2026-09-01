import { listAppointments } from "@/services/appointments/appointments";
import { searchPatients } from "@/services/patients/patients";
import type { FinanceEntryView } from "@/types/finance";

function financeStatus(status: string): FinanceEntryView["status"] {
  if (status === "realizada") return "efetivado";
  if (status === "cancelada" || status === "recusada") return "cancelado";
  return "previsto";
}

export async function getFinanceOverview(userId: string) {
  const [patients, appointments] = await Promise.all([
    searchPatients(userId),
    listAppointments(userId),
  ]);
  const profiles = new Map(patients.map((patient) => [patient.id, patient.financialProfile]));
  const entries: FinanceEntryView[] = appointments.flatMap((appointment) => {
    const profile = profiles.get(appointment.patientId);
    if (!profile?.isComplete || profile.defaultSessionPriceCents <= 0) return [];
    const status = financeStatus(appointment.status);
    return [{
      id: `appointment-${appointment.id}`,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.name,
      description: `${appointment.type} — ${appointment.patient.name} (à vista)`,
      category: "Avulso",
      type: "receita" as const,
      paymentMethod: profile.preferredPaymentMethod,
      status,
      valueCents: profile.defaultSessionPriceCents,
      date: appointment.startsAt.toISOString(),
      dueDate: appointment.startsAt.toISOString(),
    }];
  });
  return {
    entries,
    patients: patients.map((patient) => ({ id: patient.id, name: patient.name })),
  };
}
