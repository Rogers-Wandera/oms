"use client";

import React from "react";
import {
  Table,
  Text,
  Group,
  Button,
  Badge,
  Stack,
  Card,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { Check, X, Clock } from "lucide-react";
import { approveExtension, rejectExtension } from "@/app/actions/extensions";

interface Extension {
  id: string;
  date: string;
  extendedUntil: Date;
  reason: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ExtensionApprovalListProps {
  extensions: Extension[];
  adminId: string;
}

export function ExtensionApprovalList({
  extensions,
  adminId,
}: ExtensionApprovalListProps) {
  if (extensions.length === 0) {
    return (
      <Card withBorder py="xl">
        <Stack align="center" gap="xs">
          <Clock size={32} color="var(--mantine-color-gray-4)" />
          <Text c="dimmed">No pending time extension requests.</Text>
        </Stack>
      </Card>
    );
  }

  const handleApprove = async (id: string) => {
    await approveExtension(id, adminId);
  };

  const handleReject = async (id: string) => {
    await rejectExtension(id, adminId);
  };

  return (
    <Table verticalSpacing="sm" withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>User</Table.Th>
          <Table.Th>Date</Table.Th>
          <Table.Th>Extending Until</Table.Th>
          <Table.Th>Reason</Table.Th>
          <Table.Th align="right">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {extensions.map((ext) => (
          <Table.Tr key={ext.id}>
            <Table.Td fw={500}>
              {ext.user.firstName} {ext.user.lastName}
            </Table.Td>
            <Table.Td>{ext.date}</Table.Td>
            <Table.Td>
              <Badge variant="light" color="blue">
                {new Date(ext.extendedUntil).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Text size="sm" lineClamp={2}>
                {ext.reason}
              </Text>
            </Table.Td>
            <Table.Td align="right">
              <Group justify="flex-end" gap="xs">
                <Tooltip label="Approve">
                  <ActionIcon
                    color="green"
                    variant="light"
                    onClick={() => handleApprove(ext.id)}
                  >
                    <Check size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Reject">
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => handleReject(ext.id)}
                  >
                    <X size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
