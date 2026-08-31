export type NotificationStatus = "pendente" | "enviado" | "falhou";

export type NotificationAttemptSummary = {
  id: string;
  appointmentId: string;
  status: NotificationStatus;
  recipientPhone: string;
  providerMessageId: string | null;
  failureReason: string | null;
  sentAt: Date | null;
  createdAt: Date;
};
