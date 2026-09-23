import type { FinanceEntry, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import type {
  ParsedFinanceEntryCreateInput,
  ParsedFinanceEntryUpdateInput,
} from "@/utils/validators/finance-entry";

export function snapshot(entry: FinanceEntry): Prisma.InputJsonObject {
  return {
    id: entry.id,
    patientId: entry.patientId,
    appointmentId: entry.appointmentId,
    recurrenceGroupId: entry.recurrenceGroupId,
    recurrenceIndex: entry.recurrenceIndex,
    recurrenceCount: entry.recurrenceCount,
    type: entry.type,
    status: entry.status,
    origin: entry.origin,
    description: entry.description,
    category: entry.category,
    paymentMethod: entry.paymentMethod,
    valueCents: entry.valueCents,
    date: entry.date.toISOString(),
    dueDate: entry.dueDate.toISOString(),
    effectiveAt: entry.effectiveAt?.toISOString() ?? null,
    canceledAt: entry.canceledAt?.toISOString() ?? null,
  };
}

export async function listFinanceEntries(userId: string) {
  return prisma.financeEntry.findMany({
    where: { userId },
    include: { patient: { select: { name: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 500,
  });
}

export async function createAppointmentFinanceEntry(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    patientId: string;
    patientName: string;
    appointmentId: string;
    appointmentType: string;
    paymentMethod: "pix" | "card" | "cash" | "insurance";
    valueCents: number;
    date: Date;
  },
) {
  const entry = await tx.financeEntry.create({
    data: {
      userId: input.userId,
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      type: "receita",
      status: "previsto",
      origin: "appointment",
      description: `${input.appointmentType} — ${input.patientName}`,
      category: "Avulso",
      paymentMethod: input.paymentMethod,
      valueCents: input.valueCents,
      date: input.date,
      dueDate: input.date,
    },
  });
  await tx.financeEntryEvent.create({
    data: { userId: input.userId, entryId: entry.id, type: "created", afterState: snapshot(entry) },
  });
  return entry;
}

export async function createManualFinanceEntry(
  userId: string,
  input: ParsedFinanceEntryCreateInput,
) {
  return prisma.$transaction(async (tx) => {
    if (input.patientId) {
      const patient = await tx.patient.findFirst({
        where: { id: input.patientId, userId },
        select: { id: true },
      });
      if (!patient) throw new DomainError("NOT_FOUND", "Paciente não encontrado.");
    }

    const count = input.type === "despesa" ? input.recurrenceCount : 1;
    const recurrenceGroupId = count > 1 ? randomUUID() : null;
    const entries = [];
    for (let index = 0; index < count; index += 1) {
      const status = index === 0 ? input.status : "previsto";
      const entry = await tx.financeEntry.create({
        data: {
          userId,
          patientId: input.patientId,
          type: input.type,
          status,
          origin: "manual",
          description: input.description,
          category: input.category,
          paymentMethod: input.paymentMethod,
          valueCents: input.valueCents,
          date: addUtcCalendarMonths(input.date, index),
          dueDate: addUtcCalendarMonths(input.dueDate, index),
          effectiveAt: status === "efetivado" ? new Date() : null,
          recurrenceGroupId,
          recurrenceIndex: recurrenceGroupId ? index + 1 : null,
          recurrenceCount: recurrenceGroupId ? count : null,
        },
      });
      await tx.financeEntryEvent.create({
        data: { userId, entryId: entry.id, type: "created", afterState: snapshot(entry) },
      });
      entries.push(entry);
    }
    return { entry: entries[0], entries, createdCount: entries.length };
  });
}

function addUtcCalendarMonths(value: Date, amount: number) {
  if (amount === 0) return new Date(value);
  const year = value.getUTCFullYear();
  const month = value.getUTCMonth() + amount;
  const day = value.getUTCDate();
  const targetYear = year + Math.floor(month / 12);
  const targetMonth = ((month % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(
    targetYear,
    targetMonth,
    Math.min(day, lastDay),
    value.getUTCHours(),
    value.getUTCMinutes(),
    value.getUTCSeconds(),
    value.getUTCMilliseconds(),
  ));
}

export async function updateFinanceEntry(
  userId: string,
  entryId: string,
  input: ParsedFinanceEntryUpdateInput,
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.financeEntry.findFirst({ where: { id: entryId, userId } });
    if (!current) throw new DomainError("NOT_FOUND", "Lançamento não encontrado.");
    if (current.status === "cancelado") {
      throw new DomainError("VALIDATION", "Um lançamento cancelado não pode ser alterado.");
    }
    const updated = await tx.financeEntry.update({
      where: { id: current.id },
      data: {
        description: input.description,
        category: input.category,
        paymentMethod: input.paymentMethod,
        valueCents: input.valueCents,
        date: input.date,
        dueDate: input.dueDate,
      },
    });
    await tx.financeEntryEvent.create({
      data: {
        userId,
        entryId: updated.id,
        type: "updated",
        beforeState: snapshot(current),
        afterState: snapshot(updated),
      },
    });
    return updated;
  });
}

export async function setFinanceEntryStatus(
  userId: string,
  entryId: string,
  status: "efetivado" | "cancelado",
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.financeEntry.findFirst({ where: { id: entryId, userId } });
    if (!current) throw new DomainError("NOT_FOUND", "Lançamento não encontrado.");
    if (current.status === status) return current;
    if (current.status === "cancelado") {
      throw new DomainError("VALIDATION", "O lançamento já foi cancelado.");
    }
    const now = new Date();
    const updated = await tx.financeEntry.update({
      where: { id: current.id },
      data: {
        status,
        effectiveAt: status === "efetivado" ? now : current.effectiveAt,
        canceledAt: status === "cancelado" ? now : null,
      },
    });
    await tx.financeEntryEvent.create({
      data: {
        userId,
        entryId: updated.id,
        type: status === "efetivado" ? "effected" : "canceled",
        beforeState: snapshot(current),
        afterState: snapshot(updated),
      },
    });
    return updated;
  });
}
