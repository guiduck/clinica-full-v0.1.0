import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import type { ParsedPatientInput } from "@/utils/validators/patient";
import type { ParsedPatientFinancialProfileInput } from "@/utils/validators/patient-financial-profile";
import { assertSafeCardReference } from "@/services/patient-financial-profiles/card-safety";
import { normalizeCpf, normalizePhone } from "./normalization";

export type CreatePatientWizardInput = Readonly<{
  patient: ParsedPatientInput;
  financial: ParsedPatientFinancialProfileInput;
}>;

const nullable = (value?: string) => value || null;

export async function createPatientWizard(userId: string, input: CreatePatientWizardInput) {
  const normalizedPhone = normalizePhone(input.patient.phone);
  const normalizedCpf = normalizeCpf(input.patient.cpf);
  assertSafeCardReference(input.financial.cardPaymentMethodRef);

  return prisma.$transaction(async (transaction) => {
    const duplicate = await transaction.patient.findFirst({
      where: {
        userId,
        OR: [
          { normalizedPhone },
          ...(normalizedCpf ? [{ normalizedCpf }] : []),
        ],
      },
      select: { id: true },
    });
    if (duplicate) throw new DomainError("DUPLICATE", "Já existe um paciente com este telefone ou CPF.");

    const patient = await transaction.patient.create({
      data: {
        userId,
        name: input.patient.name,
        phone: input.patient.phone,
        normalizedPhone,
        email: nullable(input.patient.email),
        cpf: nullable(input.patient.cpf),
        normalizedCpf,
        birthDate: input.patient.birthDate ? new Date(`${input.patient.birthDate}T12:00:00.000Z`) : null,
        notes: nullable(input.patient.notes),
        chiefComplaint: nullable(input.patient.chiefComplaint),
        whatsappConsent: input.patient.whatsappConsent,
        emailConsent: input.patient.emailConsent ?? false,
        addressZipCode: nullable(input.patient.addressZipCode),
        addressStreet: nullable(input.patient.addressStreet),
        addressNumber: nullable(input.patient.addressNumber),
        addressComplement: nullable(input.patient.addressComplement),
        addressCity: nullable(input.patient.addressCity),
        addressState: nullable(input.patient.addressState),
        emergencyContactName: nullable(input.patient.emergencyContactName),
        emergencyContactPhone: nullable(input.patient.emergencyContactPhone),
        emergencyContactRelationship: nullable(input.patient.emergencyContactRelationship),
        status: input.patient.status ?? "ativo",
      },
    });

    const method = input.financial.preferredPaymentMethod;
    const financialProfile = await transaction.patientFinancialProfile.create({
      data: {
        userId,
        patientId: patient.id,
        preferredPaymentMethod: method,
        defaultSessionPriceCents: Math.round(input.financial.defaultSessionPrice * 100),
        pixKeyType: method === "pix" ? nullable(input.financial.pixKeyType) : null,
        pixKey: method === "pix" ? nullable(input.financial.pixKey) : null,
        cardProvider: method === "card" ? nullable(input.financial.cardProvider) : null,
        cardPaymentMethodRef: method === "card" ? nullable(input.financial.cardPaymentMethodRef) : null,
        cardBrand: method === "card" ? nullable(input.financial.cardBrand) : null,
        cardLast4: method === "card" ? nullable(input.financial.cardLast4) : null,
        cardHolderName: method === "card" ? nullable(input.financial.cardHolderName) : null,
        cardInstallments: method === "card" ? input.financial.cardInstallments ?? null : null,
        insuranceName: method === "insurance" ? nullable(input.financial.insuranceName) : null,
        insuranceMemberId: method === "insurance" ? nullable(input.financial.insuranceMemberId) : null,
        insuranceAuthorizationInfo: method === "insurance" ? nullable(input.financial.insuranceAuthorizationInfo) : null,
        isComplete: true,
      },
    });

    return { patient, financialProfile };
  });
}
