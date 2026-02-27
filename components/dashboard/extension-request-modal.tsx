"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  Stack,
  Textarea,
  Title,
  Text,
  Group,
  TextInput,
} from "@mantine/core";
import { Clock, Send } from "lucide-react";
import { requestExtension } from "@/app/actions/extensions";
import { TimeInput } from "@mantine/dates";

interface ExtensionRequestModalProps {
  opened: boolean;
  onClose: () => void;
  userId: string;
}

export function ExtensionRequestModal({
  opened,
  onClose,
  userId,
}: ExtensionRequestModalProps) {
  const [reason, setReason] = useState("");
  const [extendedUntil, setExtendedUntil] = useState("18:00");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);

    try {
      // Create a Date object for today with the selected time
      const [hours, minutes] = extendedUntil.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      await requestExtension({
        userId,
        extendedUntil: date,
        reason,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Request Time Extension"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Need more time to complete your tasks? Request an extension from your
          supervisor.
        </Text>

        <TextInput
          label="Extend Access Until"
          type="time"
          required
          value={extendedUntil}
          onChange={(e) => setExtendedUntil(e.target.value)}
        />

        <Textarea
          label="Reason for Extension"
          placeholder="I need to finish the monthly report reviews..."
          required
          minRows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            leftSection={<Send size={16} />}
            loading={loading}
            onClick={handleSubmit}
            disabled={!reason}
          >
            Submit Request
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
