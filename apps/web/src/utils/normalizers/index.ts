const DIGITS_PATTERN = /\D/g;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const BR_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function digitsOnly(value: string): string {
  return value.replace(DIGITS_PATTERN, "");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export function normalizeBrlCents(value: string | number): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value * 100) : null;
  }

  const sanitized = value.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!sanitized) {
    return null;
  }

  const normalized = sanitized.includes(",")
    ? sanitized.replace(/\./g, "").replace(",", ".")
    : sanitized;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

export function parseBrazilianDate(value: string): Date | null {
  const match = BR_DATE_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function normalizeBrazilianDate(value: string): string | null {
  const parsed = parseBrazilianDate(value);
  return parsed ? parsed.toISOString().slice(0, 10) : null;
}

export function normalizeTime24(value: string): string | null {
  const trimmed = value.trim();
  return TIME_PATTERN.test(trimmed) ? trimmed : null;
}
