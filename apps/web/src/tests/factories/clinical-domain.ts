import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function createTestUser(email = `user-${Date.now()}@example.com`) {
  return prisma.user.create({
    data: {
      name: "Terapeuta Teste",
      email,
      passwordHash: hashPassword("senha-segura")
    }
  });
}

export async function createLegacyPatient(userId: string, suffix = Date.now().toString()) {
  return prisma.patient.create({
    data: {
      userId,
      name: "Paciente legado",
      phone: `(11) 9${suffix.slice(-4)}-${suffix.slice(-4)}`,
      normalizedPhone: `119${suffix.slice(-8).padStart(8, "0")}`
    }
  });
}

export async function createCompletePatient(userId: string, suffix = Date.now().toString()) {
  const digits = suffix.replace(/\D/g, "").slice(-8).padStart(8, "0");

  return prisma.patient.create({
    data: {
      userId,
      name: "Paciente completo",
      phone: `(11) 9${digits.slice(0, 4)}-${digits.slice(4)}`,
      normalizedPhone: `119${digits}`,
      email: `paciente-${digits}@example.com`,
      cpf: "529.982.247-25",
      normalizedCpf: `529${digits}`.slice(0, 11),
      birthDate: new Date("1990-05-20T12:00:00.000Z"),
      chiefComplaint: "Queixa inicial",
      emailConsent: true,
      whatsappConsent: true,
      addressZipCode: "01310100",
      addressStreet: "Avenida Paulista",
      addressNumber: "1000",
      addressCity: "São Paulo",
      addressState: "SP",
      emergencyContactName: "Contato de emergência",
      emergencyContactPhone: "11999999999",
      emergencyContactRelationship: "Familiar"
    }
  });
}
