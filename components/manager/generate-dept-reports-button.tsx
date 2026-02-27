"use client";

import { useState } from "react";
import { Button, Modal, Stack, Text, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { generateAllPendingDepartmentReports } from "@/app/actions/departmental-reports";
import { LayoutDashboard, Send } from "lucide-react";

export function GenerateDeptReportsButton() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateAllPendingDepartmentReports();
      if (result.success) {
        notifications.show({
          title: "Success",
          message: `Successfully generated ${result.data?.length || 0} departmental reports.`,
          color: "green",
        });
        setOpened(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to generate departmental reports.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="light"
        color="brand"
        leftSection={<LayoutDashboard size={16} />}
        onClick={() => setOpened(true)}
      >
        Generate Dept Reports
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Generate Departmental Reports"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">
            This will aggregate all submitted daily reports for today and create
            consolidated summaries for each department.
          </Text>
          <Text size="xs" c="dimmed">
            Note: This process usually runs automatically via cron, but you can
            trigger it manually here if needed.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button
              color="brand"
              loading={loading}
              onClick={handleGenerate}
              leftSection={<Send size={16} />}
            >
              Start Aggregation
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
