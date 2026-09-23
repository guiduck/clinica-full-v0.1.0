export type MessageChannelView = "email" | "whatsapp";
export type ScheduledMessageStatusView =
  | "queued"
  | "processing"
  | "sent"
  | "failed"
  | "canceled";

export type MessagePatientOption = Readonly<{
  id: string;
  name: string;
  email: string | null;
  phone: string;
  emailConsent: boolean;
  whatsappConsent: boolean;
}>;

export type ScheduledMessageView = Readonly<{
  id: string;
  patientId: string;
  patientName: string;
  channel: MessageChannelView;
  purpose: string;
  status: ScheduledMessageStatusView;
  subject: string | null;
  body: string;
  scheduledFor: string;
  lastError: string | null;
}>;

export type ConversationMessageView = Readonly<{
  id: string;
  patientId: string;
  patientName: string;
  channel: MessageChannelView;
  direction: "inbound" | "outbound";
  status: string;
  body: string;
  occurredAt: string;
}>;

export type MessageInboxView = Readonly<{
  messages: readonly ConversationMessageView[];
  scheduled: readonly ScheduledMessageView[];
}>;
