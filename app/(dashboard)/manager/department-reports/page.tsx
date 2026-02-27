import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { departmentReports, departments } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Container, Title, Stack, Text, Group } from "@mantine/core";
import { DepartmentReportCatalog } from "@/components/reports/department-report-catalog";

async function getDepartmentReports(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const results = await db.query.departmentReports.findMany({
    with: {
      department: true,
    },
    orderBy: [desc(departmentReports.creationDate)],
    limit: pageSize,
    offset: offset,
  });

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(departmentReports);
  const totalCount = Number(totalCountResult[0].count);

  return {
    data: results,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export default async function DepartmentReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
  ) {
    redirect("/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const reportsData = await getDepartmentReports(page);

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Departmental Combined Reports</Title>
        <Text c="dimmed" size="sm">
          Overview of aggregated activity summaries for all departments.
        </Text>
      </div>

      <DepartmentReportCatalog
        reports={reportsData.data}
        totalPages={reportsData.totalPages}
        currentPage={page}
      />
    </Stack>
  );
}
