export const APPOINTMENT_TIME_OPTIONS = Array.from(
  { length: 24 * 6 },
  (_, index) => {
    const hours = Math.floor(index / 6);
    const minutes = (index % 6) * 10;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  },
);

export function isAppointmentTimeAfter(candidate: string, start: string) {
  return candidate > start;
}

export function keepOrAdvanceAppointmentEnd(start: string, currentEnd: string) {
  if (isAppointmentTimeAfter(currentEnd, start)) return currentEnd;

  const startIndex = APPOINTMENT_TIME_OPTIONS.indexOf(start);
  if (startIndex < 0) return "";

  return APPOINTMENT_TIME_OPTIONS[startIndex + 5] ?? "";
}
