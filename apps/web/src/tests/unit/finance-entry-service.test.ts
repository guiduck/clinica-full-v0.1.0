import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import {
  createAppointmentFinanceEntry,
  createManualFinanceEntry,
  setFinanceEntryStatus,
  updateFinanceEntry,
} from "@/services/finance/finance-entries";

const tx = vi.hoisted(() => ({
  patient: { findFirst: vi.fn() },
  financeEntry: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  financeEntryEvent: { create: vi.fn() },
}));
const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  financeEntry: { findMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const entry = {
  id: "entry-1",
  userId: "user-1",
  patientId: "patient-1",
  appointmentId: null,
  type: "receita" as const,
  status: "previsto" as const,
  origin: "manual" as const,
  description: "Sessão",
  category: "Avulso",
  paymentMethod: "pix" as const,
  valueCents: 15000,
  date: new Date("2026-09-14T12:00:00.000Z"),
  dueDate: new Date("2026-09-14T12:00:00.000Z"),
  effectiveAt: null,
  canceledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("finance entry service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));
    tx.patient.findFirst.mockResolvedValue({ id: "patient-1" });
    tx.financeEntry.create.mockResolvedValue(entry);
    tx.financeEntry.findFirst.mockResolvedValue(entry);
    tx.financeEntry.update.mockImplementation(({ data }) => Promise.resolve({ ...entry, ...data }));
    tx.financeEntryEvent.create.mockResolvedValue({ id: "event-1" });
  });

  it("creates a manual entry and its audit event atomically", async () => {
    await createManualFinanceEntry("user-1", {
      type: "receita",
      patientId: "patient-1",
      description: "Sessão",
      category: "Avulso",
      paymentMethod: "pix",
      valueCents: 15000,
      date: entry.date,
      dueDate: entry.dueDate,
      status: "previsto",
    });
    expect(tx.financeEntry.create).toHaveBeenCalledOnce();
    expect(tx.financeEntryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: "created", entryId: "entry-1" }),
    });
  });

  it("creates exactly one appointment-linked source record", async () => {
    await createAppointmentFinanceEntry(tx as never, {
      userId: "user-1",
      patientId: "patient-1",
      patientName: "Ana",
      appointmentId: "appointment-1",
      appointmentType: "Sessão individual",
      paymentMethod: "pix",
      valueCents: 15000,
      date: entry.date,
    });
    expect(tx.financeEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ appointmentId: "appointment-1", origin: "appointment" }),
    });
  });

  it("does not create another audit event for an idempotent status request", async () => {
    tx.financeEntry.findFirst.mockResolvedValue({ ...entry, status: "efetivado" });
    await setFinanceEntryStatus("user-1", "entry-1", "efetivado");
    expect(tx.financeEntry.update).not.toHaveBeenCalled();
    expect(tx.financeEntryEvent.create).not.toHaveBeenCalled();
  });

  it("rejects foreign and canceled updates", async () => {
    tx.financeEntry.findFirst.mockResolvedValueOnce(null);
    await expect(updateFinanceEntry("user-2", "entry-1", {
      description: "Outra",
      category: "Avulso",
      paymentMethod: "pix",
      valueCents: 10000,
      date: entry.date,
      dueDate: entry.dueDate,
    })).rejects.toBeInstanceOf(DomainError);
  });
});
