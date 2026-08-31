import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import {
  assertPatientFinancialReady,
  upsertPatientFinancialProfile
} from "@/services/patient-financial-profiles/patient-financial-profiles";

const prismaMock = vi.hoisted(() => ({
  patient: {
    findFirst: vi.fn()
  },
  patientFinancialProfile: {
    findFirst: vi.fn(),
    upsert: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

describe("patient financial profile service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts method-specific data for the owned patient", async () => {
    prismaMock.patient.findFirst.mockResolvedValue({ id: "patient-1" });
    prismaMock.patientFinancialProfile.upsert.mockResolvedValue({ id: "profile-1" });

    await upsertPatientFinancialProfile("user-1", "patient-1", {
      preferredPaymentMethod: "pix",
      defaultSessionPrice: 180,
      pixKeyType: "email",
      pixKey: "pix@clinica.com",
      cardProvider: undefined,
      cardPaymentMethodRef: undefined,
      cardBrand: undefined,
      cardLast4: undefined,
      cardHolderName: undefined,
      insuranceName: undefined,
      insuranceMemberId: undefined,
      insuranceAuthorizationInfo: undefined
    });

    expect(prismaMock.patientFinancialProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          userId: "user-1",
          patientId: "patient-1",
          defaultSessionPriceCents: 18000,
          isComplete: true
        })
      })
    );
  });

  it("blocks financial writes for patients outside the user account", async () => {
    prismaMock.patient.findFirst.mockResolvedValue(null);

    await expect(
      upsertPatientFinancialProfile("user-1", "patient-2", {
        preferredPaymentMethod: "cash",
        defaultSessionPrice: 180,
        pixKeyType: undefined,
        pixKey: undefined,
        cardProvider: undefined,
        cardPaymentMethodRef: undefined,
        cardBrand: undefined,
        cardLast4: undefined,
        cardHolderName: undefined,
        insuranceName: undefined,
        insuranceMemberId: undefined,
        insuranceAuthorizationInfo: undefined
      })
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("requires a complete profile before appointment creation", async () => {
    prismaMock.patientFinancialProfile.findFirst.mockResolvedValue({ isComplete: false });

    await expect(assertPatientFinancialReady("user-1", "patient-1")).rejects.toBeInstanceOf(DomainError);
  });
});
