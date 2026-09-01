import { DomainError } from "@/lib/errors/domain-errors";

export function assertSafeCardReference(reference?: string | null) {
  const compactReference = reference?.replace(/\s/g, "") ?? "";

  if (/^\d{13,19}$/.test(compactReference)) {
    throw new DomainError(
      "VALIDATION",
      "Não salve número bruto de cartão. Use uma referência segura do provedor."
    );
  }

  return true;
}
