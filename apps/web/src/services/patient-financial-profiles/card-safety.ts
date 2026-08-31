import { DomainError } from "@/lib/errors/domain-errors";

export function assertSafeCardReference(reference?: string | null) {
  const compactReference = reference?.replace(/\s/g, "") ?? "";

  if (/^\d{13,19}$/.test(compactReference)) {
    throw new DomainError(
      "VALIDATION",
      "Nao salve numero bruto de cartao. Use uma referencia segura do provedor."
    );
  }

  return true;
}
