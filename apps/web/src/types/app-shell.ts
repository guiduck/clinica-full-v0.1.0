export type ShellNotificationView = Readonly<{
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
}>;

export type AppShellView = Readonly<{
  notifications: readonly ShellNotificationView[];
  pendingMessageCount: number;
}>;

export type AppShellProps = Readonly<{
  children: React.ReactNode;
  userName: string;
  shell: AppShellView;
  appointmentPatients: ReadonlyArray<{
    id: string;
    name: string;
    hasCompleteFinancialProfile: boolean;
  }>;
  whatsappConfigured: boolean;
  initialStep: number;
  initiallyOpen: boolean;
}>;
