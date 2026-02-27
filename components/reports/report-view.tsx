"use client";

import {
  Title,
  Stack,
  Text,
  Card,
  Group,
  Badge,
  Divider,
  List,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  Signature as SignatureIcon,
} from "lucide-react";

interface ReportViewProps {
  report: any;
  type: string;
}

export function ReportView({ report, type }: ReportViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "HEAD_REVIEWED":
        return "indigo";
      case "REVIEWED":
        return "brand";
      case "SUBMITTED":
        return "amber";
      case "REJECTED":
        return "error";
      default:
        return "gray";
    }
  };

  return (
    <Stack gap="xl" py="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
              <FileText size={20} />
            </div>
            <Title order={2} className="capitalize">
              {type} Report Detail
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            Submitted by {report.user?.firstName} {report.user?.lastName} on{" "}
            {new Date(report.creationDate).toLocaleDateString()}
          </Text>
        </Stack>
        <Badge
          size="lg"
          variant="filled"
          color={getStatusColor(report.status)}
          className="uppercase tracking-widest px-4 h-8"
        >
          {report.status.replace("_", " ")}
        </Badge>
      </Group>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Stack gap="lg" className="lg:col-span-2">
          <Card withBorder radius="xl" className="premium-card p-6">
            <Stack gap="md">
              <Group gap="xs">
                <Calendar size={18} className="text-brand-500" />
                <Text fw={700} size="lg">
                  Report Specifics
                </Text>
              </Group>
              <Divider className="opacity-50" />

              <div className="grid grid-cols-2 gap-4">
                <Stack gap={2}>
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={700}
                    className="uppercase tracking-tighter"
                  >
                    Period
                  </Text>
                  <Text fw={600}>
                    {type === "daily"
                      ? report.date
                      : type === "weekly"
                        ? `${report.startDate} - ${report.endDate}`
                        : `${report.month}/${report.year}`}
                  </Text>
                </Stack>
                {report.totalHoursWorked && (
                  <Stack gap={2}>
                    <Text
                      size="xs"
                      c="dimmed"
                      fw={700}
                      className="uppercase tracking-tighter"
                    >
                      Hours Worked
                    </Text>
                    <Text fw={600}>{report.totalHoursWorked} hrs</Text>
                  </Stack>
                )}
              </div>
            </Stack>
          </Card>

          {type === "daily" &&
            report.accomplishments &&
            Array.isArray(report.accomplishments) && (
              <Card withBorder radius="xl" className="premium-card p-6">
                <Stack gap="md">
                  <Group gap="xs">
                    <CheckCircle size={18} className="text-success-500" />
                    <Text fw={700} size="lg">
                      Accomplishments
                    </Text>
                  </Group>
                  <Divider className="opacity-50" />
                  <List
                    spacing="sm"
                    size="sm"
                    center
                    icon={
                      <ThemeIcon color="success" size={20} radius="xl">
                        <CheckCircle size={12} />
                      </ThemeIcon>
                    }
                  >
                    {report.accomplishments.map((item: any, idx: number) => (
                      <List.Item key={idx}>
                        <Text fw={500}>{item.title || item}</Text>
                      </List.Item>
                    ))}
                  </List>
                </Stack>
              </Card>
            )}

          <Card withBorder radius="xl" className="premium-card p-6">
            <Stack gap="md">
              <Group gap="xs">
                <MessageSquare size={18} className="text-brand-500" />
                <Text fw={700} size="lg">
                  Summary & Comments
                </Text>
              </Group>
              <Divider className="opacity-50" />
              <Text
                size="sm"
                className="leading-relaxed bg-gray-50 dark:bg-white/2 p-4 rounded-xl border border-gray-100 dark:border-white/5 whitespace-pre-wrap"
              >
                {report.userComment ||
                  report.summary ||
                  "No comments provided."}
              </Text>
            </Stack>
          </Card>
        </Stack>

        <Stack gap="lg">
          <Card withBorder radius="xl" className="premium-card p-6">
            <Stack gap="md">
              <Group gap="xs">
                <SignatureIcon size={18} className="text-brand-500" />
                <Text fw={700} size="lg">
                  Approval Timeline
                </Text>
              </Group>
              <Divider className="opacity-50" />

              <Timeline
                active={report.status === "APPROVED" ? 4 : 0}
                bulletSize={24}
                lineWidth={2}
              >
                <Timeline.Item
                  bullet={<User size={12} />}
                  title="Employee Signed"
                >
                  <Stack gap={4} mt={8}>
                    {report.signatureUrl ? (
                      <div className="bg-white p-2 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-white/10">
                        <img
                          src={report.signatureUrl}
                          alt="Employee"
                          className="h-12 w-auto mx-auto dark:invert"
                        />
                      </div>
                    ) : (
                      <Text size="xs" c="dimmed italic">
                        Awaiting signature
                      </Text>
                    )}
                  </Stack>
                </Timeline.Item>

                <Timeline.Item
                  bullet={<CheckCircle size={12} />}
                  title="Supervisor Approval"
                >
                  <Stack gap={4} mt={8}>
                    {report.supervisorSignatureUrl ? (
                      <>
                        <div className="bg-white p-2 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-white/10">
                          <img
                            src={report.supervisorSignatureUrl}
                            alt="Supervisor"
                            className="h-12 w-auto mx-auto dark:invert"
                          />
                        </div>
                        {report.supervisorComment && (
                          <Text size="xs" mt={4} c="dimmed" fs="italic">
                            "{report.supervisorComment}"
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text size="xs" c="dimmed" fs="italic">
                        Pending
                      </Text>
                    )}
                  </Stack>
                </Timeline.Item>

                <Timeline.Item
                  bullet={<CheckCircle size={12} />}
                  title="Dept Head Approval"
                >
                  <Stack gap={4} mt={8}>
                    {report.headSignatureUrl ? (
                      <>
                        <div className="bg-white p-2 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-white/10">
                          <img
                            src={report.headSignatureUrl}
                            alt="HoD"
                            className="h-12 w-auto mx-auto dark:invert"
                          />
                        </div>
                        {report.headComment && (
                          <Text size="xs" mt={4} c="dimmed" fs="italic">
                            "{report.headComment}"
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text size="xs" c="dimmed" fs="italic">
                        Pending
                      </Text>
                    )}
                  </Stack>
                </Timeline.Item>

                <Timeline.Item
                  bullet={<CheckCircle size={12} />}
                  title="Manager Final"
                >
                  <Stack gap={4} mt={8}>
                    {report.managerSignatureUrl ? (
                      <>
                        <div className="bg-white p-2 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-white/10">
                          <img
                            src={report.managerSignatureUrl}
                            alt="Manager"
                            className="h-12 w-auto mx-auto dark:invert"
                          />
                        </div>
                        {report.managerComment && (
                          <Text size="xs" mt={4} c="dimmed" fs="italic">
                            "{report.managerComment}"
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text size="xs" c="dimmed" fs="italic">
                        Pending
                      </Text>
                    )}
                  </Stack>
                </Timeline.Item>
              </Timeline>
            </Stack>
          </Card>
        </Stack>
      </div>
    </Stack>
  );
}
