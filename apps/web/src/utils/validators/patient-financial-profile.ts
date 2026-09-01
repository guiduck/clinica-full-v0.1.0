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
      required_error: "Escolha um método de pagamento."
    }),
    defaultSessionPrice: z.coerce
      .number({ invalid_type_error: "Informe o valor padrão da sessão." })
      .positive("Informe um valor maior que zero."),
    pixKeyType: optionalText,
    pixKey: optionalText,
    cardProvider: optionalText,
    cardPaymentMethodRef: optionalText,
    cardBrand: optionalText,
    cardLast4: optionalText,
    cardHolderName: optionalText,
    cardInstallments: z.coerce.number().int().min(1).max(24).optional(),
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
          message: "Informe a referência segura do cartão no provedor.",
          path: ["cardPaymentMethodRef"]
        });
      }

      const possibleRawCard = value.cardPaymentMethodRef?.replace(/\s/g, "");
      if (possibleRawCard && /^\d{13,19}$/.test(possibleRawCard)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Não salve número bruto de cartão. Use token/referência segura do provedor.",
          path: ["cardPaymentMethodRef"]
        });
      }
    }

    if (value.preferredPaymentMethod === "insurance" && !value.insuranceName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o convênio/pagador.",
        path: ["insuranceName"]
      });
    }
  });

export const patientFinancialProfileResolver = zodResolver(patientFinancialProfileSchema);

export type PatientFinancialProfileInput = z.input<typeof patientFinancialProfileSchema>;
export type ParsedPatientFinancialProfileInput = z.output<typeof patientFinancialProfileSchema>;
