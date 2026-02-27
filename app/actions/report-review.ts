"use server";

import { db } from "@/lib/db";
import {
  dailyReports,
  weeklyReports,
  monthlyReports,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/actions-utils";

/**
 * Common submission logic for reports
 */
export async function submitDailyReport(
  reportId: string,
  signatureUrl: string,
) {
  return safeAction(async () => {
    await db
      .update(dailyReports)
      .set({
        status: "SUBMITTED",
        signatureUrl,
        updateDate: new Date(),
      })
      .where(eq(dailyReports.id, reportId));

    revalidatePath("/dashboard/reports");
  });
}

export async function submitWeeklyReport(
  reportId: string,
  userComment: string,
  signatureUrl: string,
) {
  return safeAction(async () => {
    await db
      .update(weeklyReports)
      .set({
        status: "SUBMITTED",
        summary: userComment, // Assuming summary stores the user's aggregated/final comment
        signatureUrl,
        updateDate: new Date(),
      })
      .where(eq(weeklyReports.id, reportId));

    revalidatePath("/dashboard/reports");
  });
}

export async function submitMonthlyReport(
  reportId: string,
  userComment: string,
  signatureUrl: string,
) {
  return safeAction(async () => {
    await db
      .update(monthlyReports)
      .set({
        status: "SUBMITTED",
        summary: userComment,
        signatureUrl,
        updateDate: new Date(),
      })
      .where(eq(monthlyReports.id, reportId));

    revalidatePath("/dashboard/reports");
  });
}

/**
 * Supervisor Approval (Phase 2 Review)
 */
export async function supervisorApproveDailyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(dailyReports)
      .set({
        status: "REVIEWED",
        supervisorSignatureUrl: signatureUrl,
        supervisorComment: comment,
        updateDate: new Date(),
      })
      .where(eq(dailyReports.id, reportId));

    revalidatePath("/supervisor/team");
    revalidatePath("/dashboard/reports");
  });
}

export async function supervisorApproveWeeklyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(weeklyReports)
      .set({
        status: "REVIEWED",
        supervisorSignatureUrl: signatureUrl,
        supervisorComment: comment,
        updateDate: new Date(),
      })
      .where(eq(weeklyReports.id, reportId));

    revalidatePath("/supervisor/team");
    revalidatePath("/dashboard/reports");
  });
}

export async function supervisorApproveMonthlyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(monthlyReports)
      .set({
        status: "REVIEWED",
        supervisorSignatureUrl: signatureUrl,
        supervisorComment: comment,
        updateDate: new Date(),
      })
      .where(eq(monthlyReports.id, reportId));

    revalidatePath("/supervisor/team");
    revalidatePath("/dashboard/reports");
  });
}

/**
 * Head of Department Approval
 */
export async function headApproveDailyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(dailyReports)
      .set({
        status: "HEAD_REVIEWED",
        headSignatureUrl: signatureUrl,
        headComment: comment,
        updateDate: new Date(),
      })
      .where(eq(dailyReports.id, reportId));

    revalidatePath("/supervisor/team");
    revalidatePath("/dashboard/reports");
  });
}

export async function headApproveWeeklyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(weeklyReports)
      .set({
        status: "HEAD_REVIEWED",
        headSignatureUrl: signatureUrl,
        headComment: comment,
        updateDate: new Date(),
      })
      .where(eq(weeklyReports.id, reportId));

    revalidatePath("/supervisor/team");
    revalidatePath("/dashboard/reports");
  });
}

export async function headApproveMonthlyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(monthlyReports)
      .set({
        status: "HEAD_REVIEWED",
        headSignatureUrl: signatureUrl,
        headComment: comment,
        updateDate: new Date(),
      })
      .where(eq(monthlyReports.id, reportId));

    revalidatePath("/supervisor/team");
    revalidatePath("/dashboard/reports");
  });
}

/**
 * Manager Approval (Phase 3 Review - Final)
 */
export async function managerApproveDailyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(dailyReports)
      .set({
        status: "APPROVED",
        managerSignatureUrl: signatureUrl,
        managerComment: comment,
        updateDate: new Date(),
      })
      .where(eq(dailyReports.id, reportId));

    revalidatePath("/manager/reviews");
    revalidatePath("/dashboard/reports");
  });
}

export async function managerApproveWeeklyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(weeklyReports)
      .set({
        status: "APPROVED",
        managerSignatureUrl: signatureUrl,
        managerComment: comment,
        updateDate: new Date(),
      })
      .where(eq(weeklyReports.id, reportId));

    revalidatePath("/manager/reviews");
    revalidatePath("/dashboard/reports");
  });
}

export async function managerApproveMonthlyReport(
  reportId: string,
  signatureUrl: string,
  comment?: string,
) {
  return safeAction(async () => {
    await db
      .update(monthlyReports)
      .set({
        status: "APPROVED",
        managerSignatureUrl: signatureUrl,
        managerComment: comment,
        updateDate: new Date(),
      })
      .where(eq(monthlyReports.id, reportId));

    revalidatePath("/manager/reviews");
    revalidatePath("/dashboard/reports");
  });
}
