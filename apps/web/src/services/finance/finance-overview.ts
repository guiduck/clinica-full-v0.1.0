import { searchPatients } from "@/services/patients/patients";
import type { FinanceEntryView } from "@/types/finance";
import { listFinanceEntries } from "@/services/finance/finance-entries";

function financeStatus(status: string): FinanceEntryView["status"] {
  if (status === "realizada") return "efetivado";
  if (status === "cancelada" || status === "recusada") return "cancelado";
  return "previsto";
}

type FinancePatientRecord = Readonly<{
  id: string;
  name: string;
  financialProfile: null | Readonly<{
    isComplete: boolean;
    defaultSessionPriceCents: number;
    preferredPaymentMethod: string;
  }>;
}>;

type FinanceAppointmentRecord = Readonly<{
  id: string;
  patientId: string;
  type: string;
  status: string;
  startsAt: Date;
  patient: Readonly<{ name: string }>;
}>;

export function buildAppointmentFinanceEntries(
  patients: FinancePatientRecord[],
  appointments: FinanceAppointmentRecord[],
) {
  const profiles = new Map(
    patients.map((patient) => [patient.id, patient.financialProfile]),
  );
  return appointments.flatMap((appointment): FinanceEntryView[] => {
    const profile = profiles.get(appointment.patientId);
    if (!profile?.isComplete || profile.defaultSessionPriceCents <= 0) return [];
    return [{
      id: `appointment-${appointment.id}`,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.name,
      description: `${appointment.type} — ${appointment.patient.name} (à vista)`,
      category: "Avulso",
      type: "receita",
      paymentMethod: profile.preferredPaymentMethod,
      status: financeStatus(appointment.status),
      origin: "appointment",
      valueCents: profile.defaultSessionPriceCents,
      date: appointment.startsAt.toISOString(),
      dueDate: appointment.startsAt.toISOString(),
    }];
  });
}

export async function getFinanceOverview(userId: string) {
  const [patients, ledgerEntries] = await Promise.all([
    searchPatients(userId),
    listFinanceEntries(userId),
  ]);
  const entries: FinanceEntryView[] = ledgerEntries.map((entry) => ({
    id: entry.id,
    appointmentId: entry.appointmentId,
    patientId: entry.patientId,
    patientName: entry.patient?.name ?? "Sem paciente",
    description: entry.description,
    category: entry.category,
    type: entry.type,
    paymentMethod: entry.paymentMethod,
    status: entry.status,
    origin: entry.origin,
    valueCents: entry.valueCents,
    date: entry.date.toISOString(),
    dueDate: entry.dueDate.toISOString(),
  }));
  return {
    entries,
    patients: patients.map((patient) => ({ id: patient.id, name: patient.name })),
  };
}
