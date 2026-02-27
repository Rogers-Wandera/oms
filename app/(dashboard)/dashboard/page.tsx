import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, tasks, dailyReports, attendance } from "@/lib/db/schema";
import { eq, and, gte, lte, count, sql, desc, ne, lt } from "drizzle-orm";
import { AttendanceCard } from "@/components/dashboard/attendance-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { HoursAnalytics } from "@/components/dashboard/hours-analytics";
import { DeadlineCountdowns } from "@/components/dashboard/deadline-countdowns";
import { DashboardAnalyticsGrid } from "@/components/dashboard/dashboard-analytics-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, AlertCircle } from "lucide-react";

async function getAttendanceToday(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const records = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, today)))
    .limit(1);

  if (!records[0]) return null;

  return {
    id: records[0].id,
    check_in: records[0].clockIn?.toISOString() || "",
    check_out: records[0].clockOut?.toISOString() || null,
  };
}

async function getWeeklyHours(userId: string) {
  const now = new Date();
  const day = now.getDay();
  // Monday is 1, Sunday is 0. Calculate Monday of this week.
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const records = await db
    .select()
    .from(attendance)
    .where(
      and(eq(attendance.userId, userId), gte(attendance.clockIn, startOfWeek)),
    );

  let totalMs = 0;
  const todayStr = new Date().toISOString().split("T")[0];

  records.forEach((r) => {
    if (r.clockIn && r.clockOut) {
      totalMs += r.clockOut.getTime() - r.clockIn.getTime();
    } else if (r.clockIn && !r.clockOut && r.date === todayStr) {
      totalMs += new Date().getTime() - r.clockIn.getTime();
    }
  });

  return parseFloat((totalMs / (1000 * 60 * 60)).toFixed(1));
}

async function getStats(userId: string) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [tasksStats, reportsResult, attendanceCount, weeklyHours] =
    await Promise.all([
      db
        .select({
          completed: count(sql`CASE WHEN ${tasks.status} = 'DONE' THEN 1 END`),
          inProgress: count(
            sql`CASE WHEN ${tasks.status} = 'PLANNED' THEN 1 END`,
          ),
          pending: count(
            sql`CASE WHEN ${tasks.status} = 'NOT_DONE' THEN 1 END`,
          ),
        })
        .from(tasks)
        .where(eq(tasks.assignedTo, userId)),

      db
        .select({ value: count() })
        .from(dailyReports)
        .where(
          and(
            eq(dailyReports.userId, userId),
            gte(dailyReports.date, startOfMonth),
            lte(dailyReports.date, endOfMonth),
          ),
        ),

      db
        .select({ value: count() })
        .from(attendance)
        .where(
          and(
            eq(attendance.userId, userId),
            gte(attendance.date, startOfMonth),
            lte(attendance.date, endOfMonth),
          ),
        ),

      getWeeklyHours(userId),
    ]);

  return {
    tasks: {
      completed: Number(tasksStats[0]?.completed || 0),
      inProgress: Number(tasksStats[0]?.inProgress || 0),
      pending: Number(tasksStats[0]?.pending || 0),
    },
    reportsThisMonth: Number(reportsResult[0]?.value || 0),
    attendanceThisMonth: Number(attendanceCount[0]?.value || 0),
    weeklyHours,
  };
}

async function getRecentActivity(userId: string) {
  const [recentTasks, recentReports] = await Promise.all([
    db
      .select({
        title: tasks.title,
        status: tasks.status,
        timestamp: tasks.updateDate,
      })
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.updateDate))
      .limit(3),
    db
      .select({
        status: dailyReports.status,
        timestamp: dailyReports.creationDate,
      })
      .from(dailyReports)
      .where(eq(dailyReports.userId, userId))
      .orderBy(desc(dailyReports.creationDate))
      .limit(3),
  ]);

  const activities = [
    ...recentTasks.map((t) => ({
      ...t,
      type: "task",
      timestamp: t.timestamp?.toISOString() || new Date(0).toISOString(),
    })),
    ...recentReports.map((r) => ({
      ...r,
      type: "report",
      title: "Daily Report",
      timestamp: r.timestamp.toISOString(),
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  return activities;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [attendanceToday, stats, recentActivity, fullUser, managementStats] =
    await Promise.all([
      getAttendanceToday(session.user.id),
      getStats(session.user.id),
      getRecentActivity(session.user.id),
      db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
      session.user.role === "ADMIN" || session.user.role === "MANAGER"
        ? (async () => {
            const today = new Date().toISOString().split("T")[0];
            const [dueToday, overdue] = await Promise.all([
              db
                .select({ value: count() })
                .from(tasks)
                .where(and(eq(tasks.date, today), ne(tasks.status, "DONE"))),
              db
                .select({ value: count() })
                .from(tasks)
                .where(and(lt(tasks.date, today), ne(tasks.status, "DONE"))),
            ]);
            return {
              dueToday: Number(dueToday[0]?.value || 0),
              overdue: Number(overdue[0]?.value || 0),
            };
          })()
        : Promise.resolve(null),
    ]);

  const dashboardUser = { ...session.user, ...fullUser };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">
          Dashboard
        </h2>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}. Here's your daily overview.
        </p>
      </div>

      <DeadlineCountdowns user={dashboardUser} />

      {managementStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="premium-card border-amber-500/20 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-amber-600">
                System Due Today
              </CardTitle>
              <Calendar className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managementStats.dueToday}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Total tasks pending today
              </p>
            </CardContent>
          </Card>
          <Card className="premium-card border-red-500/20 bg-red-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-red-600">
                System Overdue
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managementStats.overdue}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Total tasks past deadline
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <AttendanceCard
        attendance={attendanceToday}
        userId={session.user.id}
        role={session.user.role}
      />

      <DashboardAnalyticsGrid
        stats={stats}
        recentActivity={recentActivity}
        showOnlineWidget={
          session.user.role === "ADMIN" || session.user.role === "MANAGER"
        }
      />
    </div>
  );
}
