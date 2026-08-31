import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { createPatientAction } from "@/actions/patients";

const requireUserMock = vi.hoisted(() => vi.fn());
const createPatientMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock
}));

vi.mock("@/services/patients/patients", () => ({
  createPatient: createPatientMock
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock
}));

describe("patient actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    createPatientMock.mockResolvedValue({ id: "patient-1" });
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`redirect:${path}`);
    });
  });

  it("returns validation errors for invalid input", async () => {
    const formData = new FormData();
    formData.set("name", "");
    formData.set("phone", "123");

    const result = await createPatientAction({ ok: false, message: "" }, formData);

    expect(result.ok).toBe(false);
    expect(createPatientMock).not.toHaveBeenCalled();
  });

  it("returns duplicate input as typed action failure", async () => {
    createPatientMock.mockRejectedValue(new DomainError("DUPLICATE", "Duplicado."));
    const formData = new FormData();
    formData.set("name", "Maria Silva");
    formData.set("phone", "(11) 99999-9999");
    formData.set("intent", "save");

    const result = await createPatientAction({ ok: false, message: "" }, formData);

    expect(result).toEqual({ ok: false, message: "Duplicado." });
  });

  it("redirects to detail or finance after a valid save", async () => {
    const detailData = new FormData();
    detailData.set("name", "Maria Silva");
    detailData.set("phone", "(11) 99999-9999");
    detailData.set("intent", "save");

    await expect(createPatientAction({ ok: false, message: "" }, detailData)).rejects.toThrow(
      "redirect:/pacientes/patient-1"
    );

    const financeData = new FormData();
    financeData.set("name", "Maria Silva");
    financeData.set("phone", "(11) 99999-9999");
    financeData.set("intent", "save_and_go_to_finance");

    await expect(createPatientAction({ ok: false, message: "" }, financeData)).rejects.toThrow(
      "redirect:/pacientes/patient-1/financeiro?focus=payment"
    );
  });
});
