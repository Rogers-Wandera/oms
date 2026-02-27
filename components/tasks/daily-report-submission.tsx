"use client";

import { useState, useRef } from "react";
import {
  Button,
  Modal,
  Textarea,
  Title,
  Text,
  Stack,
  Group,
  Card,
  List,
  ThemeIcon,
  Badge,
  Center,
} from "@mantine/core";
import { Check, Send, PenTool } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { createReport } from "@/app/actions/reports";
import { notifications } from "@mantine/notifications";

interface DailyReportSubmissionProps {
  tasks: any[];
  userId: string;
  existingReport?: any;
  userSignature?: string | null;
}

export function DailyReportSubmission({
  tasks,
  userId,
  existingReport,
  userSignature,
}: DailyReportSubmissionProps) {
  const [opened, setOpened] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  // Auto-fill signature if available when modal opens
  const handleOpen = () => {
    setOpened(true);
    if (userSignature) {
      setTimeout(() => {
        if (signatureRef.current) {
          signatureRef.current.fromDataURL(userSignature);
        }
      }, 100);
    }
  };

  // Filter tasks and subtasks done today
  const today = new Date().toISOString().split("T")[0];

  const completedTasksToday = tasks.filter((t) => {
    if (!t.completedAt) return false;
    return t.completedAt.split("T")[0] === today;
  });

  const completedSubTasksToday = tasks.flatMap((t) =>
    (t.subTasks || [])
      .filter((st: any) => {
        if (!st.completedAt) return false;
        return new Date(st.completedAt).toISOString().split("T")[0] === today;
      })
      .map((st: any) => ({
        ...st,
        parentTaskTitle: t.title,
      })),
  );

  const allAccomplishments = [
    ...completedTasksToday.map((t) => ({
      id: t.id,
      title: t.title,
      type: "TASK",
    })),
    ...completedSubTasksToday.map((st) => ({
      id: st.id,
      title: `${st.title} (Sub-task of ${st.parentTaskTitle})`,
      type: "SUB_TASK",
    })),
  ];

  const handleSubmit = async () => {
    const isSignatureEmpty = signatureRef.current?.isEmpty();

    if (isSignatureEmpty && !userSignature) {
      notifications.show({
        title: "Signature Required",
        message: "Please sign before submitting",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    try {
      const signatureData = signatureRef.current
        ?.getTrimmedCanvas()
        .toDataURL("image/png");

      await createReport({
        userId,
        content: comment,
        reportDate: today,
        signatureUrl: signatureData,
        accomplishments: allAccomplishments,
      });

      notifications.show({
        title: "Report Submitted",
        message: "Your daily report has been successfully recorded.",
        color: "success",
      });
      setOpened(false);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to submit report",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        leftSection={<Send size={16} />}
        color="success"
        onClick={handleOpen}
        disabled={!!existingReport}
        className="shadow-md shadow-success-500/20"
      >
        {existingReport ? "Daily Report Submitted" : "Submit Daily Report"}
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Daily Report Submission"
        size="lg"
      >
        <Stack gap="md">
          <Card
            withBorder
            padding="md"
            radius="xl"
            className="premium-card bg-brand-500/5 border-brand-500/10"
          >
            <Group justify="space-between" mb="xs">
              <Title order={5} className="gradient-text">
                Today's Accomplishments
              </Title>
              <Badge color="success" variant="light">
                {allAccomplishments.length} Items Done
              </Badge>
            </Group>

            {allAccomplishments.length > 0 ? (
              <Stack gap="xs">
                {allAccomplishments.map((item) => (
                  <Group key={item.id} wrap="nowrap" gap="sm">
                    <ThemeIcon
                      color={item.type === "TASK" ? "success" : "brand"}
                      size={24}
                      radius="xl"
                      variant="light"
                    >
                      <Check size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={600}>
                        {item.title}
                      </Text>
                      <Text
                        size="10px"
                        c="dimmed"
                        className="uppercase tracking-tighter"
                      >
                        {item.type === "TASK"
                          ? "Main Task"
                          : "Sub-task Completion"}
                      </Text>
                    </div>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>
                    No tasks marked as completed today.
                  </Text>
                  <Text size="xs" c="dimmed">
                    Complete your tasks first to see them here!
                  </Text>
                </Stack>
              </Center>
            )}
          </Card>

          <Textarea
            label="Additional Comments"
            placeholder="Anything else you want to note?"
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            rows={4}
          />

          <Stack gap={5}>
            <Text
              size="sm"
              fw={800}
              className="uppercase tracking-widest text-gray-500"
            >
              Digital Signature
            </Text>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden backdrop-blur-sm">
              <SignatureCanvas
                ref={signatureRef}
                penColor={
                  typeof window !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                    ? "#ffffff"
                    : "#000000"
                }
                canvasProps={{
                  width: 500,
                  height: 150,
                  className: "signature-canvas",
                  style: { width: "100%", height: "150px" },
                }}
              />
            </div>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Use your mouse or touch screen to sign above.
              </Text>
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                onClick={() => signatureRef.current?.clear()}
              >
                Clear Signature
              </Button>
            </Group>
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button
              color="success"
              loading={loading}
              onClick={handleSubmit}
              leftSection={<Check size={16} />}
            >
              Confirm & Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
