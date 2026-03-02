"use server";

import { db } from "@/lib/db";
import {
  departmentReports,
  dailyReports,
  weeklyReports,
  monthlyReports,
  users,
  departments,
} from "@/lib/db/schema";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/actions-utils";

/**
 * Aggregates daily reports for a department
 */
export async function generateDailyDepartmentReport(
  departmentId: string,
  dateStr: string,
) {
  return safeAction(async () => {
    const deptUsers = await db.query.users.findMany({
      where: eq(users.departmentId, departmentId),
    });

    if (deptUsers.length === 0) return null;

    const userIds = deptUsers.map((u) => u.id);

    const reports = await db.query.dailyReports.findMany({
      where: and(
        or(...userIds.map((id) => eq(dailyReports.userId, id))),
        eq(dailyReports.date, dateStr),
        or(
          eq(dailyReports.status, "SUBMITTED"),
          eq(dailyReports.status, "APPROVED"),
        ),
      ),
      with: {
        user: true,
      },
    });

    if (reports.length === 0) return null;

    const summary = (reports as any[])
      .map(
        (r) =>
          `[${r.user?.firstName || "Unknown"} ${r.user?.lastName || ""}] (ID: ${r.user?.id || "N/A"}): ${r.userComment || "No comment"}`,
      )
      .join("\n\n");

    const existing = await db.query.departmentReports.findFirst({
      where: and(
        eq(departmentReports.departmentId, departmentId),
        eq(departmentReports.date, dateStr),
        eq(departmentReports.type, "DAILY"),
      ),
    });

    if (existing) {
      await db
        .update(departmentReports)
        .set({ summary, updateDate: new Date() })
        .where(eq(departmentReports.id, existing.id));
      try {
        revalidatePath("/manager/department-reports");
      } catch (e) {}
      return existing;
    }

    const [newReport] = await db
      .insert(departmentReports)
      .values({
        departmentId,
        type: "DAILY",
        date: dateStr,
        summary,
        status: "SUBMITTED",
      })
      .returning();

    try {
      revalidatePath("/manager/department-reports");
    } catch (e) {}
    return newReport;
  });
}

/**
 * Aggregates weekly reports for a department
 */
export async function generateWeeklyDepartmentReport(
  departmentId: string,
  startDate: string,
  endDate: string,
) {
  return safeAction(async () => {
    const deptUsers = await db.query.users.findMany({
      where: eq(users.departmentId, departmentId),
    });

    if (deptUsers.length === 0) return null;

    const userIds = deptUsers.map((u) => u.id);

    const reports = await db.query.weeklyReports.findMany({
      where: and(
        or(...userIds.map((id) => eq(weeklyReports.userId, id))),
        eq(weeklyReports.startDate, startDate),
        eq(weeklyReports.endDate, endDate),
        or(
          eq(weeklyReports.status, "REVIEWED"),
          eq(weeklyReports.status, "APPROVED"),
        ),
      ),
      with: {
        user: true,
      },
    });

    if (reports.length === 0) return null;

    const summary = (reports as any[])
      .map(
        (r) =>
          `[${r.user?.firstName || "Unknown"} ${r.user?.lastName || ""}] (ID: ${r.user?.id || "N/A"}): ${r.summary || "No weekly summary"}`,
      )
      .join("\n\n---\n\n");

    const existing = await db.query.departmentReports.findFirst({
      where: and(
        eq(departmentReports.departmentId, departmentId),
        eq(departmentReports.startDate, startDate),
        eq(departmentReports.endDate, endDate),
        eq(departmentReports.type, "WEEKLY"),
      ),
    });

    if (existing) {
      await db
        .update(departmentReports)
        .set({ summary, updateDate: new Date() })
        .where(eq(departmentReports.id, existing.id));
      try {
        revalidatePath("/manager/department-reports");
      } catch (e) {}
      return existing;
    }

    const [newReport] = await db
      .insert(departmentReports)
      .values({
        departmentId,
        type: "WEEKLY",
        startDate,
        endDate,
        summary,
        status: "SUBMITTED",
      })
      .returning();

    try {
      revalidatePath("/manager/department-reports");
    } catch (e) {}
    return newReport;
  });
}

/**
 * Aggregates monthly reports for a department
 */
export async function generateMonthlyDepartmentReport(
  departmentId: string,
  month: number,
  year: number,
) {
  return safeAction(async () => {
    const deptUsers = await db.query.users.findMany({
      where: eq(users.departmentId, departmentId),
    });

    if (deptUsers.length === 0) return null;

    const userIds = deptUsers.map((u) => u.id);

    const reports = await db.query.monthlyReports.findMany({
      where: and(
        or(...userIds.map((id) => eq(monthlyReports.userId, id))),
        eq(monthlyReports.month, month),
        eq(monthlyReports.year, year),
        or(
          eq(monthlyReports.status, "REVIEWED"),
          eq(monthlyReports.status, "APPROVED"),
        ),
      ),
      with: {
        user: true,
      },
    });

    if (reports.length === 0) return null;

    const summary = (reports as any[])
      .map(
        (r) =>
          `[${r.user?.firstName || "Unknown"} ${r.user?.lastName || ""}] (ID: ${r.user?.id || "N/A"}): ${r.summary || "No monthly summary"}`,
      )
      .join("\n\n---\n\n");

    const existing = await db.query.departmentReports.findFirst({
      where: and(
        eq(departmentReports.departmentId, departmentId),
        eq(departmentReports.month, month),
        eq(departmentReports.year, year),
        eq(departmentReports.type, "MONTHLY"),
      ),
    });

    if (existing) {
      await db
        .update(departmentReports)
        .set({ summary, updateDate: new Date() })
        .where(eq(departmentReports.id, existing.id));
      try {
        revalidatePath("/manager/department-reports");
      } catch (e) {}
      return existing;
    }

    const [newReport] = await db
      .insert(departmentReports)
      .values({
        departmentId,
        type: "MONTHLY",
        month,
        year,
        summary,
        status: "SUBMITTED",
      })
      .returning();

    try {
      revalidatePath("/manager/department-reports");
    } catch (e) {}
    return newReport;
  });
}

/**
 * Orchestrator to generate all pending departmental reports
 */
export async function generateAllPendingDepartmentReports() {
  return safeAction(async () => {
    const allDepts = await db.select().from(departments);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const results = [];

    for (const dept of allDepts) {
      // 1. Daily
      try {
        const daily = await generateDailyDepartmentReport(dept.id, todayStr);
        if (daily) results.push(daily);
      } catch (e) {
        console.error(`Failed dept daily for ${dept.name}`, e);
      }

      // 2. Weekly (If Friday 6 PM approx - handled by cron caller)
      // 3. Monthly (If month end - handled by cron caller)
    }

    return results;
  });
}
