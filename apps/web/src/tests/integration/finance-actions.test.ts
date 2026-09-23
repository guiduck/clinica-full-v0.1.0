import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFinanceEntryAction,
  setFinanceEntryStatusAction,
  updateFinanceEntryAction,
} from "@/actions/finance";

const requireUserMock = vi.hoisted(() => vi.fn());
const createMock = vi.hoisted(() => vi.fn());
const updateMock = vi.hoisted(() => vi.fn());
const statusMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-user", () => ({ requireUser: requireUserMock }));
vi.mock("@/services/finance/finance-entries", () => ({
  createManualFinanceEntry: createMock,
  updateFinanceEntry: updateMock,
  setFinanceEntryStatus: statusMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

function validForm() {
  const formData = new FormData();
  formData.set("type", "receita");
  formData.set("description", "Sessão individual");
  formData.set("category", "Avulso");
  formData.set("paymentMethod", "pix");
  formData.set("valueCents", "150,00");
  formData.set("date", "14/09/2026");
  formData.set("dueDate", "14/09/2026");
  formData.set("status", "previsto");
  formData.set("recurrenceCount", "1");
  return formData;
}

describe("finance actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    createMock.mockResolvedValue({ entry: { id: "entry-1" }, entries: [{ id: "entry-1" }], createdCount: 1 });
    updateMock.mockResolvedValue({ id: "entry-1" });
    statusMock.mockResolvedValue({ id: "entry-1" });
  });

  it("reports how many monthly expenses were created", async () => {
    const formData = validForm();
    formData.set("type", "despesa");
    formData.set("category", "Aluguel");
    formData.set("recurrenceCount", "12");
    createMock.mockResolvedValueOnce({ createdCount: 12 });
    const result = await createFinanceEntryAction({ ok: false, message: "" }, formData);
    expect(result).toEqual({ ok: true, message: "12 despesas mensais criadas." });
  });

  it("creates and revalidates all financial consumers", async () => {
    const result = await createFinanceEntryAction({ ok: false, message: "" }, validForm());
    expect(result.ok).toBe(true);
    expect(createMock).toHaveBeenCalledWith("user-1", expect.objectContaining({ valueCents: 15000 }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/financeiro/previsibilidade");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects malformed entries before the service", async () => {
    const result = await createFinanceEntryAction({ ok: false, message: "" }, new FormData());
    expect(result.ok).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("updates and effects only the authenticated user's entry", async () => {
    const updateResult = await updateFinanceEntryAction("entry-1", { ok: false, message: "" }, validForm());
    expect(updateResult.ok).toBe(true);
    const statusData = new FormData();
    statusData.set("entryId", "entry-1");
    statusData.set("status", "efetivado");
    const statusResult = await setFinanceEntryStatusAction(statusData);
    expect(statusResult).toEqual({ ok: true, message: "Lançamento efetivado." });
    expect(statusMock).toHaveBeenCalledWith("user-1", "entry-1", "efetivado");
  });
});
