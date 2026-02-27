"use client";

import { useState, useEffect } from "react";
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
  Box,
  Textarea,
  Alert,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@mantine/hooks";
import {
  managerApproveWeeklyReport,
  managerApproveMonthlyReport,
  managerApproveDailyReport,
} from "@/app/actions/report-review";
import {
  LogIn,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  History,
  AlertCircle,
  Search,
} from "lucide-react";
import { formatLocation } from "@/lib/utils/geo";
import { UserAnalysisCard } from "./user-analysis-card";
import { ExtensionApprovalList } from "./extension-approval-list";
import { GenerateDeptReportsButton } from "./generate-dept-reports-button";
import { ServerPagination } from "../ui/server-pagination";

interface ManagerReviewViewProps {
  dailyReports: any[];
  weeklyReports: any[];
  monthlyReports: any[];
  pendingExtensions: any[];
  manager: any;
  approvedDaily: any[];
  approvedWeekly: any[];
  approvedMonthly: any[];
  pagination: {
    totalDaily: number;
    totalWeekly: number;
    totalMonthly: number;
    currentPage: number;
    pageSize: number;
  };
}

export function ManagerReviewView({
  dailyReports,
  weeklyReports,
  monthlyReports,
  pendingExtensions,
  manager,
  approvedDaily,
  approvedWeekly,
  approvedMonthly,
  pagination,
}: ManagerReviewViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const activeTab = searchParams.get("tab") || "daily";
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset page on search
    router.push(`?${params.toString()}`);
  }, [debouncedSearch]);

  const handleTabChange = (value: string | null) => {
    if (value) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      params.set("page", "1"); // Reset page when changing tabs
      router.push(`?${params.toString()}`);
    }
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    setLoading(true);
    try {
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
    isHistory = false,
  ) => (
    <Stack gap="md">
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
                  No records found
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            reports.map((report) => (
              <Table.Tr key={report.id}>
                <Table.Td>
                  <Text fw={500}>
                    {report.user?.firstName} {report.user?.lastName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {report.user?.email}
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
                  <Badge
                    color={report.status === "APPROVED" ? "green" : "brand"}
                  >
                    {report.status}
                  </Badge>
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
                    {isHistory ? "View" : "Review"}
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      {!isHistory && (
        <ServerPagination
          totalPages={Math.ceil(
            (type === "daily"
              ? pagination.totalDaily
              : type === "weekly"
                ? pagination.totalWeekly
                : pagination.totalMonthly) / pagination.pageSize,
          )}
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalRecords={
            type === "daily"
              ? pagination.totalDaily
              : type === "weekly"
                ? pagination.totalWeekly
                : pagination.totalMonthly
          }
        />
      )}
    </Stack>
  );

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={2}>Final Report Reviews</Title>
        {(manager?.role === "MANAGER" || manager?.role === "ADMIN") && (
          <GenerateDeptReportsButton />
        )}
      </Group>

      <Card withBorder radius="md" p="md">
        <TextInput
          placeholder="Search by user name or email..."
          leftSection={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb="md"
        />

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="daily" leftSection={<FileText size={16} />}>
              Daily Reports ({pagination.totalDaily})
            </Tabs.Tab>
            <Tabs.Tab value="weekly" leftSection={<ShieldCheck size={16} />}>
              Weekly Reports ({pagination.totalWeekly})
            </Tabs.Tab>
            <Tabs.Tab value="monthly" leftSection={<ShieldCheck size={16} />}>
              Monthly Reports ({pagination.totalMonthly})
            </Tabs.Tab>
            <Tabs.Tab value="extensions" leftSection={<Clock size={16} />}>
              Time Extensions ({pendingExtensions.length})
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<History size={16} />}>
              Reviewed Reports
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="daily" pt="md">
            {renderTable(dailyReports, "daily")}
          </Tabs.Panel>

          <Tabs.Panel value="weekly" pt="md">
            {renderTable(weeklyReports, "weekly")}
          </Tabs.Panel>

          <Tabs.Panel value="monthly" pt="md">
            {renderTable(monthlyReports, "monthly")}
          </Tabs.Panel>

          <Tabs.Panel value="extensions" pt="md">
            <ExtensionApprovalList
              extensions={pendingExtensions}
              adminId={manager?.id}
            />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <Stack gap="md">
              <Title order={4}>Recently Approved Reports</Title>
              <Divider />
              <Tabs defaultValue="daily_hist">
                <Tabs.List>
                  <Tabs.Tab value="daily_hist">Daily</Tabs.Tab>
                  <Tabs.Tab value="weekly_hist">Weekly</Tabs.Tab>
                  <Tabs.Tab value="monthly_hist">Monthly</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="daily_hist" pt="xs">
                  {renderTable(approvedDaily, "daily", true)}
                </Tabs.Panel>
                <Tabs.Panel value="weekly_hist" pt="xs">
                  {renderTable(approvedWeekly, "weekly", true)}
                </Tabs.Panel>
                <Tabs.Panel value="monthly_hist" pt="xs">
                  {renderTable(approvedMonthly, "monthly", true)}
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Card>

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
            {reportType === "daily" && selectedReport.attendance && (
              <Box
                mb="md"
                p="xs"
                style={{
                  border: "1px solid var(--mantine-color-brand-2)",
                  borderRadius: "8px",
                  backgroundColor: "var(--mantine-color-brand-0)",
                }}
              >
                <Group justify="space-between" mb={8}>
                  <Group gap="xs">
                    <LogIn size={16} className="text-brand-600" />
                    <Text size="sm" fw={700}>
                      Attendance Tracking
                    </Text>
                  </Group>
                  <Badge color="green" variant="light">
                    Present
                  </Badge>
                </Group>
                <Group grow>
                  <Stack gap={2}>
                    <Text size="10px" c="dimmed" fw={700}>
                      CLOCK IN
                    </Text>
                    <Text size="sm" fw={600}>
                      {new Date(
                        selectedReport.attendance.clockIn,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text size="10px" c="dimmed" fw={700}>
                      CLOCK OUT
                    </Text>
                    <Text size="sm" fw={600}>
                      {selectedReport.attendance.clockOut
                        ? new Date(
                            selectedReport.attendance.clockOut,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text size="10px" c="dimmed" fw={700}>
                      LOCATION (IN)
                    </Text>
                    <Group gap={4}>
                      <MapPin size={10} />
                      <Text size="xs" fw={500}>
                        {formatLocation(
                          selectedReport.attendance.latIn,
                          selectedReport.attendance.longIn,
                        )}
                      </Text>
                    </Group>
                  </Stack>
                </Group>
              </Box>
            )}

            {selectedReport.accomplishments &&
              selectedReport.accomplishments.length > 0 && (
                <UserAnalysisCard
                  accomplishments={selectedReport.accomplishments}
                  userName={`${selectedReport.user?.firstName} ${selectedReport.user?.lastName}`}
                />
              )}

            <Group justify="space-between">
              <Box>
                <Text size="sm" fw={700}>
                  User
                </Text>
                <Text>
                  {selectedReport.user?.firstName}{" "}
                  {selectedReport.user?.lastName}
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
                {selectedReport.user?.signatureUrl ? (
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
              <Text size="sm" fw={700} mb="xs">
                Work Accomplishments
              </Text>
              <ScrollArea h={150} offsetScrollbars>
                {selectedReport.accomplishments &&
                selectedReport.accomplishments.length > 0 ? (
                  <Stack gap={4}>
                    {selectedReport.accomplishments.map(
                      (acc: any, index: number) => (
                        <Group key={index} gap="xs" wrap="nowrap">
                          <Badge size="xs" color="success" variant="light">
                            DONE
                          </Badge>
                          <Text size="xs" truncate>
                            {acc.title}{" "}
                            {acc.isSubTask && (
                              <Text component="span" c="dimmed" size="10px">
                                (Sub-task)
                              </Text>
                            )}
                          </Text>
                        </Group>
                      ),
                    )}
                  </Stack>
                ) : (
                  <Text size="xs" c="dimmed" fs="italic">
                    No accomplishments recorded for this period.
                  </Text>
                )}
              </ScrollArea>
            </Box>

            <Divider />

            <Box>
              <Text size="sm" fw={700}>
                Summary / Comments
              </Text>
              <ScrollArea h={100} offsetScrollbars>
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
              {!manager?.signatureUrl ? (
                <Alert
                  icon={<AlertCircle size={16} />}
                  title="Signature Required"
                  color="red"
                  variant="light"
                  style={{ flex: 1 }}
                >
                  <Text size="sm">
                    You must upload a signature in your profile settings before
                    you can approve reports.
                  </Text>
                </Alert>
              ) : (
                <Button color="brand" loading={loading} onClick={handleApprove}>
                  Final Approve & Sign
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
