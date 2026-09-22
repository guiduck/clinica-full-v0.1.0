const SAO_PAULO_DATE_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function brazilianAppointmentDateTime(date: string, time: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (!match || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "";
  const [, day, month, year] = match;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (parsedDate.getUTCFullYear() !== Number(year) || parsedDate.getUTCMonth() + 1 !== Number(month) || parsedDate.getUTCDate() !== Number(day)) return "";
  return `${year}-${month}-${day}T${time}:00-03:00`;
}

export function saoPauloAppointmentParts(value: Date | string) {
  const parts = SAO_PAULO_DATE_TIME.formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    hour: Number(part("hour")),
    minute: Number(part("minute")),
  };
}
