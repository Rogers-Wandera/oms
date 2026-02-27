"use server";

import { db } from "@/lib/db";
import {
  dailyReports,
  weeklyReports,
  monthlyReports,
  users,
} from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/actions-utils";

export async function generateWeeklyReport(userId: string) {
  return safeAction(async () => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(17, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7);

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const reports = await db
      .select()
      .from(dailyReports)
      .where(
        and(
          eq(dailyReports.userId, userId),
          gte(dailyReports.date, startStr),
          lte(dailyReports.date, endStr),
        ),
      );

    if (reports.length === 0) return null;

    const aggregateSummary = reports
      .map((r) => `[${r.date}]: ${r.userComment || "No comment"}`)
      .join("\n\n");

    const [newReport] = await db
      .insert(weeklyReports)
      .values({
        userId,
        startDate: startStr,
        endDate: endStr,
        summary: aggregateSummary,
        status: "DRAFT",
      })
      .returning();

    revalidatePath("/dashboard/reports");
    return newReport;
  });
}

export async function generateMonthlyReport(userId: string) {
  return safeAction(async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const reports = await db
      .select()
      .from(dailyReports)
      .where(
        and(
          eq(dailyReports.userId, userId),
          gte(dailyReports.date, startStr),
          lte(dailyReports.date, endStr),
        ),
      );

    if (reports.length === 0) return null;

    const aggregateSummary = reports
      .map((r) => `[${r.date}]: ${r.userComment || "No comment"}`)
      .join("\n\n");

    const [newReport] = await db
      .insert(monthlyReports)
      .values({
        userId,
        month,
        year,
        summary: aggregateSummary,
        status: "DRAFT",
      })
      .returning();

    revalidatePath("/dashboard/reports");
    return newReport;
  });
}

export async function generateAllPendingWeeklyReports() {
  return safeAction(async () => {
    const allUsers = await db.query.users.findMany({
      where: (u, { eq }) => eq(u.isLocked, false),
    });

    const results = [];
    for (const user of allUsers) {
      try {
        const report = await generateWeeklyReport(user.id);
        if (report) results.push(report);
      } catch (error) {
        console.error(
          `Failed to generate weekly report for user ${user.id}:`,
          error,
        );
      }
    }
    return results;
  });
}

export async function generateAllPendingMonthlyReports() {
  return safeAction(async () => {
    const now = new Date();
    const todayDay = now.getDate();
    const isLastDay =
      new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === todayDay;

    const allUsers = await db.query.users.findMany({
      where: (u, { eq }) => eq(u.isLocked, false),
    });

    const results = [];
    for (const user of allUsers) {
      const shouldTrigger =
        user.monthEndDay === todayDay ||
        (isLastDay && user.monthEndDay > todayDay);

      if (shouldTrigger) {
        try {
          const report = await generateMonthlyReport(user.id);
          if (report) results.push(report);
        } catch (error) {
          console.error(
            `Failed to generate monthly report for user ${user.id}:`,
            error,
          );
        }
      }
    }
    return results;
  });
}
