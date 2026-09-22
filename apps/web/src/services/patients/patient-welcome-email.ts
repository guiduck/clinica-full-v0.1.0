import { patientWelcomeEmail } from "@/emails/patient-welcome";
import { sendTransactionalEmail } from "@/services/email/email-sender";
import { getPublicAppUrl } from "@/services/email/email-config";

export async function sendPatientWelcomeEmail(input: {
  patientName: string;
  patientEmail: string;
  professionalName: string;
}) {
  const message = patientWelcomeEmail(input.patientName, input.professionalName, getPublicAppUrl());
  await sendTransactionalEmail({ to: input.patientEmail, ...message });
}
