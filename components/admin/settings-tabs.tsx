"use client";

import {
  Tabs,
  Card,
  Stack,
  Title,
  Group,
  Badge,
  Text,
  ScrollArea,
  Table,
} from "@mantine/core";
import { CompanySettingsForm } from "@/components/admin/company-settings-form";
import { ShiftManagement } from "@/components/admin/shift-management";
import { Building2, Clock, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SettingsTabsProps {
  initialData: any;
  auditLogs: any[];
}

export function SettingsTabs({ initialData, auditLogs }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="company" variant="pills" color="brand" radius="xl">
      <Tabs.List className="bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
        <Tabs.Tab
          value="company"
          leftSection={<Building2 size={16} />}
          className="rounded-xl px-6 h-10"
        >
          Company Profile
        </Tabs.Tab>
        <Tabs.Tab
          value="shifts"
          leftSection={<Clock size={16} />}
          className="rounded-xl px-6 h-10"
        >
          Shift Management
        </Tabs.Tab>
        <Tabs.Tab
          value="security"
          leftSection={<ShieldAlert size={16} />}
          className="rounded-xl px-6 h-10"
        >
          Security & Audits
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="company" pt="xl">
        <Card withBorder radius="xl" p="xl" className="premium-card">
          <CompanySettingsForm initialData={initialData} />
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="shifts" pt="xl">
        <Card withBorder radius="xl" p="xl" className="premium-card">
          <ShiftManagement />
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="security" pt="xl">
        <Card withBorder radius="xl" p="xl" className="premium-card">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4} className="text-gray-900 dark:text-white">
                Authentication Audit Logs
              </Title>
              <Badge
                color="error"
                variant="filled"
                className="uppercase tracking-widest text-[10px] h-6 px-3"
              >
                Security Monitor Active
              </Badge>
            </Group>

            <Text size="sm" className="text-gray-500 font-medium max-w-2xl">
              Real-time monitoring of authentication events including failed
              logins, account suspensions, and critical system access patterns.
            </Text>

            <ScrollArea
              h={500}
              offsetScrollbars
              className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden"
            >
              <Table verticalSpacing="md" className="min-w-[800px]">
                <Table.Thead className="bg-gray-50/50 dark:bg-white/2">
                  <Table.Tr>
                    <Table.Th className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      User
                    </Table.Th>
                    <Table.Th className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Event
                    </Table.Th>
                    <Table.Th className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Timestamp
                    </Table.Th>
                    <Table.Th className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Address
                    </Table.Th>
                    <Table.Th className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Report/Details
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {auditLogs.map((log) => (
                    <Table.Tr
                      key={log.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors"
                    >
                      <Table.Td>
                        <Stack gap={2}>
                          <Text
                            size="sm"
                            fw={700}
                            className="text-gray-900 dark:text-gray-200"
                          >
                            {log.user
                              ? `${log.user.firstName} ${log.user.lastName}`
                              : "System Agent"}
                          </Text>
                          <Text size="xs" fw={500} className="text-gray-400">
                            {log.userId ? "Registered User" : "Anonymous Probe"}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            log.type.includes("SUCCESS")
                              ? "success"
                              : log.type.includes("FAILURE") ||
                                  log.type.includes("LOCK")
                                ? "error"
                                : "brand"
                          }
                          variant="light"
                          size="sm"
                          className="font-bold uppercase tracking-tighter text-[10px]"
                        >
                          {log.type.replace(/_/g, " ")}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={500} className="text-gray-500">
                          {formatDistanceToNow(new Date(log.creationDate), {
                            addSuffix: true,
                          })}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          size="xs"
                          ff="monospace"
                          className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded inline-block"
                        >
                          {log.ipAddress || "INTERNAL"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          size="xs"
                          className="text-gray-500 italic max-w-sm"
                          lineClamp={2}
                        >
                          {log.message}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        </Card>
      </Tabs.Panel>
    </Tabs>
  );
}
