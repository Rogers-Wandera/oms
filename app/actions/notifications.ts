"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: "TASK" | "REPORT" | "SYSTEM" | "SECURITY";
  link?: string;
}) {
  await db.insert(notifications).values({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    link: data.link,
  });

  // Revalidate so header unread count updates
  revalidatePath("/", "layout");
}

export async function getNotifications(userId: string) {
  return await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.creationDate)],
    limit: 50,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  const result = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    );

  return Number(result[0].value);
}

export async function markAsRead(notificationId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));

  revalidatePath("/", "layout");
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));

  revalidatePath("/", "layout");
}
