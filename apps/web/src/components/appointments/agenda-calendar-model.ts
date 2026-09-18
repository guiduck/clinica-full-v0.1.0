export type AgendaView = "dia" | "semana" | "mes";

export const AGENDA_HOUR_HEIGHT = 64;

export function startOfAgendaWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

export function addAgendaDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function agendaDateKey(date: Date | string) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function isSameAgendaDay(left: Date | string, right: Date | string) {
  return agendaDateKey(left) === agendaDateKey(right);
}

export function agendaVisibleDays(referenceDate: Date, view: AgendaView) {
  if (view === "dia") return [new Date(referenceDate)];
  const first =
    view === "semana"
      ? startOfAgendaWeek(referenceDate)
      : startOfAgendaWeek(
          new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
        );
  const count = view === "semana" ? 7 : 42;
  return Array.from({ length: count }, (_, index) =>
    addAgendaDays(first, index),
  );
}

export function shiftAgendaReferenceDate(
  referenceDate: Date,
  view: AgendaView,
  direction: -1 | 1,
) {
  const next = new Date(referenceDate);
  if (view === "mes") next.setMonth(next.getMonth() + direction);
  else next.setDate(next.getDate() + direction * (view === "semana" ? 7 : 1));
  return next;
}

export function agendaHeaderTitle(date: Date, view: AgendaView) {
  if (view === "dia") {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function appointmentGridPosition(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return {
    top:
      ((start.getHours() * 60 + start.getMinutes()) / 60) * AGENDA_HOUR_HEIGHT,
    height: Math.max(
      34,
      ((end.getTime() - start.getTime()) / 3_600_000) * AGENDA_HOUR_HEIGHT,
    ),
  };
}
