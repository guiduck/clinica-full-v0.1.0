import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors/domain-errors";
import { createAppointmentAction } from "@/actions/appointments";

const requireUserMock = vi.hoisted(() => vi.fn());
const createAppointmentMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock
}));

vi.mock("@/services/appointments/create-appointment-with-confirmation", () => ({
  createAppointmentWithConfirmation: createAppointmentMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock
}));

describe("appointment actions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    createAppointmentMock.mockResolvedValue({ id: "appointment-1" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects invalid appointment input", async () => {
    const formData = new FormData();

    const result = await createAppointmentAction({ ok: false, message: "" }, formData);

    expect(result.ok).toBe(false);
    expect(createAppointmentMock).not.toHaveBeenCalled();
  });

  it("creates appointment and revalidates related pages", async () => {
    const formData = new FormData();
    formData.set("patientId", "patient-1");
    formData.set("startsAt", "2026-06-10T12:00:00.000Z");
    formData.set("endsAt", "2026-06-10T13:00:00.000Z");

    const result = await createAppointmentAction({ ok: false, message: "" }, formData);

    expect(result.ok).toBe(true);
    expect(revalidatePathMock).toHaveBeenCalledWith("/agenda");
    expect(revalidatePathMock).toHaveBeenCalledWith("/pacientes/patient-1");
  });

  it("returns financial and WhatsApp precondition failures", async () => {
    const formData = new FormData();
    formData.set("patientId", "patient-1");
    formData.set("startsAt", "2026-06-10T12:00:00.000Z");
    formData.set("endsAt", "2026-06-10T13:00:00.000Z");

    createAppointmentMock.mockRejectedValueOnce(
      new DomainError("PAYMENT_PROFILE_INCOMPLETE", "Cadastre os dados de pagamento do paciente antes de agendar.")
    );
    const financeResult = await createAppointmentAction({ ok: false, message: "" }, formData);
    expect(financeResult.ok).toBe(false);
    expect(financeResult.message).toContain("pagamento");

    createAppointmentMock.mockRejectedValueOnce(
      new DomainError("WHATSAPP_NOT_CONFIGURED", "Configure o WhatsApp antes de criar consultas.")
    );
    const whatsappResult = await createAppointmentAction({ ok: false, message: "" }, formData);
    expect(whatsappResult.ok).toBe(false);
    expect(whatsappResult.message).toContain("WhatsApp");
  });
});
