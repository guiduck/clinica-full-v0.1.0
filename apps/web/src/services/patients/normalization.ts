export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function isValidNormalizedPhone(phone: string) {
  return phone.length >= 10 && phone.length <= 13;
}

export function normalizeCpf(cpf?: string | null) {
  const normalized = cpf?.replace(/\D/g, "") ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function isValidNormalizedCpf(cpf: string) {
  return cpf.length === 11;
}
