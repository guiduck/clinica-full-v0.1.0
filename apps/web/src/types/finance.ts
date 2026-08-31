export type FinanceEntryView = Readonly<{
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  description: string;
  category: string;
  type: "receita" | "despesa";
  paymentMethod: string;
  status: "previsto" | "efetivado" | "cancelado";
  valueCents: number;
  date: string;
  dueDate: string;
}>;

export type FinancePatientOption = Readonly<{ id: string; name: string }>;
