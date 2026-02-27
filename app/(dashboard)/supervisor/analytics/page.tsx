import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeamAnalyticsCharts } from "@/components/supervisor/team-analytics-charts";
import { db } from "@/lib/db";
import { users, dailyReports, tasks, attendance } from "@/lib/db/schema";
import { eq, and, gte, sql, count, desc, asc } from "drizzle-orm";

async function getTeamAnalytics(supervisorId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0];

  const memberStatsResults = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      reportCount: count(dailyReports.id),
      attendanceCount: count(attendance.id),
    })
    .from(users)
    .leftJoin(
      dailyReports,
      and(eq(users.id, dailyReports.userId), gte(dailyReports.date, startDate)),
    )
    .leftJoin(
      attendance,
      and(eq(users.id, attendance.userId), gte(attendance.date, startDate)),
    )
    .where(eq(users.supervisorId, supervisorId))
    .groupBy(users.id)
    .orderBy(asc(users.firstName));

  // Get completed tasks separately to avoid complex join issues with multiple counts
  const taskCounts = await db
    .select({
      assignedTo: tasks.assignedTo,
      count: count(),
    })
    .from(tasks)
    .where(eq(tasks.status, "DONE"))
    .groupBy(tasks.assignedTo);

  const dailyReportsResults = await db
    .select({
      report_date: dailyReports.date,
      count: count(),
    })
    .from(dailyReports)
    .innerJoin(users, eq(dailyReports.userId, users.id))
    .where(
      and(
        eq(users.supervisorId, supervisorId),
        gte(dailyReports.date, startDate),
      ),
    )
    .groupBy(dailyReports.date)
    .orderBy(desc(dailyReports.date))
    .limit(7);

  const taskStatsResults = await db
    .select({
      status: tasks.status,
      count: count(),
    })
    .from(tasks)
    .innerJoin(users, eq(tasks.assignedTo, users.id))
    .where(eq(users.supervisorId, supervisorId))
    .groupBy(tasks.status);

  return {
    memberStats: memberStatsResults.map((m) => {
      const tasksDone =
        taskCounts.find((tc) => tc.assignedTo === m.id)?.count || 0;
      return {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`.trim(),
        report_count: String(m.reportCount),
        attendance_count: String(m.attendanceCount),
        completed_tasks: String(tasksDone),
      };
    }),
    dailyReports: dailyReportsResults.map((dr) => ({
      report_date: dr.report_date,
      count: String(dr.count),
    })),
    taskStats: taskStatsResults.map((ts) => ({
      status:
        ts.status === "DONE"
          ? "COMPLETED"
          : ts.status === "PLANNED"
            ? "IN_PROGRESS"
            : "PENDING",
      count: String(ts.count),
    })),
  };
}

export default async function SupervisorAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "SUPERVISOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const analytics = await getTeamAnalytics(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team Analytics</h2>
        <p className="text-muted-foreground">
          Monitor your team&apos;s productivity and engagement
        </p>
      </div>

      <TeamAnalyticsCharts analytics={analytics} />
    </div>
  );
}
