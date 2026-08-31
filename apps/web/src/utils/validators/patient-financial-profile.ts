import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const patientFinancialProfileSchema = z
  .object({
    preferredPaymentMethod: z.enum(["pix", "card", "cash", "insurance"], {
      required_error: "Escolha um metodo de pagamento."
    }),
    defaultSessionPrice: z.coerce
      .number({ invalid_type_error: "Informe o valor padrao da sessao." })
      .positive("Informe um valor maior que zero."),
    pixKeyType: optionalText,
    pixKey: optionalText,
    cardProvider: optionalText,
    cardPaymentMethodRef: optionalText,
    cardBrand: optionalText,
    cardLast4: optionalText,
    cardHolderName: optionalText,
    insuranceName: optionalText,
    insuranceMemberId: optionalText,
    insuranceAuthorizationInfo: optionalText
  })
  .superRefine((value, ctx) => {
    if (value.preferredPaymentMethod === "pix" && (!value.pixKeyType || !value.pixKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe tipo e chave PIX.",
        path: ["pixKey"]
      });
    }

    if (value.preferredPaymentMethod === "card") {
      if (!value.cardProvider || !value.cardPaymentMethodRef) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe a referencia segura do cartao no provedor.",
          path: ["cardPaymentMethodRef"]
        });
      }

      const possibleRawCard = value.cardPaymentMethodRef?.replace(/\s/g, "");
      if (possibleRawCard && /^\d{13,19}$/.test(possibleRawCard)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nao salve numero bruto de cartao. Use token/referencia segura do provedor.",
          path: ["cardPaymentMethodRef"]
        });
      }
    }

    if (value.preferredPaymentMethod === "insurance" && !value.insuranceName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o convenio/pagador.",
        path: ["insuranceName"]
      });
    }
  });

export const patientFinancialProfileResolver = zodResolver(patientFinancialProfileSchema);

export type PatientFinancialProfileInput = z.input<typeof patientFinancialProfileSchema>;
export type ParsedPatientFinancialProfileInput = z.output<typeof patientFinancialProfileSchema>;
