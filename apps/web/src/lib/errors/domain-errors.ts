export type DomainErrorCode =
  | "UNAUTHENTICATED"
  | "NOT_FOUND"
  | "VALIDATION"
  | "DUPLICATE"
  | "PAYMENT_PROFILE_INCOMPLETE"
  | "WHATSAPP_NOT_CONFIGURED"
  | "APPOINTMENT_OVERLAP"
  | "PROVIDER_FAILURE";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export function getDomainErrorMessage(error: unknown, fallback = "Não foi possível concluir a ação.") {
  if (error instanceof DomainError) {
    return error.message;
  }

  return fallback;
}
