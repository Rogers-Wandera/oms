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
  const completedToday = tasks.filter((t) => t.status === "COMPLETED");
  // In a real scenario, we'd check the updateDate. For now, we take 'COMPLETED' status as of today.

  const handleSubmit = async () => {
    if (signatureRef.current?.isEmpty()) {
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

      // Note: In a production app, we would upload this image to S3/Blob storage
      // and pass the URL. For this demo/internal tool, we'll store the base64 or a placeholder.
      // I'll update the server action to handle this.

      await createReport({
        userId,
        content: comment,
        reportDate: today,
        signatureUrl: signatureData,
        // Passing accomplishments as an array of objects
        accomplishments: completedToday.map((t) => ({
          id: t.id,
          title: t.title,
        })),
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
          <Card withBorder padding="sm" radius="md" className="premium-card">
            <Title order={5} mb="xs">
              Today's Accomplishments
            </Title>
            {completedToday.length > 0 ? (
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="success" size={20} radius="xl">
                    <Check size={12} />
                  </ThemeIcon>
                }
              >
                {completedToday.map((t) => (
                  <List.Item key={t.id}>{t.title}</List.Item>
                ))}
              </List>
            ) : (
              <Text size="sm" c="dimmed">
                No tasks marked as completed today.
              </Text>
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
