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
  Button,
  Box,
  Textarea,
  Alert,
} from "@mantine/core";
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  Signature as SignatureIcon,
  Download,
  ShieldCheck,
  AlertCircle,
  Send,
} from "lucide-react";
import { generateReportPDF } from "@/lib/pdf-utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  managerApproveDailyReport,
  managerApproveWeeklyReport,
  managerApproveMonthlyReport,
} from "@/app/actions/report-review";

interface ReportViewProps {
  report: any;
  type: string;
  manager?: any;
}

export function ReportView({ report, type, manager }: ReportViewProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = manager || session?.user;

  const canApprove =
    (currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN") &&
    (report.status === "SUBMITTED" || report.status === "HEAD_REVIEWED");

  const handleApprove = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const signatureUrl = currentUser.signatureUrl || null;

      if (type === "daily") {
        await managerApproveDailyReport(report.id, signatureUrl, comment);
      } else if (type === "weekly") {
        await managerApproveWeeklyReport(report.id, signatureUrl, comment);
      } else {
        await managerApproveMonthlyReport(report.id, signatureUrl, comment);
      }

      notifications.show({
        title: "Success",
        message: "Report approved successfully.",
        color: "green",
      });
      window.location.reload();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to approve report.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };
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
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<Download size={16} />}
            onClick={() => {
              const displayType = type.charAt(0).toUpperCase() + type.slice(1);
              generateReportPDF(report, report.user, displayType as any);
            }}
          >
            Download PDF
          </Button>
          <Badge
            size="lg"
            variant="filled"
            color={getStatusColor(report.status)}
            className="uppercase tracking-widest px-4 h-8"
          >
            {report.status.replace("_", " ")}
          </Badge>
        </Group>
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
                active={
                  report.status === "APPROVED"
                    ? 4
                    : report.status === "HEAD_REVIEWED"
                      ? 3
                      : report.status === "REVIEWED"
                        ? 2
                        : report.user?.supervisorId
                          ? 1
                          : 1 // 1 is always active for signed, but we want to show progress
                }
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
                    {!report.user?.supervisorId ? (
                      <Text size="xs" c="dimmed" fs="italic">
                        N/A: Direct Submission by Manager/Admin
                      </Text>
                    ) : report.supervisorSignatureUrl ? (
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
                        Pending Supervisor Review
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
                        {report.user?.supervisorId
                          ? "Pending Dept Head Review"
                          : "N/A: Direct Submission"}
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
                        {report.status === "SUBMITTED" &&
                        !report.user?.supervisorId
                          ? "Directly Awaiting Manager Review"
                          : "Pending Final Approval"}
                      </Text>
                    )}
                  </Stack>
                </Timeline.Item>
              </Timeline>
            </Stack>
          </Card>

          {canApprove && (
            <Card withBorder radius="xl" className="premium-card p-6 mt-6">
              <Stack gap="md">
                <Group gap="xs">
                  <ShieldCheck size={20} className="text-brand-500" />
                  <Text fw={700} size="lg">
                    Administrative Actions
                  </Text>
                </Group>
                <Text size="sm" c="dimmed">
                  As a Manager/Admin, you can perform the final approval and
                  signoff for this report directly from here.
                </Text>

                <Divider className="opacity-50" />

                <Textarea
                  label="Manager's Comment (Optional)"
                  placeholder="Add your final feedback or notes here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  minRows={3}
                  radius="md"
                />

                <Group justify="flex-end" mt="sm">
                  {!currentUser?.signatureUrl ? (
                    <Alert
                      icon={<AlertCircle size={16} />}
                      title="Signature Required"
                      color="red"
                      variant="light"
                      style={{ flex: 1 }}
                      radius="md"
                    >
                      <Text size="sm">
                        You must upload a signature in your profile settings
                        before you can approve reports.
                      </Text>
                    </Alert>
                  ) : (
                    <Button
                      color="brand"
                      size="md"
                      radius="md"
                      loading={loading}
                      onClick={handleApprove}
                      leftSection={<Send size={16} />}
                    >
                      Final Approve & Sign
                    </Button>
                  )}
                </Group>
              </Stack>
            </Card>
          )}
        </Stack>
      </div>
    </Stack>
  );
}
