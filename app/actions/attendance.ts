"use server";

import { db } from "@/lib/db";
import {
  attendance,
  users,
  timeExtensions,
  userSessions,
} from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function checkIn(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  // 1. Get user role
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw new Error("User not found");

  // 2. Check for existing attendance today
  const existing = await db.query.attendance.findFirst({
    where: and(eq(attendance.userId, userId), eq(attendance.date, today)),
  });

  if (existing) {
    if (existing.clockOut && user.role !== "ADMIN" && user.role !== "MANAGER") {
      throw new Error(
        "You have already clocked out for today. Access is restricted until tomorrow.",
      );
    }
    if (existing.clockIn) {
      throw new Error("You are already clocked in.");
    }
  }

  // 3. (Optional) Check shift/extension logic here...

  await db
    .insert(attendance)
    .values({
      userId,
      date: today,
      clockIn: now,
    })
    .onConflictDoUpdate({
      target: [attendance.userId, attendance.date],
      set: { clockIn: now },
    });

  revalidatePath("/dashboard");
}

export async function checkOut(attendanceId: string) {
  const now = new Date();

  await db
    .update(attendance)
    .set({ clockOut: now })
    .where(eq(attendance.id, attendanceId));

  revalidatePath("/dashboard");
}

export async function getCurrentAttendance(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  return await db.query.attendance.findFirst({
    where: and(eq(attendance.userId, userId), eq(attendance.date, today)),
  });
}

export async function canAccessSystem(userId: string, role: string) {
  if (role === "ADMIN" || role === "MANAGER") return { allowed: true };

  // 1. Check for valid session (Force Logout Guard)
  const activeSession = await db.query.userSessions.findFirst({
    where: and(
      eq(userSessions.userId, userId),
      eq(userSessions.isActive, true),
    ),
  });

  if (!activeSession) {
    return { allowed: false, reason: "SESSION_INVALID" };
  }

  const att = await getCurrentAttendance(userId);

  if (!att || !att.clockIn) {
    return { allowed: false, reason: "NOT_CLOCKED_IN" };
  }

  if (att.clockOut) {
    const today = new Date().toISOString().split("T")[0];
    const extension = await db.query.timeExtensions.findFirst({
      where: and(
        eq(timeExtensions.userId, userId),
        eq(timeExtensions.date, today),
        eq(timeExtensions.status, "APPROVED"),
      ),
    });

    if (extension && new Date() < extension.extendedUntil) {
      return { allowed: true, reason: "EXTENSION" };
    }

    return { allowed: false, reason: "CLOCKED_OUT" };
  }

  if (role === "SUPERVISOR") {
    const now = new Date();
    if (now.getHours() < 19) return { allowed: true };
  }

  return { allowed: true };
}
