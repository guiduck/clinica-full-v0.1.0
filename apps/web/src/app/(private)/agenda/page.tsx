import { AgendaCalendar } from "@/components/appointments/agenda-calendar";
import { requireUser } from "@/lib/auth/require-user";
import { listAppointments } from "@/services/appointments/appointments";
import { searchPatients } from "@/services/patients/patients";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";
import { getGoogleCalendarConnectionStatus } from "@/services/integrations/google-calendar";
import {
  addAgendaDays,
  agendaDateKey,
  agendaVisibleDays,
  type AgendaView,
} from "@/components/appointments/agenda-calendar-model";

type Props = {
  searchParams?: Promise<{
    view?: string;
    date?: string;
    open?: string;
    new?: string;
    patientId?: string;
  }>;
};
export default async function AgendaPage({ searchParams }: Props) {
  const user = await requireUser();
  const query = await searchParams;
  const initialView: AgendaView =
    query?.view === "dia" || query?.view === "mes" ? query.view : "semana";
  const hasValidDate = typeof query?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(query.date);
  const referenceDate = hasValidDate
    ? new Date(`${query.date}T12:00:00`)
    : new Date();
  const visibleDays = agendaVisibleDays(referenceDate, initialView);
  const firstVisibleDay = visibleDays[0] ?? referenceDate;
  const lastVisibleDay = visibleDays.at(-1) ?? referenceDate;
  const appointmentRange = {
    start: new Date(`${agendaDateKey(firstVisibleDay)}T00:00:00-03:00`),
    end: new Date(`${agendaDateKey(addAgendaDays(lastVisibleDay, 1))}T00:00:00-03:00`),
  };
  const [patients, appointments, googleCalendar] = await Promise.all([
    searchPatients(user.id),
    listAppointments(user.id, appointmentRange),
    getGoogleCalendarConnectionStatus(user.id),
  ]);

  const patientOptions = patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    hasCompleteFinancialProfile: Boolean(patient.financialProfile?.isComplete),
  }));

  return (
    <AgendaCalendar
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
        sessionStartedAt: appointment.sessionStartedAt?.toISOString() ?? null,
        sessionEndedAt: appointment.sessionEndedAt?.toISOString() ?? null,
      }))}
      initialView={initialView}
      initialDate={query?.date}
      initialOpen={query?.open ?? query?.new}
      defaultPatientId={query?.patientId}
      whatsappConfigured={Boolean(getWhatsAppConfig())}
      googleCalendarConnected={googleCalendar.connected}
    />
  );
}
