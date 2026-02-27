import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  dailyReports,
  weeklyReports,
  monthlyReports,
  users,
} from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ReportCatalog } from "@/components/reports/report-catalog";
import { Container, Title, Stack, Text } from "@mantine/core";

async function getReports(userId: string, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const [daily, weekly, monthly, user] = await Promise.all([
    db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.userId, userId))
      .orderBy(desc(dailyReports.date))
      .limit(pageSize)
      .offset(offset),
    db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.userId, userId))
      .orderBy(desc(weeklyReports.startDate))
      .limit(pageSize)
      .offset(offset),
    db
      .select()
      .from(monthlyReports)
      .where(eq(monthlyReports.userId, userId))
      .orderBy(desc(monthlyReports.year), desc(monthlyReports.month))
      .limit(pageSize)
      .offset(offset),
    db.query.users.findFirst({ where: eq(users.id, userId) }),
  ]);

  const dailyCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(dailyReports)
    .where(eq(dailyReports.userId, userId));

  return {
    dailyReports: daily,
    weeklyReports: weekly,
    monthlyReports: monthly,
    user,
    totalPages: Math.ceil(Number(dailyCount[0].count) / pageSize),
  };
}

export default async function ReportsPage({
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
  const reportsData = await getReports(session.user.id, page);

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>My Reports</Title>
        <Text c="dimmed" size="sm">
          View and manage your personal reports and submissions.
        </Text>
      </div>
      <ReportCatalog
        dailyReports={reportsData.dailyReports}
        weeklyReports={reportsData.weeklyReports}
        monthlyReports={reportsData.monthlyReports}
        user={reportsData.user}
        currentPage={page}
        totalPages={reportsData.totalPages}
      />
    </Stack>
  );
}
