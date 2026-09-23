export type ShellNotificationView = Readonly<{
  id: string;
  type: "appointment" | "payment" | "birthday" | "message" | "document";
  title: string;
  description: string;
  href: string;
  readAt: string | null;
  createdAt: string;
}>;

export type AppShellView = Readonly<{
  notifications: readonly ShellNotificationView[];
  pendingMessageCount: number;
  unreadCount?: number;
}>;

export type AppShellProps = Readonly<{
  children: React.ReactNode;
  userName: string;
  shell: AppShellView;
  appointmentPatients: ReadonlyArray<{
    id: string;
    name: string;
    hasCompleteFinancialProfile: boolean;
    email: string | null;
    phone: string;
    emailConsent: boolean;
    whatsappConsent: boolean;
  }>;
  whatsappConfigured: boolean;
  initialStep: number;
  initiallyOpen: boolean;
}>;