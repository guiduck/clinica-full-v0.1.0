import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireUser } from "@/lib/auth/require-user";
import { listAppointments } from "@/services/appointments/appointments";
import { searchPatients } from "@/services/patients/patients";
import { getUserUiPreference } from "@/services/ui-preferences/ui-preferences";
import { buildAppointmentFinanceEntries } from "@/services/finance/finance-overview";
import { getScheduledMessageSummary } from "@/services/messages/message-inbox";

export default async function DashboardPage() {
  const user = await requireUser();
  const [patients, appointments, preference, scheduledMessages] = await Promise.all([
    searchPatients(user.id),
    listAppointments(user.id),
    getUserUiPreference(user.id),
    getScheduledMessageSummary(user.id),
  ]);
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;
  const financeEntries = buildAppointmentFinanceEntries(patients, appointments);
  return (
    <DashboardView
      firstName={firstName}
      patients={patients.map((patient) => ({ id: patient.id, name: patient.name, status: patient.status }))}
      appointments={appointments.map((appointment) => ({
        id: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patient.name,
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt.toISOString(),
        status: appointment.status,
      }))}
      financeEntries={financeEntries}
      scheduledMessages={scheduledMessages.map((message) => ({
        id: message.id,
        patientName: message.patient.name,
        channel: message.channel,
        status: message.status,
        body: message.bodyText,
        scheduledFor: message.scheduledFor.toISOString(),
      }))}
      initialOrder={preference.dashboardSectionOrder}
      initialFinancialHidden={preference.hideFinancialValues}
      showNews={!preference.dismissedNewsBannerAt}
    />
  );
}
