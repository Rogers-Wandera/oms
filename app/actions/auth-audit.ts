"use server";

import { db } from "@/lib/db";
import { authAudit, users, notifications, userSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/actions-utils";

export async function logAuthEvent(data: {
  userId?: string;
  type:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILURE"
    | "LOGOUT"
    | "USER_LOCK"
    | "USER_UNLOCK"
    | "PASSWORD_RESET_REQUEST"
    | "PASSWORD_RESET_SUCCESS";
  ipAddress?: string;
  userAgent?: string;
  message?: string;
}) {
  return safeAction(async () => {
    await db.insert(authAudit).values({
      userId: data.userId,
      type: data.type,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      message: data.message,
    });

    // If failed login, increase attempts
    if (data.type === "LOGIN_FAILURE" && data.userId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, data.userId),
      });
      if (user) {
        const newAttempts = user.loginAttempts + 1;
        const isNowLocked = newAttempts >= 5;

        await db
          .update(users)
          .set({
            loginAttempts: newAttempts,
            isLocked: isNowLocked,
            lockedUntil: isNowLocked ? new Date(Date.now() + 30 * 60000) : null, // 30 mins lock
          })
          .where(eq(users.id, user.id));

        if (isNowLocked) {
          await logAuthEvent({
            userId: user.id,
            type: "USER_LOCK",
            message: "Account locked due to too many failed login attempts",
          });
        }
      }
    }

    // If success login, reset attempts
    if (data.type === "LOGIN_SUCCESS" && data.userId) {
      await db
        .update(users)
        .set({
          loginAttempts: 0,
          lastLoginDate: new Date(),
        })
        .where(eq(users.id, data.userId));
    }
  });
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function lockUser(userId: string, reason: string) {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
    ) {
      throw new Error("Unauthorized");
    }

    await db
      .update(users)
      .set({
        isLocked: true,
        lockedUntil: null, // Permanent until manual unlock
      })
      .where(eq(users.id, userId));

    await logAuthEvent({
      userId,
      type: "USER_LOCK",
      message: reason,
    });

    revalidatePath("/admin/users");
  });
}

export async function unlockUser(userId: string) {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Admins can unlock users.");
    }

    await db
      .update(users)
      .set({
        isLocked: false,
        loginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(users.id, userId));

    await logAuthEvent({
      userId,
      type: "USER_UNLOCK",
      message: "Manual unlock by Admin",
    });

    revalidatePath("/admin/users");
  });
}

export async function getAuthAuditLogs(
  page = 1,
  pageSize = 50,
  userId?: string,
) {
  return safeAction(async () => {
    const offset = (page - 1) * pageSize;

    const [totalCountResult, logs] = await Promise.all([
      db
        .select({ value: drizzleCount() })
        .from(authAudit)
        .where(userId ? eq(authAudit.userId, userId) : undefined),
      db.query.authAudit.findMany({
        where: userId ? eq(authAudit.userId, userId) : undefined,
        orderBy: [desc(authAudit.creationDate)],
        limit: pageSize,
        offset: offset,
        with: {
          user: true,
        },
      }),
    ]);

    const totalCount = Number(totalCountResult[0]?.value || 0);

    return {
      data: logs,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  });
}

export async function invalidateAllUserSessions(userId: string) {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
    ) {
      throw new Error("Unauthorized");
    }

    // 1. Mark all sessions as inactive
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));

    // 2. Mark user as offline
    await db.update(users).set({ isOnline: false }).where(eq(users.id, userId));

    // 3. Log the event
    await logAuthEvent({
      userId,
      type: "LOGOUT",
      message: "Force logout by Admin",
    });

    revalidatePath("/admin/users");
  });
}
