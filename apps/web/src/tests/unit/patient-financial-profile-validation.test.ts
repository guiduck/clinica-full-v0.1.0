import { describe, expect, it } from "vitest";
import { patientFinancialProfileSchema } from "@/utils/validators/patient-financial-profile";

describe("patient financial profile validation", () => {
  it("accepts PIX with only PIX-required data", () => {
    const result = patientFinancialProfileSchema.safeParse({
      preferredPaymentMethod: "pix",
      defaultSessionPrice: "180",
      pixKeyType: "email",
      pixKey: "financeiro@clinica.com"
    });

    expect(result.success).toBe(true);
  });

  it("accepts cash without extra method data", () => {
    const result = patientFinancialProfileSchema.safeParse({
      preferredPaymentMethod: "cash",
      defaultSessionPrice: "150"
    });

    expect(result.success).toBe(true);
  });

  it("requires provider-safe card references and rejects raw card numbers", () => {
    const result = patientFinancialProfileSchema.safeParse({
      preferredPaymentMethod: "card",
      defaultSessionPrice: "220",
      cardProvider: "Stripe",
      cardPaymentMethodRef: "4242424242424242"
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail");
    }
    expect(result.error.flatten().fieldErrors.cardPaymentMethodRef).toContain(
      "Nao salve numero bruto de cartao. Use token/referencia segura do provedor."
    );
  });

  it("requires insurance payer when method is convenio", () => {
    const result = patientFinancialProfileSchema.safeParse({
      preferredPaymentMethod: "insurance",
      defaultSessionPrice: "200"
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail");
    }
    expect(result.error.flatten().fieldErrors.insuranceName).toContain("Informe o convenio/pagador.");
  });
});
