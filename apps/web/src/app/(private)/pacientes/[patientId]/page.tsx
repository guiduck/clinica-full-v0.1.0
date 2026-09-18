import { notFound } from "next/navigation";
import { PatientProfileView } from "@/components/patients/patient-profile-view";
import { requireUser } from "@/lib/auth/require-user";
import { getPatient } from "@/services/patients/patients";

type Props = {
  params: Promise<{
    patientId: string;
  }>;
  searchParams?: Promise<{ tab?: string }>;
};

export default async function PatientDetailPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const { patientId } = await params;
  const patient = await getPatient(user.id, patientId).catch(() => null);

  if (!patient) {
    notFound();
  }

  const query = await searchParams;
  const allowed = ["geral", "anamnese", "agenda", "prontuario", "financeiro", "documentos"] as const;
  const initialTab = allowed.includes(query?.tab as (typeof allowed)[number])
    ? (query?.tab as (typeof allowed)[number])
    : "geral";
  return <PatientProfileView patient={{
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    cpf: patient.cpf,
    birthDate: patient.birthDate?.toISOString() ?? null,
    notes: patient.notes,
    whatsappConsent: patient.whatsappConsent,
    emailConsent: patient.emailConsent,
    status: patient.status,
    financialComplete: Boolean(patient.financialProfile?.isComplete),
    defaultSessionPriceCents: patient.financialProfile?.defaultSessionPriceCents ?? null,
    financeEntries: patient.financeEntries.map((entry) => ({
      id: entry.id,
      appointmentId: entry.appointmentId,
      patientId: entry.patientId,
      patientName: patient.name,
      description: entry.description,
      category: entry.category,
      type: entry.type,
      paymentMethod: entry.paymentMethod,
      status: entry.status,
      origin: entry.origin,
      valueCents: entry.valueCents,
      date: entry.date.toISOString(),
      dueDate: entry.dueDate.toISOString(),
    })),
    appointments: patient.appointments.map((appointment) => ({
      id: appointment.id,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      status: appointment.status,
      type: appointment.type,
    })),
  }} initialTab={initialTab} />;
}
