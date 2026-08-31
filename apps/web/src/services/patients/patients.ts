import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import type { ParsedPatientInput } from "@/utils/validators/patient";
import { normalizeCpf, normalizePhone } from "./normalization";

export async function createPatient(userId: string, input: ParsedPatientInput) {
  const normalizedPhone = normalizePhone(input.phone);
  const normalizedCpf = normalizeCpf(input.cpf);

  const duplicate = await prisma.patient.findFirst({
    where: {
      userId,
      OR: [
        {
          normalizedPhone
        },
        ...(normalizedCpf
          ? [
              {
                normalizedCpf
              }
            ]
          : [])
      ]
    }
  });

  if (duplicate) {
    throw new DomainError("DUPLICATE", "Ja existe um paciente com este telefone ou CPF.");
  }

  return prisma.patient.create({
    data: {
      userId,
      name: input.name,
      phone: input.phone,
      normalizedPhone,
      email: input.email ?? null,
      cpf: input.cpf || null,
      normalizedCpf,
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      notes: input.notes || null,
      whatsappConsent: input.whatsappConsent
    },
    include: {
      financialProfile: true
    }
  });
}

export async function getPatient(userId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      userId
    },
    include: {
      financialProfile: true,
      appointments: {
        orderBy: {
          startsAt: "asc"
        },
        include: {
          notifications: {
            orderBy: {
              createdAt: "desc"
            },
            take: 1
          }
        }
      }
    }
  });

  if (!patient) {
    throw new DomainError("NOT_FOUND", "Paciente nao encontrado.");
  }

  return patient;
}

export async function searchPatients(userId: string, query = "") {
  const normalizedQuery = query.trim();
  const digits = normalizedQuery.replace(/\D/g, "");

  return prisma.patient.findMany({
    where: {
      userId,
      ...(normalizedQuery
        ? {
            OR: [
              {
                name: {
                  contains: normalizedQuery,
                  mode: "insensitive"
                }
              },
              {
                email: {
                  contains: normalizedQuery,
                  mode: "insensitive"
                }
              },
              ...(digits
                ? [
                    {
                      normalizedPhone: {
                        contains: digits
                      }
                    },
                    {
                      normalizedCpf: {
                        contains: digits
                      }
                    }
                  ]
                : [])
            ]
          }
        : {})
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      financialProfile: true
    },
    take: 50
  });
}
