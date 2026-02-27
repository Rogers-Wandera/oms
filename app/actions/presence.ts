"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { safeAction } from "@/lib/actions-utils";

export async function getOnlineUsers() {
  return safeAction(async () => {
    // A user is considered online if they were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    return await db.query.users.findMany({
      where: and(
        eq(users.isOnline, true),
        gt(users.lastActive, fiveMinutesAgo),
      ),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        email: true,
      },
    });
  });
}

export async function heartbeat(userId: string) {
  return safeAction(async () => {
    await db
      .update(users)
      .set({ isOnline: true, lastActive: new Date() })
      .where(eq(users.id, userId));
  });
}

export async function setOffline(userId: string) {
  return safeAction(async () => {
    await db.update(users).set({ isOnline: false }).where(eq(users.id, userId));
  });
}
