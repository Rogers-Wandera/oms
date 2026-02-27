import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dailyReports, weeklyReports, monthlyReports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReportView } from "@/components/reports/report-view";

async function getReport(type: string, id: string) {
  let report;
  if (type === "daily") {
    report = await db.query.dailyReports.findFirst({
      where: eq(dailyReports.id, id),
      with: { user: true },
    });
  } else if (type === "weekly") {
    report = await db.query.weeklyReports.findFirst({
      where: eq(weeklyReports.id, id),
      with: { user: true },
    });
  } else if (type === "monthly") {
    report = await db.query.monthlyReports.findFirst({
      where: eq(monthlyReports.id, id),
      with: { user: true },
    });
  }

  return report;
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { type, id } = await params;

  const validTypes = ["daily", "weekly", "monthly"];
  const isUuid = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  if (!validTypes.includes(type) || !isUuid(id)) {
    // If the route parameters are malformed (e.g., a status or signature
    // string was used where an ID is expected), return 404 instead of
    // letting the DB throw a runtime error for invalid UUID input.
    notFound();
  }

  const report = (await getReport(type, id)) as any;

  if (!report) notFound();

  // Security check: only own reports, supervisor/manager/admin
  const isOwner = report.userId === session.user.id;
  const isAdminOrManager =
    session.user.role === "ADMIN" || session.user.role === "MANAGER";

  if (!isOwner && !isAdminOrManager) {
    redirect("/dashboard/reports");
  }

  return <ReportView report={report} type={type} />;
}
