import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import type { ParsedPatientFinancialProfileInput } from "@/utils/validators/patient-financial-profile";
import { assertSafeCardReference } from "./card-safety";

function toCents(value: number) {
  return Math.round(value * 100);
}

function isComplete(input: ParsedPatientFinancialProfileInput) {
  if (input.defaultSessionPrice <= 0) {
    return false;
  }

  if (input.preferredPaymentMethod === "pix") {
    return Boolean(input.pixKeyType && input.pixKey);
  }

  if (input.preferredPaymentMethod === "card") {
    return Boolean(input.cardProvider && input.cardPaymentMethodRef);
  }

  if (input.preferredPaymentMethod === "insurance") {
    return Boolean(input.insuranceName);
  }

  return true;
}

export async function upsertPatientFinancialProfile(
  userId: string,
  patientId: string,
  input: ParsedPatientFinancialProfileInput
) {
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      userId
    }
  });

  if (!patient) {
    throw new DomainError("NOT_FOUND", "Paciente nao encontrado.");
  }

  assertSafeCardReference(input.cardPaymentMethodRef);

  const data = {
    userId,
    patientId,
    preferredPaymentMethod: input.preferredPaymentMethod,
    defaultSessionPriceCents: toCents(input.defaultSessionPrice),
    pixKeyType: input.preferredPaymentMethod === "pix" ? input.pixKeyType ?? null : null,
    pixKey: input.preferredPaymentMethod === "pix" ? input.pixKey ?? null : null,
    cardProvider: input.preferredPaymentMethod === "card" ? input.cardProvider ?? null : null,
    cardPaymentMethodRef:
      input.preferredPaymentMethod === "card" ? input.cardPaymentMethodRef ?? null : null,
    cardBrand: input.preferredPaymentMethod === "card" ? input.cardBrand ?? null : null,
    cardLast4: input.preferredPaymentMethod === "card" ? input.cardLast4 ?? null : null,
    cardHolderName: input.preferredPaymentMethod === "card" ? input.cardHolderName ?? null : null,
    insuranceName: input.preferredPaymentMethod === "insurance" ? input.insuranceName ?? null : null,
    insuranceMemberId:
      input.preferredPaymentMethod === "insurance" ? input.insuranceMemberId ?? null : null,
    insuranceAuthorizationInfo:
      input.preferredPaymentMethod === "insurance" ? input.insuranceAuthorizationInfo ?? null : null,
    isComplete: isComplete(input)
  };

  return prisma.patientFinancialProfile.upsert({
    where: {
      patientId
    },
    create: data,
    update: data
  });
}

export async function getPatientFinancialProfile(userId: string, patientId: string) {
  return prisma.patientFinancialProfile.findFirst({
    where: {
      userId,
      patientId
    }
  });
}

export async function assertPatientFinancialReady(userId: string, patientId: string) {
  const profile = await getPatientFinancialProfile(userId, patientId);

  if (!profile?.isComplete) {
    throw new DomainError(
      "PAYMENT_PROFILE_INCOMPLETE",
      "Cadastre os dados de pagamento do paciente antes de agendar."
    );
  }

  return profile;
}
