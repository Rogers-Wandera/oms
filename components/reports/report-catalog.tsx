"use client";

import { useState } from "react";
import {
  Card,
  Table,
  Badge,
  Text,
  Group,
  ActionIcon,
  Stack,
  Tabs,
  Button,
  Pagination,
  Modal,
  Textarea,
} from "@mantine/core";
import {
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Send,
  Signature,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  submitDailyReport,
  submitWeeklyReport,
  submitMonthlyReport,
} from "@/app/actions/report-review";
import { generateReportPDF } from "@/lib/pdf-utils";
import { notifications } from "@mantine/notifications";

interface ReportCatalogProps {
  dailyReports: any[];
  weeklyReports: any[];
  monthlyReports: any[];
  user: any;
  currentPage: number;
  totalPages: number;
}

export function ReportCatalog({
  dailyReports,
  weeklyReports,
  monthlyReports,
  user,
  currentPage,
  totalPages,
}: ReportCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [submissionModal, setSubmissionModal] = useState<{
    report: any;
    type: string;
  } | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSubmit = async () => {
    if (!submissionModal) return;
    setLoading(true);
    try {
      const signatureUrl = user.signatureUrl || "DATA_URL_PLACEHOLDER";

      if (submissionModal.type === "Daily") {
        await submitDailyReport(submissionModal.report.id, signatureUrl);
      } else if (submissionModal.type === "Weekly") {
        await submitWeeklyReport(
          submissionModal.report.id,
          comment,
          signatureUrl,
        );
      } else {
        await submitMonthlyReport(
          submissionModal.report.id,
          comment,
          signatureUrl,
        );
      }

      notifications.show({
        title: "Report Submitted",
        message: "Your report has been signed and submitted for review.",
        color: "success",
      });
      setSubmissionModal(null);
      setComment("");
      router.refresh();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to submit report.",
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge
            color="success"
            variant="light"
            leftSection={<CheckCircle size={12} />}
          >
            Final Approved
          </Badge>
        );
      case "REVIEWED":
        return (
          <Badge
            color="success"
            variant="outline"
            leftSection={<CheckCircle size={12} />}
          >
            Supervisor Approved
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge
            color="brand"
            variant="light"
            leftSection={<Clock size={12} />}
          >
            Awaiting Review
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            color="error"
            variant="light"
            leftSection={<AlertTriangle size={12} />}
          >
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge color="gray" variant="light">
            Draft
          </Badge>
        );
    }
  };

  const renderTable = (
    reports: any[],
    type: "Daily" | "Weekly" | "Monthly",
  ) => (
    <Table verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr className="border-b border-gray-100 dark:border-white/5">
          <Table.Th className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">
            {type === "Daily"
              ? "Date"
              : type === "Weekly"
                ? "Period"
                : "Month/Year"}
          </Table.Th>
          <Table.Th className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">
            Status
          </Table.Th>
          <Table.Th className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">
            Actions
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {reports.length > 0 ? (
          reports.map((report) => (
            <Table.Tr
              key={report.id}
              className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
            >
              <Table.Td>
                <Group gap="sm">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500">
                    <FileText size={16} />
                  </div>
                  <Text
                    size="sm"
                    fw={600}
                    className="text-gray-900 dark:text-gray-200"
                  >
                    {type === "Daily"
                      ? new Date(report.date).toLocaleDateString()
                      : type === "Weekly"
                        ? `${report.startDate} to ${report.endDate}`
                        : `${report.month}/${report.year}`}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>{getStatusBadge(report.status)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {report.status === "DRAFT" ? (
                    <Button
                      size="xs"
                      variant="light"
                      color="brand"
                      leftSection={<Send size={14} />}
                      className="rounded-lg h-8"
                      onClick={() => {
                        setSubmissionModal({ report, type });
                        setComment(report.userComment || report.summary || "");
                      }}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      color="gray"
                      leftSection={<Download size={14} />}
                      className="rounded-lg h-8 border-gray-200 dark:border-white/10"
                      onClick={() => generateReportPDF(report, user, type)}
                    >
                      PDF
                    </Button>
                  )}
                  <ActionIcon
                    variant="subtle"
                    color="brand"
                    component={Link}
                    href={`/dashboard/reports/${type.toLowerCase()}/${report.id}`}
                    className="rounded-lg h-8 w-8"
                  >
                    <Eye size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={3}>
              <Text ta="center" py="xl" c="dimmed">
                No {type.toLowerCase()} reports found.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );

  return (
    <Stack gap="md">
      <Tabs defaultValue="daily" variant="pills" color="brand">
        <Tabs.List className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
          <Tabs.Tab value="daily" className="rounded-lg px-6">
            Daily
          </Tabs.Tab>
          <Tabs.Tab value="weekly" className="rounded-lg px-6">
            Weekly
          </Tabs.Tab>
          <Tabs.Tab value="monthly" className="rounded-lg px-6">
            Monthly
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="daily" pt="md">
          <Card withBorder radius="xl" className="premium-card">
            {renderTable(dailyReports, "Daily")}
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="weekly" pt="md">
          <Card withBorder radius="xl" className="premium-card">
            {renderTable(weeklyReports, "Weekly")}
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="monthly" pt="md">
          <Card withBorder radius="xl" className="premium-card">
            {renderTable(monthlyReports, "Monthly")}
          </Card>
        </Tabs.Panel>
      </Tabs>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={handlePageChange}
            siblings={1}
            boundaries={1}
            color="brand"
            radius="xl"
            size="sm"
          />
        </div>
      )}

      <Modal
        opened={!!submissionModal}
        onClose={() => setSubmissionModal(null)}
        title={
          <Text fw={700} size="lg" className="gradient-text">
            Submit {submissionModal?.type} Report
          </Text>
        }
        size="md"
        radius="xl"
      >
        <Stack gap="md">
          <Text size="sm" className="text-gray-500 font-medium">
            Please review your report summary and provide any final comments.
            Submitting will attach your digital signature:
          </Text>

          <Textarea
            label="Comments / Summary"
            placeholder="Tell us about your work during this period..."
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            minRows={4}
            radius="md"
          />

          <Card
            withBorder
            padding="sm"
            radius="lg"
            className="bg-gray-50/50 dark:bg-white/2 border-dashed"
          >
            <Group gap="xs" mb="sm">
              <Signature size={16} className="text-brand-500" />
              <Text
                size="xs"
                fw={800}
                className="uppercase tracking-widest text-gray-500"
              >
                Digital Signature
              </Text>
            </Group>
            {user.signatureUrl ? (
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <img
                  src={user.signatureUrl}
                  alt="Signature"
                  className="max-h-16 w-auto mx-auto brightness-90 contrast-125 dark:invert"
                />
              </div>
            ) : (
              <Text size="xs" c="red" fw={600} ta="center" py="sm">
                Warning: You haven't set a signature in your profile yet!
              </Text>
            )}
          </Card>

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setSubmissionModal(null)}
            >
              Cancel
            </Button>
            <Button
              color="brand"
              loading={loading}
              onClick={handleSubmit}
              disabled={!user.signatureUrl}
              className="rounded-xl px-8"
            >
              Sign & Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
