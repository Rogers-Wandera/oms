"use server";

import { db } from "@/lib/db";
import { dailyReports, reportComments } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

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
  const dateStr = reportDate || new Date().toISOString().split("T")[0];

  // Check if a report already exists for this user and date
  const existing = await db.query.dailyReports.findFirst({
    where: and(eq(dailyReports.userId, userId), eq(dailyReports.date, dateStr)),
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

  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard");
  revalidatePath("/supervisor/team");
}

export async function updateReportStatus(reportId: string, status: string) {
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
}
