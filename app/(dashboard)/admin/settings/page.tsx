import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Title, Container, Stack, Breadcrumbs, Anchor } from "@mantine/core";
import { getCompanySettings } from "@/app/actions/company-settings";
import { getAuthAuditLogs } from "@/app/actions/auth-audit";
import { SettingsTabs } from "@/components/admin/settings-tabs";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const pageSize = Number(pageSizeParam) || 50;

  const [initialData, auditLogsData] = await Promise.all([
    getCompanySettings(),
    getAuthAuditLogs(page, pageSize),
  ]);

  const items = [
    { title: "Admin", href: "/admin/users" },
    { title: "Settings", href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  return (
    <Stack gap="lg">
      <Breadcrumbs>{items}</Breadcrumbs>

      <Title order={2} className="gradient-text">
        Admin Settings
      </Title>

      <SettingsTabs
        initialData={initialData}
        auditLogsData={auditLogsData.data}
        pagination={{
          page,
          totalPages: auditLogsData.totalPages,
          totalCount: auditLogsData.totalCount,
          pageSize,
        }}
      />
    </Stack>
  );
}
