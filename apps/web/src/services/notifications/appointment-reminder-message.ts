import { formatBrazilianDate, formatTime24 } from "@/utils/formatters";

export function buildAppointmentReminderMessage(input: {
  patientName: string;
  therapistName: string;
  startsAt: Date;
}) {
  return [
    `Olá, ${input.patientName}.`,
    `Lembrete da sua consulta com ${input.therapistName} em ${formatBrazilianDate(input.startsAt)} às ${formatTime24(input.startsAt)}.`,
    "Se precisar alterar o horário, entre em contato com o consultório.",
  ].join("\n\n");
}
