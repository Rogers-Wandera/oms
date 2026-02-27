"use server";

import { db } from "@/lib/db";
import {
  dailyReports,
  weeklyReports,
  monthlyReports,
  reportComments,
} from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { safeAction } from "@/lib/actions-utils";

export async function createReport({
  userId,
  content,
  reportDate,
  signatureUrl,
  accomplishments,
}: {
  userId: string;
  content: string;
  reportDate: string;
  signatureUrl?: string;
  accomplishments?: any[];
}) {
  return safeAction(async () => {
    const dateStr = reportDate || new Date().toISOString().split("T")[0];

    // Check if a report already exists for this user and date
    const existing = await db.query.dailyReports.findFirst({
      where: and(
        eq(dailyReports.userId, userId),
        eq(dailyReports.date, dateStr),
      ),
    });

    if (existing) {
      throw new Error(`A report for ${dateStr} already exists.`);
    }

    await db.insert(dailyReports).values({
      userId,
      userComment: content,
      date: dateStr,
      status: "SUBMITTED",
      signatureUrl,
      accomplishments,
    });

    // Notify supervisor if exists
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
      columns: { supervisorId: true, firstName: true, lastName: true },
    });

    if (user?.supervisorId) {
      const { createNotification } = await import("./notifications");
      await createNotification({
        userId: user.supervisorId,
        title: "New Report Submitted",
        message: `${user.firstName} ${user.lastName} has submitted their daily report for ${dateStr}.`,
        type: "REPORT",
        link: "/supervisor/team", // Adjust link as needed
      });
    }

    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");
    revalidatePath("/supervisor/team");
  });
}

export async function updateReportStatus(reportId: string, status: string) {
  return safeAction(async () => {
    // Map status to valid enums: DRAFT, SUBMITTED, REVIEWED, HEAD_REVIEWED, APPROVED, REJECTED
    let schemaStatus:
      | "DRAFT"
      | "SUBMITTED"
      | "REVIEWED"
      | "HEAD_REVIEWED"
      | "APPROVED"
      | "REJECTED" = "SUBMITTED";

    if (status === "APPROVED") {
      schemaStatus = "APPROVED";
    } else if (status === "REVIEWED") {
      schemaStatus = "REVIEWED";
    } else if (status === "HEAD_REVIEWED") {
      schemaStatus = "HEAD_REVIEWED";
    } else if (status === "REJECTED") {
      schemaStatus = "REJECTED";
    }

    await db
      .update(dailyReports)
      .set({
        status: schemaStatus,
        updateDate: new Date(),
      })
      .where(eq(dailyReports.id, reportId));

    revalidatePath("/dashboard/reports");
    revalidatePath("/supervisor/team");
  });
}

export async function addReportComment({
  reportId,
  userId,
  comment,
}: {
  reportId: string;
  userId: string;
  comment: string;
}) {
  return safeAction(async () => {
    // We need the user's role for the comment
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
      columns: { role: true },
    });

    await db.insert(reportComments).values({
      reportId,
      commentBy: userId,
      message: comment,
      role: user?.role || "USER",
    });

    revalidatePath("/dashboard/reports");
    revalidatePath("/supervisor/team");
  });
}

export async function createWeeklyReport({
  userId,
  startDate,
  endDate,
  summary,
  accomplishments,
  signatureUrl,
}: {
  userId: string;
  startDate: string;
  endDate: string;
  summary: string;
  accomplishments: any[];
  signatureUrl?: string;
}) {
  return safeAction(async () => {
    // Check if exists
    const existing = await db.query.weeklyReports.findFirst({
      where: and(
        eq(weeklyReports.userId, userId),
        eq(weeklyReports.startDate, startDate),
        eq(weeklyReports.endDate, endDate),
      ),
    });

    if (existing) {
      throw new Error(`A weekly report for this period already exists.`);
    }

    await db.insert(weeklyReports).values({
      userId,
      startDate,
      endDate,
      summary,
      accomplishments,
      signatureUrl,
      status: "SUBMITTED",
    });

    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");
  });
}

export async function createMonthlyReport({
  userId,
  month,
  year,
  summary,
  accomplishments,
  signatureUrl,
}: {
  userId: string;
  month: number;
  year: number;
  summary: string;
  accomplishments: any[];
  signatureUrl?: string;
}) {
  return safeAction(async () => {
    // Check if exists
    const existing = await db.query.monthlyReports.findFirst({
      where: and(
        eq(monthlyReports.userId, userId),
        eq(monthlyReports.month, month),
        eq(monthlyReports.year, year),
      ),
    });

    if (existing) {
      throw new Error(`A monthly report for this period already exists.`);
    }

    await db.insert(monthlyReports).values({
      userId,
      month,
      year,
      summary,
      accomplishments,
      signatureUrl,
      status: "SUBMITTED",
    });

    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");
  });
}
