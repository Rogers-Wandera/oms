"use client";

import { Card, Text, Group, Stack, Badge, ThemeIcon } from "@mantine/core";
import { AlertCircle, Calendar, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  date: string | null;
  status: string;
  assignee_name: string;
  creator_name: string;
}

interface TeamDueTasksProps {
  tasks: Task[];
}

export function TeamDueTasks({ tasks }: TeamDueTasksProps) {
  return (
    <Card withBorder padding="md" radius="md" className="premium-card">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="red" variant="light">
              <AlertCircle size={16} />
            </ThemeIcon>
            <Text fw={700}>Urgent Team Tasks</Text>
          </Group>
          <Badge color="red" variant="filled">
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </Badge>
        </Group>

        <div className="space-y-3">
          {tasks.map((task) => {
            const isOverdue = task.date && new Date(task.date) < new Date();

            return (
              <Card
                key={task.id}
                withBorder
                padding="xs"
                radius="sm"
                bg="var(--mantine-color-gray-0)"
              >
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text size="sm" fw={600} truncate>
                      {task.title}
                    </Text>
                    <Group gap="xs">
                      <Group gap={4}>
                        <User size={12} className="text-muted-foreground" />
                        <Text size="xs" c="dimmed">
                          {task.assignee_name}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <Calendar size={12} className="text-muted-foreground" />
                        <Text
                          size="xs"
                          c={isOverdue ? "red.7" : "dimmed"}
                          fw={isOverdue ? 700 : 400}
                        >
                          {task.date
                            ? new Date(task.date).toLocaleDateString()
                            : "No date"}
                        </Text>
                      </Group>
                    </Group>
                  </Stack>
                  <Badge
                    variant="outline"
                    size="sm"
                    color={task.status === "DONE" ? "green" : "blue"}
                  >
                    {task.status}
                  </Badge>
                </Group>
              </Card>
            );
          })}
        </div>
      </Stack>
    </Card>
  );
}
