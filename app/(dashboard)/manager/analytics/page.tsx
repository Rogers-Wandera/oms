import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  users,
  dailyReports,
  tasks,
  attendance,
  departments,
  subTasks,
} from "@/lib/db/schema";
import { SubTaskSLAPerformance } from "@/components/analytics/subtask-sla-performance";
import { eq, and, gte, sql, count, desc, asc, ne, lt } from "drizzle-orm";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(duration);
dayjs.extend(isSameOrBefore);
import {
  Container,
  Title,
  Stack,
  Text,
  SimpleGrid,
  Card,
  Group,
} from "@mantine/core";
import {
  BarChart3,
  Users,
  Building2,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

async function getGlobalAnalytics() {
  const today = new Date().toISOString().split("T")[0];

  const [
    userCount,
    deptCount,
    reportCount,
    taskStats,
    dueToday,
    overdue,
    subTaskStats,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(departments),
    db.select({ value: count() }).from(dailyReports),
    db
      .select({
        status: tasks.status,
        count: count(),
      })
      .from(tasks)
      .groupBy(tasks.status),
    db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.date, today), ne(tasks.status, "DONE"))),
    db
      .select({ value: count() })
      .from(tasks)
      .where(and(lt(tasks.date, today), ne(tasks.status, "DONE"))),
    db
      .select({
        id: subTasks.id,
        creationDate: subTasks.creationDate,
        completedAt: subTasks.completedAt,
        dueDate: subTasks.dueDate,
        isDone: subTasks.isDone,
      })
      .from(subTasks),
  ]);

  // Calculate Sub-Task SLA
  const completedSubTasks = subTaskStats.filter(
    (st) => st.isDone && st.completedAt,
  );
  const totalCompleted = completedSubTasks.length;

  let totalMins = 0;
  let totalMinsDelayed = 0;
  let onTimeCount = 0;

  completedSubTasks.forEach((st) => {
    const start = dayjs(st.creationDate);
    const end = dayjs(st.completedAt!);
    const diffMins = end.diff(start, "minute", true);
    totalMins += Math.max(0, diffMins);

    if (st.dueDate) {
      const deadline = dayjs(st.dueDate).endOf("day");
      if (end.isSameOrBefore(deadline)) {
        onTimeCount++;
      } else {
        const delayMins = end.diff(deadline, "minute", true);
        totalMinsDelayed += Math.max(0, delayMins);
      }
    } else {
      onTimeCount++; // If no deadline, it's "on time" for now
    }
  });

  const avgCompletionTimeMins =
    totalCompleted > 0 ? Math.round(totalMins / totalCompleted) : 0;
  const avgDelayMins =
    totalCompleted > 0 ? Math.round(totalMinsDelayed / totalCompleted) : 0;
  const onTimePercentage =
    totalCompleted > 0 ? Math.round((onTimeCount / totalCompleted) * 100) : 100;
  const currentOverdueSubTasks = subTaskStats.filter(
    (st) =>
      !st.isDone &&
      st.dueDate &&
      dayjs().isAfter(dayjs(st.dueDate).endOf("day")),
  ).length;

  return {
    totalUsers: Number(userCount[0]?.value || 0),
    totalDepartments: Number(deptCount[0]?.value || 0),
    totalReports: Number(reportCount[0]?.value || 0),
    dueToday: Number(dueToday[0]?.value || 0),
    overdue: Number(overdue[0]?.value || 0),
    tasks: taskStats.map((ts) => ({
      status: ts.status,
      count: Number(ts.count),
    })),
    sla: {
      avgCompletionTimeMins,
      avgDelayMins,
      onTimePercentage,
      totalCompleted,
      overdueCount: currentOverdueSubTasks,
    },
  };
}

export default async function ManagerAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
  ) {
    redirect("/dashboard");
  }

  const stats = await getGlobalAnalytics();

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Global Analytics</Title>
        <Text c="dimmed" size="sm">
          Organization-wide productivity and engagement metrics.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Card withBorder padding="md" className="premium-card">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700}>
              TOTAL USERS
            </Text>
            <Users size={16} className="text-brand-500" />
          </Group>
          <Text size="xl" fw={700} mt="xs">
            {stats.totalUsers}
          </Text>
        </Card>

        <Card withBorder padding="md" className="premium-card">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700}>
              DEPARTMENTS
            </Text>
            <Building2 size={16} className="text-brand-500" />
          </Group>
          <Text size="xl" fw={700} mt="xs">
            {stats.totalDepartments}
          </Text>
        </Card>

        <Card withBorder padding="md" className="premium-card">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700}>
              TOTAL REPORTS
            </Text>
            <ClipboardCheck size={16} className="text-brand-500" />
          </Group>
          <Text size="xl" fw={700} mt="xs">
            {stats.totalReports}
          </Text>
        </Card>

        <Card
          withBorder
          padding="md"
          className="premium-card border-amber-500/20 bg-amber-500/5"
        >
          <Group justify="space-between">
            <Text size="xs" c="amber.8" fw={700}>
              DUE TODAY
            </Text>
            <BarChart3 size={16} className="text-amber-600" />
          </Group>
          <Text size="xl" fw={700} mt="xs" c="amber.9">
            {stats.dueToday}
          </Text>
        </Card>

        <Card
          withBorder
          padding="md"
          className="premium-card border-red-500/20 bg-red-500/5"
        >
          <Group justify="space-between">
            <Text size="xs" c="red.8" fw={700}>
              SYSTEM OVERDUE
            </Text>
            <AlertCircle size={16} className="text-red-600" />
          </Group>
          <Text size="xl" fw={700} mt="xs" c="red.9">
            {stats.overdue}
          </Text>
        </Card>
      </SimpleGrid>

      <SubTaskSLAPerformance stats={stats.sla} />

      {/* Add more detailed charts here later */}
    </Stack>
  );
}
