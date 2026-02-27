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
} from "@/lib/db/schema";
import { eq, and, gte, sql, count, desc, asc } from "drizzle-orm";
import {
  Container,
  Title,
  Stack,
  Text,
  SimpleGrid,
  Card,
  Group,
} from "@mantine/core";
import { BarChart3, Users, Building2, ClipboardCheck } from "lucide-react";

async function getGlobalAnalytics() {
  const [userCount, deptCount, reportCount, taskStats] = await Promise.all([
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
  ]);

  return {
    totalUsers: Number(userCount[0]?.value || 0),
    totalDepartments: Number(deptCount[0]?.value || 0),
    totalReports: Number(reportCount[0]?.value || 0),
    tasks: taskStats.map((ts) => ({
      status: ts.status,
      count: Number(ts.count),
    })),
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

        <Card withBorder padding="md" className="premium-card">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700}>
              TASK COMPLETION
            </Text>
            <BarChart3 size={16} className="text-brand-500" />
          </Group>
          <Text size="xl" fw={700} mt="xs">
            {Math.round(
              ((stats.tasks.find((t) => t.status === "DONE")?.count || 0) /
                (stats.tasks.reduce((acc, curr) => acc + curr.count, 0) || 1)) *
                100,
            )}
            %
          </Text>
        </Card>
      </SimpleGrid>

      {/* Add more detailed charts here later */}
    </Stack>
  );
}
