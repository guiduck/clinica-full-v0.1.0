import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { createPatientWizard } from "@/services/patients/create-patient-wizard";

const transactionMock = vi.hoisted(() => ({
  patient: { findFirst: vi.fn(), create: vi.fn() },
  patientFinancialProfile: { create: vi.fn() },
}));
const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn((callback: (transaction: typeof transactionMock) => unknown) => callback(transactionMock)),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const input = {
  patient: {
    name: "Maria Silva",
    phone: "(11) 99999-9999",
    email: "maria@example.com",
    cpf: "529.982.247-25",
    birthDate: "1990-01-31",
    notes: undefined,
    whatsappConsent: true,
    emailConsent: true,
    intent: "save" as const,
  },
  financial: {
    preferredPaymentMethod: "cash" as const,
    defaultSessionPrice: 250,
  },
};

describe("createPatientWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.patient.findFirst.mockResolvedValue(null);
    transactionMock.patient.create.mockResolvedValue({ id: "patient-1", name: "Maria Silva" });
    transactionMock.patientFinancialProfile.create.mockResolvedValue({ id: "profile-1" });
  });

  it("creates the patient and financial profile inside one transaction", async () => {
    await createPatientWizard("user-1", input);

    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(transactionMock.patient.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ normalizedCpf: "52998224725", emailConsent: true }) }));
    expect(transactionMock.patientFinancialProfile.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ patientId: "patient-1", defaultSessionPriceCents: 25000, isComplete: true }) }));
  });

  it("rejects duplicates before either record is created", async () => {
    transactionMock.patient.findFirst.mockResolvedValue({ id: "existing" });

    await expect(createPatientWizard("user-1", input)).rejects.toBeInstanceOf(DomainError);
    expect(transactionMock.patient.create).not.toHaveBeenCalled();
    expect(transactionMock.patientFinancialProfile.create).not.toHaveBeenCalled();
  });

  it("propagates a profile failure so Prisma rolls the transaction back", async () => {
    transactionMock.patientFinancialProfile.create.mockRejectedValue(new Error("profile failed"));

    await expect(createPatientWizard("user-1", input)).rejects.toThrow("profile failed");
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
  });
});
