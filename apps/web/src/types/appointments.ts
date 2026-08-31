import type { PatientSummary } from "./patients";
import type { NotificationAttemptSummary } from "./notifications";

export type AppointmentStatus = "agendada";

export type AppointmentSummary = {
  id: string;
  patientId: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  patient: Pick<PatientSummary, "id" | "name" | "phone">;
  latestNotification: NotificationAttemptSummary | null;
};
