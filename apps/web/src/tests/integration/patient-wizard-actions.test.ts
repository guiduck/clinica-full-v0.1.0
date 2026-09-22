import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPatientWizardAction } from "@/actions/patients";

const requireUserMock = vi.hoisted(() => vi.fn());
const createPatientWizardMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());
const sendWelcomeEmailMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-user", () => ({ requireUser: requireUserMock }));
vi.mock("@/services/patients/create-patient-wizard", () => ({ createPatientWizard: createPatientWizardMock }));
vi.mock("@/services/patients/patient-welcome-email", () => ({ sendPatientWelcomeEmail: sendWelcomeEmailMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const validForm = () => {
  const form = new FormData();
  form.set("name", "Maria Silva");
  form.set("cpf", "529.982.247-25");
  form.set("birthDate", "1990-01-31");
  form.set("email", "maria@example.com");
  form.set("phone", "(11) 99999-9999");
  form.set("whatsappConsent", "on");
  form.set("emailConsent", "on");
  form.set("preferredPaymentMethod", "cash");
  form.set("defaultSessionPrice", "250");
  return form;
};

describe("createPatientWizardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1", name: "Dra. Joana" });
    createPatientWizardMock.mockResolvedValue({ patient: { id: "patient-1", name: "Maria Silva", email: "maria@example.com", emailConsent: true }, financialProfile: { id: "profile-1" } });
    sendWelcomeEmailMock.mockResolvedValue(undefined);
  });

  it("validates both steps before starting the transaction", async () => {
    const form = validForm();
    form.delete("defaultSessionPrice");

    const result = await createPatientWizardAction(form);

    expect(result.ok).toBe(false);
    expect(createPatientWizardMock).not.toHaveBeenCalled();
  });

  it("passes patient and supported Avulso payment data to one service call", async () => {
    const result = await createPatientWizardAction(validForm());

    expect(result).toEqual({ ok: true, patientId: "patient-1", patientName: "Maria Silva" });
    expect(createPatientWizardMock).toHaveBeenCalledOnce();
    expect(createPatientWizardMock).toHaveBeenCalledWith("user-1", {
      patient: expect.objectContaining({ emailConsent: true, whatsappConsent: true }),
      financial: expect.objectContaining({ preferredPaymentMethod: "cash", defaultSessionPrice: 250 }),
    });
  });

  it("sends the welcome e-mail only after the patient is persisted", async () => {
    const form = validForm();
    form.set("sendWelcomeEmail", "on");

    const result = await createPatientWizardAction(form);

    expect(result).toEqual(expect.objectContaining({
      ok: true,
      welcomeMessage: "E-mail de boas-vindas enviado.",
    }));
    expect(sendWelcomeEmailMock).toHaveBeenCalledWith({
      patientName: "Maria Silva",
      patientEmail: "maria@example.com",
      professionalName: "Dra. Joana",
    });
    expect(createPatientWizardMock.mock.invocationCallOrder[0]).toBeLessThan(
      sendWelcomeEmailMock.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
  });
});
