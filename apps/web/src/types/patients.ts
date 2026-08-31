export type PatientStatus = "ativo" | "inativo" | "arquivado";

export type PaymentMethod = "pix" | "card" | "cash" | "insurance";

export type PatientSummary = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
  whatsappConsent: boolean;
  status: PatientStatus;
  hasCompleteFinancialProfile: boolean;
};

export type PatientFinancialProfileSummary = {
  id: string;
  patientId: string;
  preferredPaymentMethod: PaymentMethod;
  defaultSessionPriceCents: number;
  currency: string;
  isComplete: boolean;
  pixKeyType: string | null;
  pixKey: string | null;
  cardProvider: string | null;
  cardPaymentMethodRef: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardHolderName: string | null;
  insuranceName: string | null;
  insuranceMemberId: string | null;
  insuranceAuthorizationInfo: string | null;
};
