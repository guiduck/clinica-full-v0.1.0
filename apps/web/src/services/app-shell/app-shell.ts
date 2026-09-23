import { prisma } from "@/lib/prisma";
import { materializeOperationalNotifications } from "@/services/app-notifications/app-notifications";
import type { AppShellView } from "@/types/app-shell";

export async function getAppShellView(userId: string): Promise<AppShellView> {
  await materializeOperationalNotifications(userId);
  const [notifications, pendingMessageCount, unreadCount] = await Promise.all([
    prisma.appNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.scheduledMessage.count({ where: { userId, status: { in: ["queued", "processing"] } } }),
    prisma.appNotification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    pendingMessageCount,
    unreadCount,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      href: notification.href,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    })),
  };
}