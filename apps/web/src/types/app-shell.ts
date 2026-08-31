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
