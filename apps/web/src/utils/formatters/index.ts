const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

export function formatBrlFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function formatBrazilianDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE_FORMATTER.format(date);
}

export function formatTime24(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : TIME_FORMATTER.format(date);
}

const STATUS_LABELS = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  falta: "Falta",
  cancelada: "Cancelada",
  remarcada: "Remarcada",
  pendente: "Pendente",
  recusada: "Recusada",
  enviado: "Enviado",
  falhou: "Falhou",
  ativo: "Ativo",
  inativo: "Inativo",
  arquivado: "Arquivado"
} as const;

export function formatStatusLabel(status: string): string {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status;
}
