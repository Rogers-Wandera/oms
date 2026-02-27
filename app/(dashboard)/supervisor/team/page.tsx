import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeamReportsList } from "@/components/supervisor/team-reports-list";
import { TeamOverview } from "@/components/supervisor/team-overview";
import { TeamDueTasks } from "@/components/supervisor/team-due-tasks";
import { TeamAttendance } from "@/components/supervisor/team-attendance";

import { db } from "@/lib/db";
import {
  users,
  dailyReports,
  reportComments,
  attendance,
  tasks,
} from "@/lib/db/schema";
import {
  eq,
  and,
  desc,
  count as drizzleCount,
  sql as drizzleSql,
  asc,
  lt,
  ne,
  or,
  ilike,
  exists,
} from "drizzle-orm";

async function getTeamMembers(supervisorId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [members, todayAttendance] = await Promise.all([
    db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.supervisorId, supervisorId))
      .orderBy(asc(users.firstName)),
    db.select().from(attendance).where(eq(attendance.date, today)),
  ]);

  const attendanceMap = new Map(todayAttendance.map((a) => [a.userId, a]));

  return members.map((m) => ({
    ...m,
    name: `${m.firstName} ${m.lastName}`.trim(),
    attendance: attendanceMap.get(m.id) || null,
  }));
}

async function getTeamReports(
  supervisorId: string,
  page = 1,
  pageSize = 10,
  status?: string,
  memberId?: string,
) {
  const offset = (page - 1) * pageSize;

  const whereConditions = [
    exists(
      db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, dailyReports.userId),
            eq(users.supervisorId, supervisorId),
          ),
        ),
    ),
  ];

  if (status && status !== "all") {
    whereConditions.push(eq(dailyReports.status, status as any));
  }

  if (memberId && memberId !== "all") {
    whereConditions.push(eq(dailyReports.userId, memberId));
  }

  const [totalCountResult, reports] = await Promise.all([
    db
      .select({ value: drizzleCount() })
      .from(dailyReports)
      .where(and(...whereConditions)),
    db.query.dailyReports.findMany({
      where: and(...whereConditions),
      orderBy: [desc(dailyReports.date), desc(dailyReports.creationDate)],
      limit: pageSize,
      offset: offset,
      with: {
        user: {
          columns: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        comments: {
          with: {
            commenter: {
              columns: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: [desc(reportComments.creationDate)],
        },
      },
    }),
  ]);

  const totalCount = Number(totalCountResult[0]?.value || 0);

  return {
    data: reports.map((r) => ({
      ...r,
      user_id: r.userId,
      content: r.userComment || "",
      report_date: r.date,
      accomplishments: r.accomplishments || [],
      creation_date: r.creationDate.toISOString(),
      created_at: r.creationDate.toISOString(),
      user_name: `${r.user?.firstName} ${r.user?.lastName}`.trim(),
      user_email: r.user?.email,
      comments: (r.comments || []).map((c) => ({
        id: c.id,
        comment: c.message,
        creation_date: c.creationDate.toISOString(),
        created_at: c.creationDate.toISOString(),
        user_name: `${c.commenter?.firstName} ${c.commenter?.lastName}`.trim(),
      })),
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

async function getTeamDueTasks(supervisorId: string) {
  const today = new Date().toISOString().split("T")[0];

  const results = await db.query.tasks.findMany({
    where: (t, { and, eq, lt, ne, exists }) =>
      and(
        ne(t.status, "DONE"),
        lt(t.date, today),
        exists(
          db
            .select()
            .from(users)
            .where(
              and(
                eq(users.id, t.assignedTo),
                eq(users.supervisorId, supervisorId),
              ),
            ),
        ),
      ),
    with: {
      assignee: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
      creator: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [asc(tasks.date)],
    limit: 10,
  });

  return results.map((t) => ({
    ...t,
    assignee_name: `${t.assignee?.firstName} ${t.assignee?.lastName}`.trim(),
    creator_name: `${t.creator?.firstName} ${t.creator?.lastName}`.trim(),
  }));
}

async function getTeamStats(supervisorId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [
    memberCount,
    todayReports,
    pendingReports,
    todayAttendance,
    dueTodayTasks,
    overdueTasksCount,
  ] = await Promise.all([
    db
      .select({ value: drizzleCount() })
      .from(users)
      .where(eq(users.supervisorId, supervisorId)),
    db
      .select({ value: drizzleCount() })
      .from(dailyReports)
      .innerJoin(users, eq(dailyReports.userId, users.id))
      .where(
        and(eq(users.supervisorId, supervisorId), eq(dailyReports.date, today)),
      ),
    db
      .select({ value: drizzleCount() })
      .from(dailyReports)
      .innerJoin(users, eq(dailyReports.userId, users.id))
      .where(
        and(
          eq(users.supervisorId, supervisorId),
          eq(dailyReports.status, "SUBMITTED"),
        ),
      ),
    db
      .select({ value: drizzleCount() })
      .from(attendance)
      .innerJoin(users, eq(attendance.userId, users.id))
      .where(
        and(eq(users.supervisorId, supervisorId), eq(attendance.date, today)),
      ),
    db
      .select({ value: drizzleCount() })
      .from(tasks)
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .where(
        and(
          eq(users.supervisorId, supervisorId),
          eq(tasks.date, today),
          ne(tasks.status, "DONE"),
        ),
      ),
    db
      .select({ value: drizzleCount() })
      .from(tasks)
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .where(
        and(
          eq(users.supervisorId, supervisorId),
          lt(tasks.date, today),
          ne(tasks.status, "DONE"),
        ),
      ),
  ]);

  return {
    teamSize: Number(memberCount[0]?.value || 0),
    todayReports: Number(todayReports[0]?.value || 0),
    pendingReports: Number(pendingReports[0]?.value || 0),
    todayAttendance: Number(todayAttendance[0]?.value || 0),
    dueToday: Number(dueTodayTasks[0]?.value || 0),
    overdue: Number(overdueTasksCount[0]?.value || 0),
  };
}

export default async function SupervisorTeamPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
    memberId?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "SUPERVISOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const {
    page: pageParam,
    pageSize: pageSizeParam,
    status: statusFilter,
    memberId,
  } = await searchParams;

  const page = Number(pageParam) || 1;
  const pageSize = Number(pageSizeParam) || 10;

  const [teamMembers, reportsData, stats, urgentTasks] = await Promise.all([
    getTeamMembers(session.user.id),
    getTeamReports(session.user.id, page, pageSize, statusFilter, memberId),
    getTeamStats(session.user.id),
    getTeamDueTasks(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team Overview</h2>
        <p className="text-muted-foreground">
          Monitor team tasks, attendance, and reports
        </p>
      </div>

      <TeamOverview stats={stats} />

      {urgentTasks.length > 0 && <TeamDueTasks tasks={urgentTasks} />}

      <TeamAttendance members={teamMembers} />

      <div className="pt-4">
        <h3 className="text-lg font-semibold mb-4">Team Reports</h3>
        <TeamReportsList
          reports={reportsData.data}
          teamMembers={teamMembers}
          supervisorId={session.user.id}
          pagination={{
            totalPages: reportsData.totalPages,
            currentPage: page,
            totalCount: reportsData.totalCount,
            pageSize: pageSize,
          }}
        />
      </div>
    </div>
  );
}
