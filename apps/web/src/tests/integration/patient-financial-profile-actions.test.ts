import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { upsertPatientFinancialProfileAction } from "@/actions/patient-financial-profile";

const requireUserMock = vi.hoisted(() => vi.fn());
const upsertMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock
}));

vi.mock("@/services/patient-financial-profiles/patient-financial-profiles", () => ({
  upsertPatientFinancialProfile: upsertMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock
}));

describe("patient financial profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    upsertMock.mockResolvedValue({ id: "profile-1" });
  });

  it("rejects incomplete method data", async () => {
    const formData = new FormData();
    formData.set("preferredPaymentMethod", "pix");
    formData.set("defaultSessionPrice", "180");

    const result = await upsertPatientFinancialProfileAction("patient-1", { ok: false, message: "" }, formData);

    expect(result.ok).toBe(false);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("saves a valid finance profile", async () => {
    const formData = new FormData();
    formData.set("preferredPaymentMethod", "cash");
    formData.set("defaultSessionPrice", "180");

    const result = await upsertPatientFinancialProfileAction("patient-1", { ok: false, message: "" }, formData);

    expect(result).toEqual({ ok: true, message: "Dados de pagamento salvos." });
    expect(upsertMock).toHaveBeenCalledWith("user-1", "patient-1", expect.objectContaining({
      preferredPaymentMethod: "cash"
    }));
  });

  it("returns user isolation errors without leaking internals", async () => {
    upsertMock.mockRejectedValue(new DomainError("NOT_FOUND", "Paciente nao encontrado."));
    const formData = new FormData();
    formData.set("preferredPaymentMethod", "cash");
    formData.set("defaultSessionPrice", "180");

    const result = await upsertPatientFinancialProfileAction("patient-2", { ok: false, message: "" }, formData);

    expect(result).toEqual({ ok: false, message: "Paciente nao encontrado." });
  });
});
