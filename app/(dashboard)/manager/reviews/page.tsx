import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  dailyReports,
  weeklyReports,
  monthlyReports,
  users,
  attendance,
} from "@/lib/db/schema";
import { eq, and, or, sql, desc, ilike, inArray } from "drizzle-orm";
import { ManagerReviewView } from "@/components/manager/manager-review-view";
import { getPendingExtensions } from "@/app/actions/extensions";

export default async function ManagerReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    pageSize?: string;
    q?: string;
    status?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
  ) {
    redirect("/dashboard");
  }

  const {
    tab = "daily",
    page: pageParam,
    pageSize: pageSizeParam,
    q = "",
    status: statusFilter = "SUBMITTED",
  } = await searchParams;

  const page = Number(pageParam) || 1;
  const pageSize = Number(pageSizeParam) || 10;
  const offset = (page - 1) * pageSize;

  const queryPart = q ? `%${q}%` : null;

  // 1. Helper for base conditions (Manager/Admin check)
  // For simplicity, we assume Managers/Admins can see reports from users who have NO supervisor (direct reports to top)
  // OR reports from users that are explicitly assigned to them (if we had a direct linkage, but here it seems role based)
  const getBaseConditions = (table: any) => {
    return or(
      eq(table.status, "HEAD_REVIEWED"),
      and(
        eq(table.status, "SUBMITTED"),
        or(
          inArray(
            table.userId,
            db
              .select({ id: users.id })
              .from(users)
              .where(inArray(users.role, ["ADMIN", "MANAGER"])),
          ),
          inArray(
            table.userId,
            db
              .select({ id: users.id })
              .from(users)
              .where(sql`${users.supervisorId} IS NULL`),
          ),
        ),
      ),
    );
  };

  const getHistoryConditions = (table: any) => eq(table.status, "APPROVED");

  const buildWhere = (table: any, isHistory: boolean) => {
    const base = isHistory
      ? getHistoryConditions(table)
      : getBaseConditions(table);
    if (queryPart) {
      return and(
        base,
        inArray(
          table.userId,
          db
            .select({ id: users.id })
            .from(users)
            .where(
              or(
                ilike(users.firstName, queryPart),
                ilike(users.lastName, queryPart),
                ilike(users.email, queryPart),
              ),
            ),
        ),
      );
    }
    return base;
  };

  // 2. Fetch counts
  const [dailyCount, weeklyCount, monthlyCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(dailyReports)
      .where(buildWhere(dailyReports, tab === "history")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(weeklyReports)
      .where(buildWhere(weeklyReports, tab === "history")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(monthlyReports)
      .where(buildWhere(monthlyReports, tab === "history")),
  ]);

  // 3. Fetch detailed data for selected tab
  const [
    pendingDaily,
    pendingWeekly,
    pendingMonthly,
    pendingExtensions,
    approvedDaily,
    approvedWeekly,
    approvedMonthly,
  ] = await Promise.all([
    tab === "daily"
      ? db.query.dailyReports.findMany({
          where: buildWhere(dailyReports, false),
          with: { user: true },
          limit: pageSize,
          offset,
          orderBy: [desc(dailyReports.updateDate)],
        })
      : [],
    tab === "weekly"
      ? db.query.weeklyReports.findMany({
          where: buildWhere(weeklyReports, false),
          with: { user: true },
          limit: pageSize,
          offset,
          orderBy: [desc(weeklyReports.updateDate)],
        })
      : [],
    tab === "monthly"
      ? db.query.monthlyReports.findMany({
          where: buildWhere(monthlyReports, false),
          with: { user: true },
          limit: pageSize,
          offset,
          orderBy: [desc(monthlyReports.updateDate)],
        })
      : [],
    tab === "extensions" ? getPendingExtensions() : [],
    tab === "history"
      ? db.query.dailyReports.findMany({
          where: buildWhere(dailyReports, true),
          with: { user: true },
          orderBy: [desc(dailyReports.updateDate)],
          limit: pageSize,
          offset,
        })
      : [],
    tab === "history"
      ? db.query.weeklyReports.findMany({
          where: buildWhere(weeklyReports, true),
          with: { user: true },
          orderBy: [desc(weeklyReports.updateDate)],
          limit: pageSize,
          offset,
        })
      : [],
    tab === "history"
      ? db.query.monthlyReports.findMany({
          where: buildWhere(monthlyReports, true),
          with: { user: true },
          orderBy: [desc(monthlyReports.updateDate)],
          limit: pageSize,
          offset,
        })
      : [],
  ]);

  // Attendance for daily
  let dailyWithAttendance = pendingDaily;
  if (tab === "daily" && pendingDaily.length > 0) {
    const dailyAttendance = await db.query.attendance.findMany({
      where: or(
        ...pendingDaily.map((r) =>
          and(eq(attendance.userId, r.userId), eq(attendance.date, r.date)),
        ),
      ),
    });

    const attendanceMap = new Map(
      dailyAttendance.map((a) => [`${a.userId}-${a.date}`, a]),
    );

    dailyWithAttendance = pendingDaily.map((r) => ({
      ...r,
      attendance: attendanceMap.get(`${r.userId}-${r.date}`) || null,
    }));
  }

  const manager = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  return (
    <ManagerReviewView
      dailyReports={dailyWithAttendance}
      weeklyReports={pendingWeekly}
      monthlyReports={pendingMonthly}
      pendingExtensions={pendingExtensions as any}
      manager={manager}
      approvedDaily={approvedDaily}
      approvedWeekly={approvedWeekly}
      approvedMonthly={approvedMonthly}
      pagination={{
        totalDaily: Number(dailyCount[0]?.count || 0),
        totalWeekly: Number(weeklyCount[0]?.count || 0),
        totalMonthly: Number(monthlyCount[0]?.count || 0),
        currentPage: page,
        pageSize: pageSize,
      }}
    />
  );
}
