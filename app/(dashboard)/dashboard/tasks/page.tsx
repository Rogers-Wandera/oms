import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TaskList } from "@/components/tasks/task-list";
import { CreateTaskButton } from "@/components/tasks/create-task-button";
import { DailyReportSubmission } from "@/components/tasks/daily-report-submission";
import { Group } from "@mantine/core";

import { db } from "@/lib/db";
import { tasks, users, dailyReports } from "@/lib/db/schema";
import { eq, sql, asc, desc, and } from "drizzle-orm";

async function getTasks(userId: string, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(eq(tasks.assignedTo, userId));
  const totalCount = Number(totalCountResult[0].count);

  const results = await db.query.tasks.findMany({
    where: (t, { eq }) => eq(t.assignedTo, userId),
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
      createdBy: t.createdBy,
      creationDate: t.creationDate.toISOString(),
      creation_date: t.creationDate.toISOString(),
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
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const pageSize = 10;

  const today = new Date().toISOString().split("T")[0];
  const [tasksData, existingReport, fullUser] = await Promise.all([
    getTasks(session.user.id, page, pageSize),
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
          <DailyReportSubmission
            tasks={tasksData.data}
            userId={session.user.id}
            existingReport={existingReport}
            userSignature={fullUser?.signatureUrl}
          />
          <CreateTaskButton userId={session.user.id} />
        </Group>
      </div>

      <TaskList
        tasks={tasksData.data}
        userId={session.user.id}
        totalPages={tasksData.totalPages}
        currentPage={page}
      />
    </div>
  );
}
