"use client";

import { useState } from "react";
import {
  Modal,
  Stack,
  NumberInput,
  Button,
  Text,
  Group,
  TextInput,
} from "@mantine/core";
import { Clock } from "lucide-react";

interface ExtendSessionModalProps {
  opened: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function ExtendSessionModal({
  opened,
  onClose,
  userId,
  userName,
}: ExtendSessionModalProps) {
  const [hours, setHours] = useState<number | string>(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExtend = async () => {
    setLoading(true);
    // Mocking the extension action - in a real app this would call a server action
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Clock size={18} />
          <Text fw={700}>Extend Session: {userName}</Text>
        </Group>
      }
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          Granting a time extension allows this user to continue working beyond
          their scheduled shift or after having clocked out.
        </Text>

        <NumberInput
          label="Extension Duration (Hours)"
          value={hours}
          onChange={setHours}
          min={0.5}
          max={12}
          step={0.5}
          required
        />

        <TextInput
          label="Reason for Extension"
          placeholder="e.g. Overtime for deadline, shift swapping"
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExtend} loading={loading}>
            Apply Extension
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
