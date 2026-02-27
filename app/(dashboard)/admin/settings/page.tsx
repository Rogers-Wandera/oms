import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Title, Container, Stack, Breadcrumbs, Anchor } from "@mantine/core";
import { getCompanySettings } from "@/app/actions/company-settings";
import { getAuthAuditLogs } from "@/app/actions/auth-audit";
import { SettingsTabs } from "@/components/admin/settings-tabs";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [initialData, auditLogs] = await Promise.all([
    getCompanySettings(),
    getAuthAuditLogs(),
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

      <SettingsTabs initialData={initialData} auditLogs={auditLogs} />
    </Stack>
  );
}
