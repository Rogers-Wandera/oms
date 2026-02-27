"use client";

import { useState } from "react";
import {
  Title,
  Stack,
  Tabs,
  Card,
  Text,
  Group,
  Button,
  Badge,
  Table,
  Modal,
  ScrollArea,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  managerApproveWeeklyReport,
  managerApproveMonthlyReport,
  managerApproveDailyReport,
} from "@/app/actions/report-review";
import { ExtensionApprovalList } from "./extension-approval-list";
import { Clock, ShieldCheck, FileText } from "lucide-react";
import { Box, Textarea } from "@mantine/core";

interface ManagerReviewViewProps {
  dailyReports: any[];
  weeklyReports: any[];
  monthlyReports: any[];
  pendingExtensions: any[];
  manager: any;
}

export function ManagerReviewView({
  dailyReports,
  weeklyReports,
  monthlyReports,
  pendingExtensions,
  manager,
}: ManagerReviewViewProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>("daily");
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  const handleApprove = async () => {
    if (!selectedReport) return;
    setLoading(true);
    try {
      // For demo purposes, we'll use the manager's saved signature if it exists
      // If the manager doesn't have a signature saved, prefer null so we don't
      // persist a non-URL sentinel string into the DB (which could be misused)
      const signatureUrl = manager.signatureUrl || null;

      if (reportType === "daily") {
        await managerApproveDailyReport(
          selectedReport.id,
          signatureUrl,
          comment,
        );
      } else if (reportType === "weekly") {
        await managerApproveWeeklyReport(
          selectedReport.id,
          signatureUrl,
          comment,
        );
      } else {
        await managerApproveMonthlyReport(
          selectedReport.id,
          signatureUrl,
          comment,
        );
      }

      notifications.show({
        title: "Success",
        message: "Report approved successfully.",
        color: "green",
      });
      setSelectedReport(null);
      setComment("");
      // Window reload is a simple way to refresh server data in this demo
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

  const renderTable = (
    reports: any[],
    type: "daily" | "weekly" | "monthly",
  ) => (
    <Table verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>User</Table.Th>
          <Table.Th>
            {type === "daily"
              ? "Date"
              : type === "weekly"
                ? "Period"
                : "Month/Year"}
          </Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {reports.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Text ta="center" c="dimmed">
                No pending reviews
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          reports.map((report) => (
            <Table.Tr key={report.id}>
              <Table.Td>
                <Text fw={500}>
                  {report.user.firstName} {report.user.lastName}
                </Text>
                <Text size="xs" c="dimmed">
                  {report.user.email}
                </Text>
              </Table.Td>
              <Table.Td>
                {type === "daily"
                  ? report.date
                  : type === "weekly"
                    ? `${report.startDate} to ${report.endDate}`
                    : `${report.month}/${report.year}`}
              </Table.Td>
              <Table.Td>
                <Badge color="brand">{report.status}</Badge>
              </Table.Td>
              <Table.Td>
                <Button
                  size="xs"
                  color="brand"
                  variant="light"
                  onClick={() => {
                    setSelectedReport(report);
                    setReportType(type);
                    setComment("");
                  }}
                >
                  Review
                </Button>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );

  return (
    <Stack gap="xl">
      <Title order={2}>Final Report Reviews</Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="daily" leftSection={<FileText size={16} />}>
            Daily Reports ({dailyReports.length})
          </Tabs.Tab>
          <Tabs.Tab value="weekly" leftSection={<ShieldCheck size={16} />}>
            Weekly Reports ({weeklyReports.length})
          </Tabs.Tab>
          <Tabs.Tab value="monthly" leftSection={<ShieldCheck size={16} />}>
            Monthly Reports ({monthlyReports.length})
          </Tabs.Tab>
          <Tabs.Tab value="extensions" leftSection={<Clock size={16} />}>
            Time Extensions ({pendingExtensions.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="daily" pt="md">
          <Card withBorder radius="md">
            {renderTable(dailyReports, "daily")}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="weekly" pt="md">
          <Card withBorder radius="md">
            {renderTable(weeklyReports, "weekly")}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="monthly" pt="md">
          <Card withBorder radius="md">
            {renderTable(monthlyReports, "monthly")}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="extensions" pt="md">
          <ExtensionApprovalList
            extensions={pendingExtensions}
            adminId={manager.id}
          />
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={`Final Review: ${
          reportType === "daily"
            ? "Daily"
            : reportType === "weekly"
              ? "Weekly"
              : "Monthly"
        } Report`}
        size="lg"
      >
        {selectedReport && (
          <Stack gap="md">
            <Group justify="space-between">
              <Box>
                <Text size="sm" fw={700}>
                  User
                </Text>
                <Text>
                  {selectedReport.user.firstName} {selectedReport.user.lastName}
                </Text>
              </Box>
              <Box>
                <Text size="sm" fw={700}>
                  Period
                </Text>
                <Text>
                  {reportType === "daily"
                    ? selectedReport.date
                    : reportType === "weekly"
                      ? `${selectedReport.startDate} to ${selectedReport.endDate}`
                      : `${selectedReport.month}/${selectedReport.year}`}
                </Text>
              </Box>
              <Box>
                <Text size="sm" fw={700}>
                  User Signature
                </Text>
                {selectedReport.user.signatureUrl ? (
                  <img
                    src={selectedReport.user.signatureUrl}
                    alt="User Sig"
                    style={{ maxHeight: "40px", marginTop: "4px" }}
                  />
                ) : (
                  <Text size="xs" c="dimmed">
                    No signature
                  </Text>
                )}
              </Box>
            </Group>

            <Divider />

            <Box>
              <Text size="sm" fw={700}>
                Summary / Comments
              </Text>
              <ScrollArea h={200} offsetScrollbars>
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {reportType === "daily"
                    ? selectedReport.userComment
                    : selectedReport.summary}
                </Text>
              </ScrollArea>
            </Box>

            <Divider />

            <Box>
              <Text size="sm" fw={700} mb={5}>
                Manager's Comment (Optional)
              </Text>
              <Textarea
                placeholder="Add your final feedback or notes here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                minRows={3}
              />
            </Box>

            <Divider />

            <Group grow>
              <Box>
                <Text size="xs" fw={700} c="dimmed">
                  USER SIGNATURE
                </Text>
                {selectedReport.signatureUrl ? (
                  <img
                    src={selectedReport.signatureUrl}
                    alt="User Sig"
                    style={{ maxWidth: "150px" }}
                  />
                ) : (
                  <Text fs="italic" c="red">
                    Missing
                  </Text>
                )}
              </Box>
              <Box>
                <Text size="xs" fw={700} c="dimmed">
                  SUPERVISOR SIGNATURE
                </Text>
                {selectedReport.supervisorSignatureUrl ? (
                  <img
                    src={selectedReport.supervisorSignatureUrl}
                    alt="Sup Sig"
                    style={{ maxWidth: "150px" }}
                  />
                ) : (
                  <Text fs="italic" c="red">
                    Missing
                  </Text>
                )}
              </Box>
              <Box>
                <Text size="xs" fw={700} c="dimmed">
                  HEAD SIGNATURE
                </Text>
                {selectedReport.headSignatureUrl ? (
                  <img
                    src={selectedReport.headSignatureUrl}
                    alt="Head Sig"
                    style={{ maxWidth: "150px" }}
                  />
                ) : (
                  <Text fs="italic" c="dimmed">
                    Not Required / Pending
                  </Text>
                )}
              </Box>
            </Group>

            <Group justify="flex-end" mt="xl">
              <Button
                variant="outline"
                color="red"
                onClick={() => setSelectedReport(null)}
              >
                Cancel
              </Button>
              <Button color="brand" loading={loading} onClick={handleApprove}>
                Final Approve & Sign
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
