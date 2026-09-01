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

  return `Olá, ${input.patientName}. Sua consulta com ${input.therapistName} está marcada para ${date}. Responda apenas sim ou não para confirmar.`;
}
