"use client";

import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Table,
} from "@mantine/core";
import { Clock, MapPin, User, LogIn, LogOut } from "lucide-react";

interface AttendanceRecord {
  clockIn: Date | null;
  clockOut: Date | null;
  latIn: string | null;
  longIn: string | null;
  latOut: string | null;
  longOut: string | null;
}

interface Member {
  id: string;
  name: string;
  email: string;
  attendance: AttendanceRecord | null;
}

interface TeamAttendanceProps {
  members: Member[];
}

export function TeamAttendance({ members }: TeamAttendanceProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (lat: string | null, long: string | null) => {
    if (!lat || !long) return "Not available";
    return `${parseFloat(lat).toFixed(3)}, ${parseFloat(long).toFixed(3)}`;
  };

  return (
    <Card withBorder padding="md" radius="md" className="premium-card">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="brand" variant="light">
              <Clock size={16} />
            </ThemeIcon>
            <Text fw={700}>Today's Team Attendance</Text>
          </Group>
          <Badge variant="light" color="brand">
            {members.filter((m) => m.attendance?.clockIn).length} /{" "}
            {members.length} Present
          </Badge>
        </Group>

        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Member</Table.Th>
              <Table.Th>Clock In</Table.Th>
              <Table.Th>Clock Out</Table.Th>
              <Table.Th>Location (In)</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {members.map((member) => (
              <Table.Tr key={member.id}>
                <Table.Td>
                  <Group gap="sm">
                    <User size={14} className="text-muted-foreground" />
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>
                        {member.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {member.email}
                      </Text>
                    </Stack>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <LogIn size={12} className="text-green-500" />
                    <Text size="sm">
                      {formatTime(member.attendance?.clockIn || null)}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <LogOut size={12} className="text-blue-500" />
                    <Text size="sm">
                      {formatTime(member.attendance?.clockOut || null)}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <MapPin size={12} className="text-muted-foreground" />
                    <Text size="xs" c="dimmed">
                      {formatLocation(
                        member.attendance?.latIn || null,
                        member.attendance?.longIn || null,
                      )}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {member.attendance?.clockIn ? (
                    <Badge color="green" variant="dot" size="sm">
                      Present
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="dot" size="sm">
                      Absent
                    </Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}
