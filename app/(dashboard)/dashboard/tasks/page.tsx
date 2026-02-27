import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TaskList } from "@/components/tasks/task-list";
import { CreateTaskButton } from "@/components/tasks/create-task-button";
import { DailyReportSubmission } from "@/components/tasks/daily-report-submission";
import { WeeklyReportSubmission } from "@/components/tasks/weekly-report-submission";
import { MonthlyReportSubmission } from "@/components/tasks/monthly-report-submission";
import { Group } from "@mantine/core";
import { TaskFilters } from "@/components/tasks/task-filters";

import { db } from "@/lib/db";
import { tasks, users, dailyReports } from "@/lib/db/schema";
import { eq, sql, asc, desc, and } from "drizzle-orm";

async function getTasks(
  userId: string,
  page = 1,
  pageSize = 10,
  q?: string,
  statusFilter?: string,
) {
  const offset = (page - 1) * pageSize;

  const whereConditions = [eq(tasks.assignedTo, userId)];
  if (q) {
    whereConditions.push(sql`${tasks.title} ILIKE ${`%${q}%`}`);
  }

  if (statusFilter && statusFilter !== "all") {
    // Map UI status back to DB status
    const dbStatus =
      statusFilter === "PENDING"
        ? "PLANNED"
        : statusFilter === "IN_PROGRESS"
          ? "NOT_DONE"
          : statusFilter === "COMPLETED"
            ? "DONE"
            : null;
    if (dbStatus) {
      whereConditions.push(eq(tasks.status, dbStatus as any));
    }
  }

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(...whereConditions));
  const totalCount = Number(totalCountResult[0].count);

  const results = await db.query.tasks.findMany({
    where: and(...whereConditions),
    with: {
      subTasks: true,
      creator: true,
    },
    orderBy: (t, { asc, desc }) => [
      sql`CASE ${t.status} 
        WHEN 'PLANNED' THEN 1 
        WHEN 'NOT_DONE' THEN 2 
        WHEN 'DONE' THEN 3 
      END`,
      asc(t.date),
      desc(t.creationDate),
    ],
    limit: pageSize,
    offset: offset,
  });

  const lockedDates = await db
    .select({ date: dailyReports.date })
    .from(dailyReports)
    .where(eq(dailyReports.userId, userId));
  const lockedDatesSet = new Set(lockedDates.map((d) => d.date));

  return {
    data: results.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status:
        t.status === "PLANNED"
          ? "IN_PROGRESS"
          : t.status === "DONE"
            ? "COMPLETED"
            : "PENDING",
      due_date: t.date,
      date: t.date,
      isLocked: t.date ? lockedDatesSet.has(t.date) : false,
      createdBy: t.createdBy,
      creationDate: t.creationDate.toISOString(),
      creation_date: t.creationDate.toISOString(),
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      created_by_name: t.creator
        ? `${t.creator.firstName} ${t.creator.lastName}`.trim()
        : "System",
      subTasks: t.subTasks || [],
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { page: pageParam, q, status } = await searchParams;
  const page = Number(pageParam) || 1;
  const pageSize = 10;

  const today = new Date().toISOString().split("T")[0];
  const [tasksData, existingReport, fullUser] = await Promise.all([
    getTasks(session.user.id, page, pageSize, q, status),
    db.query.dailyReports.findFirst({
      where: and(
        eq(dailyReports.userId, session.user.id),
        eq(dailyReports.date, today),
      ),
    }),
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { signatureUrl: true },
    }),
  ]);

  // Fetch team members if supervisor or admin
  let teamMembers: any[] = [];
  if (session.user.role === "SUPERVISOR" || session.user.role === "ADMIN") {
    const { getTeamMembers } = await import("@/app/actions/users");
    teamMembers = await getTeamMembers(session.user.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
          <p className="text-muted-foreground">
            Manage and track your assigned tasks
          </p>
        </div>
        <Group gap="sm">
          <Group>
            <DailyReportSubmission
              tasks={tasksData.data}
              userId={session.user.id}
              existingReport={existingReport}
              userSignature={fullUser?.signatureUrl}
            />
            <WeeklyReportSubmission
              tasks={tasksData.data}
              userId={session.user.id}
            />
            <MonthlyReportSubmission
              tasks={tasksData.data}
              userId={session.user.id}
            />
          </Group>
          <CreateTaskButton
            userId={session.user.id}
            subordinates={teamMembers}
          />
        </Group>
      </div>

      <TaskFilters />

      <TaskList
        tasks={tasksData.data}
        userId={session.user.id}
        totalPages={tasksData.totalPages}
        currentPage={page}
        totalCount={tasksData.totalCount}
      />
    </div>
  );
}
