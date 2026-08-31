import { AgendaCalendar } from "@/components/appointments/agenda-calendar";
import { requireUser } from "@/lib/auth/require-user";
import { listAppointments } from "@/services/appointments/appointments";
import { searchPatients } from "@/services/patients/patients";

type Props = { searchParams?: Promise<{ view?: string; date?: string; open?: string; new?: string; patientId?: string }> };
export default async function AgendaPage({ searchParams }: Props) {
  const user = await requireUser();
  const [patients, appointments] = await Promise.all([
    searchPatients(user.id),
    listAppointments(user.id),
  ]);

  const patientOptions = patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    hasCompleteFinancialProfile: Boolean(patient.financialProfile?.isComplete),
  }));

  const query = await searchParams;
  const initialView = query?.view === "dia" || query?.view === "mes" ? query.view : "semana";
  return <AgendaCalendar
    patients={patientOptions}
    appointments={appointments.map((appointment) => ({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.name,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      status: appointment.status,
      type: appointment.type,
      videoUrl: appointment.videoUrl,
    }))}
    initialView={initialView}
    initialDate={query?.date}
    initialOpen={query?.open ?? query?.new}
    defaultPatientId={query?.patientId}
  />;
}
