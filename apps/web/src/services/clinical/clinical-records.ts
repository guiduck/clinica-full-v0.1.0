import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { decryptSensitiveValue, encryptSensitiveValue } from "@/lib/security/encryption";
import { parseBrazilianDate } from "@/utils/normalizers";
import type { AnamneseDraft, EvolutionDraft } from "@/utils/validators/clinical-drafts";

type EvolutionPayload = Pick<EvolutionDraft, "free" | "subjective" | "objective" | "assessment" | "plan">;

async function assertPatientOwner(userId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({ where: { id: patientId, userId }, select: { id: true } });
  if (!patient) throw new DomainError("NOT_FOUND", "Paciente não encontrado.");
}

export async function getClinicalRecord(userId: string, patientId: string) {
  await assertPatientOwner(userId, patientId);
  const [anamnesis, evolutions] = await Promise.all([
    prisma.clinicalAnamnesis.findFirst({ where: { userId, patientId } }),
    prisma.clinicalEvolution.findMany({ where: { userId, patientId }, orderBy: { occurredAt: "desc" } }),
  ]);
  return {
    anamnesis: anamnesis ? decryptSensitiveValue<AnamneseDraft>(anamnesis.encryptedPayload) : {},
    evolutions: evolutions.map((item) => ({
      id: item.id,
      appointmentId: item.appointmentId,
      occurredAt: item.occurredAt.toISOString(),
      mood: item.mood,
      ...decryptSensitiveValue<EvolutionPayload>(item.encryptedPayload),
    })),
  };
}

export async function saveAnamnesis(userId: string, patientId: string, draft: AnamneseDraft) {
  await assertPatientOwner(userId, patientId);
  return prisma.clinicalAnamnesis.upsert({
    where: { patientId },
    update: { encryptedPayload: encryptSensitiveValue(draft), userId },
    create: { userId, patientId, encryptedPayload: encryptSensitiveValue(draft) },
  });
}

export async function saveClinicalEvolution(userId: string, patientId: string, draft: EvolutionDraft) {
  await assertPatientOwner(userId, patientId);
  if (draft.appointmentId) {
    const appointment = await prisma.appointment.findFirst({ where: { id: draft.appointmentId, userId, patientId }, select: { id: true } });
    if (!appointment) throw new DomainError("NOT_FOUND", "A consulta vinculada não foi encontrada.");
  }
  const date = parseBrazilianDate(draft.date);
  if (!date) throw new DomainError("VALIDATION", "Informe uma data válida.");
  const isoDate = date.toISOString().slice(0, 10);
  const occurredAt = new Date(`${isoDate}T${draft.time}:00-03:00`);
  const payload: EvolutionPayload = { free: draft.free, subjective: draft.subjective, objective: draft.objective, assessment: draft.assessment, plan: draft.plan };
  const data = {
    userId,
    patientId,
    appointmentId: draft.appointmentId ?? null,
    occurredAt,
    mood: draft.mood,
    encryptedPayload: encryptSensitiveValue(payload),
  };
  const saved = draft.appointmentId
    ? await prisma.clinicalEvolution.upsert({
        where: { appointmentId: draft.appointmentId },
        update: { occurredAt, mood: draft.mood, encryptedPayload: data.encryptedPayload },
        create: data,
      })
    : await prisma.clinicalEvolution.create({ data });
  return { id: saved.id, appointmentId: saved.appointmentId, occurredAt: saved.occurredAt.toISOString(), mood: saved.mood, ...payload };
}
