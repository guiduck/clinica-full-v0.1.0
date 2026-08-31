import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/services/patients/normalization";
import { patientSchema } from "@/utils/validators/patient";

describe("patient validation", () => {
  it("requires name and valid phone", () => {
    const result = patientSchema.safeParse({
      name: "",
      phone: "123",
      whatsappConsent: false,
      intent: "save"
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail");
    }
    expect(result.error.flatten().fieldErrors.name).toContain("Informe o nome do paciente.");
    expect(result.error.flatten().fieldErrors.phone).toContain("Informe um telefone valido.");
  });

  it("accepts optional email, CPF, birth date, notes, and consent", () => {
    const result = patientSchema.safeParse({
      name: "Maria Silva",
      phone: "(11) 99999-9999",
      email: "maria@example.com",
      cpf: "123.456.789-01",
      birthDate: "1990-01-01",
      notes: "Prefere WhatsApp",
      whatsappConsent: true,
      intent: "save_and_go_to_finance"
    });

    expect(result.success).toBe(true);
  });

  it("normalizes phone digits for duplicate checks", () => {
    expect(normalizePhone("+55 (11) 99999-9999")).toBe("5511999999999");
  });
});
