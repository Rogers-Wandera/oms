"use client";

import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Progress,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  AlertCircle,
} from "lucide-react";

interface UserAnalysisCardProps {
  accomplishments: any[];
  userName: string;
}

export function UserAnalysisCard({
  accomplishments,
  userName,
}: UserAnalysisCardProps) {
  // Simple "intelligence" logic based on accomplishments
  const total = accomplishments.length;
  const subTasksCount = accomplishments.filter((a) => a.isSubTask).length;
  const mainTasksCount = total - subTasksCount;

  // Predict a performance "score" or "label"
  let performanceLabel = "Steady Progress";
  let performanceColor = "blue";
  let icon = <Zap size={14} />;

  if (total > 5) {
    performanceLabel = "High Productivity";
    performanceColor = "green";
    icon = <TrendingUp size={14} />;
  } else if (total === 0) {
    performanceLabel = "Attention Required";
    performanceColor = "red";
    icon = <AlertCircle size={14} />;
  }

  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      bg="var(--mantine-color-brand-light)"
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={700} c="brand.8">
            Performance Analysis: {userName}
          </Text>
          <Badge color={performanceColor} variant="filled" leftSection={icon}>
            {performanceLabel}
          </Badge>
        </Group>

        <Text size="xs" c="dimmed">
          Automated insights based on today's submission data and completion
          patterns.
        </Text>

        <Group grow mt="xs">
          <Stack gap={2}>
            <Text size="10px" fw={700} c="dimmed" className="uppercase">
              Focus Area
            </Text>
            <Text size="sm" fw={600}>
              {subTasksCount > mainTasksCount
                ? "Granular Execution"
                : "Project Milestones"}
            </Text>
          </Stack>
          <Stack gap={2}>
            <Text size="10px" fw={700} c="dimmed" className="uppercase">
              Volume
            </Text>
            <Text size="sm" fw={600}>
              {total} Items Done
            </Text>
          </Stack>
        </Group>

        <Divider my={4} opacity={0.5} />

        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" fw={700}>
              Completion Balance
            </Text>
            <Text size="xs" c="dimmed">
              {Math.round((mainTasksCount / total) * 100 || 0)}% Main Tasks
            </Text>
          </Group>
          <Progress
            value={(mainTasksCount / total) * 100}
            size="sm"
            radius="xl"
            color="brand"
          />
        </Stack>
      </Stack>
    </Card>
  );
}
