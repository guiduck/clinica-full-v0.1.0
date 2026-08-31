export function buildAppointmentConfirmationMessage(input: {
  patientName: string;
  therapistName: string;
  startsAt: Date;
}) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(input.startsAt);

  return `Ola, ${input.patientName}. Sua consulta com ${input.therapistName} esta marcada para ${date}. Responda apenas sim ou nao para confirmar.`;
}
