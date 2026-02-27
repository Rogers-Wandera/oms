"use client";

import { Card, Text, Group, Stack, Progress, SimpleGrid } from "@mantine/core";
import { Clock, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

interface SubTaskSLAPerformanceProps {
  stats: {
    avgCompletionTimeMins: number;
    avgDelayMins: number;
    onTimePercentage: number;
    totalCompleted: number;
    overdueCount: number;
  };
}

export function SubTaskSLAPerformance({ stats }: SubTaskSLAPerformanceProps) {
  const formatTime = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = Math.round(totalMins % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <Stack gap="md">
      <Group gap="xs">
        <BarChart3 size={20} className="text-brand-500" />
        <Text fw={700} size="lg">
          Sub-Task SLA Performance
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Card withBorder padding="md" radius="lg" className="premium-card">
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={700}>
                AVG. RESOLUTION
              </Text>
              <Clock size={14} className="text-brand-500" />
            </Group>
            <Text size="xl" fw={800}>
              {formatTime(stats.avgCompletionTimeMins)}
            </Text>
          </Stack>
        </Card>

        <Card withBorder padding="md" radius="lg" className="premium-card">
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={700}>
                ON-TIME RATE
              </Text>
              <CheckCircle2 size={14} className="text-success-500" />
            </Group>
            <Text size="xl" fw={800} c="success.7">
              {stats.onTimePercentage}%
            </Text>
            <Progress
              value={stats.onTimePercentage}
              size="xs"
              color="success"
              radius="xl"
            />
          </Stack>
        </Card>

        <Card withBorder padding="md" radius="lg" className="premium-card">
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={700}>
                TOTAL COMPLETED
              </Text>
              <div className="p-1 rounded bg-gray-100 dark:bg-white/5">
                <CheckCircle2 size={10} />
              </div>
            </Group>
            <Text size="xl" fw={800}>
              {stats.totalCompleted}
            </Text>
          </Stack>
        </Card>

        <Card withBorder padding="md" radius="lg" className="premium-card">
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={700}>
                CURRENT OVERDUE
              </Text>
              <AlertCircle size={14} className="text-error-500" />
            </Group>
            <Text size="xl" fw={800} c="error.7">
              {stats.overdueCount}
            </Text>
          </Stack>
        </Card>

        <Card
          withBorder
          padding="md"
          radius="lg"
          className={`premium-card ${stats.avgDelayMins > 0 ? "border-red-500/20 bg-red-500/5" : ""}`}
        >
          <Stack gap={4}>
            <Group justify="space-between">
              <Text
                size="xs"
                c={stats.avgDelayMins > 0 ? "red.7" : "dimmed"}
                fw={700}
              >
                AVG. DELAY (TIME LOST)
              </Text>
              <Clock
                size={14}
                className={
                  stats.avgDelayMins > 0 ? "text-red-500" : "text-brand-500"
                }
              />
            </Group>
            <Text
              size="xl"
              fw={800}
              c={stats.avgDelayMins > 0 ? "red.8" : "inherit"}
            >
              {formatTime(stats.avgDelayMins)}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
