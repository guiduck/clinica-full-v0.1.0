import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { createPatient, searchPatients } from "@/services/patients/patients";

const prismaMock = vi.hoisted(() => ({
  patient: {
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

describe("patient service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates patient with normalized phone and CPF", async () => {
    prismaMock.patient.findFirst.mockResolvedValue(null);
    prismaMock.patient.create.mockResolvedValue({ id: "patient-1" });

    await createPatient("user-1", {
      name: "Maria Silva",
      phone: "(11) 99999-9999",
      email: undefined,
      cpf: "123.456.789-01",
      birthDate: undefined,
      notes: undefined,
      whatsappConsent: true,
      intent: "save"
    });

    expect(prismaMock.patient.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          normalizedPhone: "11999999999",
          normalizedCpf: "12345678901"
        })
      })
    );
  });

  it("blocks duplicate normalized phone or CPF inside the same therapist account", async () => {
    prismaMock.patient.findFirst.mockResolvedValue({ id: "existing-patient" });

    await expect(
      createPatient("user-1", {
        name: "Maria Silva",
        phone: "(11) 99999-9999",
        email: undefined,
        cpf: undefined,
        birthDate: undefined,
        notes: undefined,
        whatsappConsent: true,
        intent: "save"
      })
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("searches only patients owned by the current user", async () => {
    prismaMock.patient.findMany.mockResolvedValue([]);

    await searchPatients("user-1", "Maria");

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1"
        })
      })
    );
  });
});
