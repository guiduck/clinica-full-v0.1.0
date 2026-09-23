import { saoPauloAppointmentParts } from "@/utils/appointment-datetime";

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
  const leftDate = typeof left === "string" ? saoPauloAppointmentParts(left).date : agendaDateKey(left);
  const rightDate = typeof right === "string" ? saoPauloAppointmentParts(right).date : agendaDateKey(right);
  return leftDate === rightDate;
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

export function appointmentsForAgendaPeriod<T extends { startsAt: string }>(
  appointments: T[],
  referenceDate: Date,
  view: AgendaView,
) {
  const referenceKey = agendaDateKey(referenceDate);
  let matches: (appointment: T) => boolean;
  if (view === "dia") {
    matches = (appointment) =>
      saoPauloAppointmentParts(appointment.startsAt).date === referenceKey;
  } else if (view === "mes") {
    const monthKey = referenceKey.slice(0, 7);
    matches = (appointment) =>
      saoPauloAppointmentParts(appointment.startsAt).date.startsWith(monthKey);
  } else {
    const startKey = agendaDateKey(startOfAgendaWeek(referenceDate));
    const endKey = agendaDateKey(addAgendaDays(startOfAgendaWeek(referenceDate), 7));
    matches = (appointment) => {
      const dateKey = saoPauloAppointmentParts(appointment.startsAt).date;
      return dateKey >= startKey && dateKey < endKey;
    };
  }
  return appointments
    .filter(matches)
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
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
  const start = saoPauloAppointmentParts(startsAt);
  const end = new Date(endsAt);
  return {
    top:
      ((start.hour * 60 + start.minute) / 60) * AGENDA_HOUR_HEIGHT,
    height: Math.max(
      34,
      ((end.getTime() - new Date(startsAt).getTime()) / 3_600_000) * AGENDA_HOUR_HEIGHT,
    ),
  };
}
