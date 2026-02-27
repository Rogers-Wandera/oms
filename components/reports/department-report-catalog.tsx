"use client";

import {
  Card,
  Table,
  Badge,
  Text,
  Group,
  ActionIcon,
  Stack,
  Pagination,
  Modal,
  ScrollArea,
  Button,
} from "@mantine/core";
import { Eye, FileText, Download, Building2, Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { generateReportPDF } from "@/lib/pdf-utils";

interface DepartmentReportCatalogProps {
  reports: any[];
  totalPages: number;
  currentPage: number;
}

export function DepartmentReportCatalog({
  reports,
  totalPages,
  currentPage,
}: DepartmentReportCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge color="blue">Generated</Badge>;
      case "APPROVED":
        return <Badge color="green">Final</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <Stack gap="md">
      <Card withBorder radius="md">
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Department</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Interval</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <Table.Tr key={report.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Building2 size={16} />
                      <Text size="sm" fw={500}>
                        {report.department?.name || "Global"}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline" size="sm">
                      {report.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Calendar size={14} />
                      <Text size="xs">
                        {report.type === "DAILY"
                          ? new Date(report.date).toLocaleDateString()
                          : report.type === "WEEKLY"
                            ? `${report.startDate} to ${report.endDate}`
                            : `${report.month}/${report.year}`}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{getStatusBadge(report.status)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() =>
                          generateReportPDF(
                            report,
                            {
                              firstName: report.department?.name,
                              lastName: "Dept",
                              email: "N/A",
                            },
                            `Dept ${report.type}` as any,
                          )
                        }
                      >
                        <Download size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" py="xl" c="dimmed">
                    No departmental reports found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={handlePageChange}
            color="blue"
          />
        </div>
      )}

      <Modal
        opened={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={
          selectedReport
            ? `${selectedReport.department?.name} - ${selectedReport.type} Combined Report`
            : ""
        }
        size="lg"
      >
        <Stack gap="md">
          <Card withBorder padding="md" bg="gray.0">
            <Stack gap="xs">
              <Text fw={700} size="sm">
                Report Interval:
              </Text>
              <Text size="sm">
                {selectedReport?.type === "DAILY"
                  ? selectedReport.date
                  : selectedReport?.type === "WEEKLY"
                    ? `${selectedReport.startDate} to ${selectedReport.endDate}`
                    : `${selectedReport?.month}/${selectedReport?.year}`}
              </Text>
            </Stack>
          </Card>

          <div>
            <Text fw={700} size="sm" mb="xs">
              Aggregated Accomplishments:
            </Text>
            <ScrollArea h={300} offsetScrollbars>
              <Card withBorder p="sm">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {selectedReport?.summary || "No data available."}
                </Text>
              </Card>
            </ScrollArea>
          </div>

          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
            <Button
              leftSection={<Download size={14} />}
              onClick={() =>
                generateReportPDF(
                  selectedReport,
                  {
                    firstName: selectedReport.department?.name,
                    lastName: "Dept",
                    email: "N/A",
                  },
                  `Dept ${selectedReport.type}` as any,
                )
              }
            >
              Download PDF
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
