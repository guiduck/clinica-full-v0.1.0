export type FinanceEntryView = Readonly<{
  id: string;
  appointmentId: string | null;
  patientId: string | null;
  patientName: string;
  description: string;
  category: string;
  type: "receita" | "despesa";
  paymentMethod: string | null;
  status: "previsto" | "efetivado" | "cancelado";
  origin?: "appointment" | "manual";
  valueCents: number;
  date: string;
  dueDate: string;
}>;

export type FinancePatientOption = Readonly<{ id: string; name: string }>;
