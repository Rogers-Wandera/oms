"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Table,
  TextInput,
  ActionIcon,
  Modal,
  Checkbox,
  MultiSelect,
} from "@mantine/core";
import { Plus, Trash, Edit, Save } from "lucide-react";
// We'll need to create these actions
// import { getShifts, createShift, deleteShift } from "@/app/actions/shifts";

export function ShiftManagement() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShift, setCurrentShift] = useState({
    id: "",
    name: "",
    startTime: "08:00",
    endTime: "17:00",
    daysOfWeek: ["1", "2", "3", "4", "5"],
  });

  // Mock for now until actions are ready
  useEffect(() => {
    setShifts([
      {
        id: "1",
        name: "Morning Shift",
        startTime: "08:00",
        endTime: "17:00",
        daysOfWeek: "1,2,3,4,5",
      },
      {
        id: "2",
        name: "Evening Shift",
        startTime: "14:00",
        endTime: "22:00",
        daysOfWeek: "1,2,3,4,5",
      },
    ]);
  }, []);

  const handleSave = () => {
    // Save logic
    setOpened(false);
  };

  const daysOptions = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "0", label: "Sunday" },
  ];

  return (
    <Card withBorder radius="md" p="xl" mt="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={3}>Shift Management</Title>
            <Text size="sm" c="dimmed">
              Define working hour boundaries for employees.
            </Text>
          </div>
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => {
              setIsEditing(false);
              setCurrentShift({
                id: "",
                name: "",
                startTime: "08:00",
                endTime: "17:00",
                daysOfWeek: ["1", "2", "3", "4", "5"],
              });
              setOpened(true);
            }}
          >
            Add Shift
          </Button>
        </Group>

        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Shift Name</Table.Th>
              <Table.Th>Start Time</Table.Th>
              <Table.Th>End Time</Table.Th>
              <Table.Th>Working Days</Table.Th>
              <Table.Th align="right">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {shifts.map((shift) => (
              <Table.Tr key={shift.id}>
                <Table.Td fw={500}>{shift.name}</Table.Td>
                <Table.Td>{shift.startTime}</Table.Td>
                <Table.Td>{shift.endTime}</Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {shift.daysOfWeek
                      .split(",")
                      .map(
                        (d: string) =>
                          daysOptions.find((o) => o.value === d)?.label,
                      )
                      .join(", ")}
                  </Text>
                </Table.Td>
                <Table.Td align="right">
                  <Group justify="flex-end" gap="xs">
                    <ActionIcon variant="light" color="blue">
                      <Edit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red">
                      <Trash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={isEditing ? "Edit Shift" : "Create New Shift"}
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Shift Name"
            placeholder="e.g. Standard Morning"
            required
            value={currentShift.name}
            onChange={(e) =>
              setCurrentShift({ ...currentShift, name: e.target.value })
            }
          />
          <Group grow>
            <TextInput
              label="Start Time"
              type="time"
              required
              value={currentShift.startTime}
              onChange={(e) =>
                setCurrentShift({ ...currentShift, startTime: e.target.value })
              }
            />
            <TextInput
              label="End Time"
              type="time"
              required
              value={currentShift.endTime}
              onChange={(e) =>
                setCurrentShift({ ...currentShift, endTime: e.target.value })
              }
            />
          </Group>
          <MultiSelect
            label="Working Days"
            placeholder="Select days"
            data={daysOptions}
            value={currentShift.daysOfWeek}
            onChange={(val) =>
              setCurrentShift({ ...currentShift, daysOfWeek: val })
            }
          />
          <Button fullWidth mt="md" onClick={handleSave}>
            Save Shift
          </Button>
        </Stack>
      </Modal>
    </Card>
  );
}
