"use client";

import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Stack,
  Textarea,
  Text,
  Group,
  ScrollArea,
  Badge,
  ThemeIcon,
  Divider,
  Box,
} from "@mantine/core";
import { Calendar, CheckCircle2, Send } from "lucide-react";
import { createMonthlyReport } from "@/app/actions/reports";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import SignatureCanvas from "react-signature-canvas";

interface MonthlyReportSubmissionProps {
  userId: string;
  tasks: any[]; // All tasks for the user
}

export function MonthlyReportSubmission({
  userId,
  tasks,
}: MonthlyReportSubmissionProps) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const router = useRouter();
  const signatureRef = useRef<SignatureCanvas>(null);

  // Aggregate accomplishments from the current month
  const startOfMonth = dayjs().startOf("month");

  const accomplishments = tasks.flatMap((t) => {
    const items: any[] = [];

    // Check main task
    if (
      t.status === "COMPLETED" &&
      t.completedAt &&
      dayjs(t.completedAt).isAfter(startOfMonth)
    ) {
      items.push({ id: t.id, title: t.title, type: "TASK", isSubTask: false });
    }

    // Check sub-tasks
    if (t.subTasks) {
      t.subTasks.forEach((st: any) => {
        if (
          st.isDone &&
          st.completedAt &&
          dayjs(st.completedAt).isAfter(startOfMonth)
        ) {
          items.push({
            id: st.id,
            title: st.title,
            type: "SUBTASK",
            isSubTask: true,
            parentTitle: t.title,
          });
        }
      });
    }

    return items;
  });

  const handleSubmit = async () => {
    if (!summary.trim()) {
      notifications.show({
        title: "Error",
        message: "Please provide a summary of your month.",
        color: "red",
      });
      return;
    }

    const signatureData = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");
    if (!signatureData || signatureData === "data:,") {
      notifications.show({
        title: "Error",
        message: "Please provide your signature.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const month = dayjs().month() + 1; // 1-12
      const year = dayjs().year();

      await createMonthlyReport({
        userId,
        month,
        year,
        summary,
        accomplishments,
        signatureUrl: signatureData,
      });

      notifications.show({
        title: "Success",
        message: "Monthly report submitted successfully!",
        color: "green",
      });
      setOpened(false);
      setSummary("");
      signatureRef.current?.clear();
      router.refresh();
    } catch (error: any) {
      notifications.show({
        title: "Submission Failed",
        message: error.message || "An error occurred",
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
        leftSection={<Calendar size={16} />}
        onClick={() => setOpened(true)}
      >
        Submit Monthly Report
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Text fw={700}>Monthly Performance Report</Text>}
        size="lg"
        radius="md"
        className="premium-modal"
      >
        <Stack gap="md">
          <Box
            p="xs"
            bg="var(--mantine-color-brand-0)"
            style={{
              borderRadius: "8px",
              border: "1px solid var(--mantine-color-brand-2)",
            }}
          >
            <Group gap="xs" mb={4}>
              <ThemeIcon variant="light" color="brand" size="sm">
                <CheckCircle2 size={14} />
              </ThemeIcon>
              <Text size="sm" fw={700}>
                Monthly Accomplishments
              </Text>
            </Group>
            <Text size="xs" c="dimmed" mb="xs">
              Cumulative tasks and sub-tasks completed this month.
            </Text>

            <ScrollArea h={120} offsetScrollbars>
              {accomplishments.length > 0 ? (
                <Stack gap={4}>
                  {accomplishments.map((acc, idx) => (
                    <Group key={idx} gap="xs" wrap="nowrap">
                      <Badge size="xs" variant="light" color="success">
                        DONE
                      </Badge>
                      <Text size="xs" truncate title={acc.title}>
                        {acc.title}{" "}
                        {acc.isSubTask && (
                          <Text component="span" c="dimmed" size="10px">
                            (under {acc.parentTitle})
                          </Text>
                        )}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text size="xs" c="dimmed" fs="italic">
                  No items completed this month.
                </Text>
              )}
            </ScrollArea>
          </Box>

          <Textarea
            label="Monthly Summary"
            placeholder="Review your monthly progress..."
            minRows={4}
            value={summary}
            onChange={(e) => setSummary(e.currentTarget.value)}
            required
          />

          <Divider label="Signature" labelPosition="center" />

          <Box>
            <Text size="xs" fw={500} mb={4}>
              Draw your signature below:
            </Text>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <SignatureCanvas
                ref={signatureRef}
                penColor="#000000"
                canvasProps={{
                  width: 500,
                  height: 120,
                  className: "signature-canvas",
                  style: { width: "100%", height: "120px" },
                }}
              />
            </div>
            <Group justify="flex-end" mt={4}>
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                onClick={() => signatureRef.current?.clear()}
              >
                Clear
              </Button>
            </Group>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={handleSubmit}
              leftSection={<Send size={16} />}
              color="brand"
            >
              Submit Monthly Report
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
