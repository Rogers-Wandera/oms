"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  RingProgress,
  Text,
  Group,
  Stack,
  SimpleGrid,
  Badge,
} from "@mantine/core";
import { Clock, TrendingUp } from "lucide-react";

interface HoursAnalyticsProps {
  workedHours: number;
  expectedHours: number;
}

export function HoursAnalytics({
  workedHours,
  expectedHours,
}: HoursAnalyticsProps) {
  const percentage = Math.min(
    Math.round((workedHours / expectedHours) * 100),
    100,
  );
  const isOvertime = workedHours > expectedHours;
  const overtimeHours = workedHours - expectedHours;

  return (
    <Card className="premium-card">
      <CardContent className="pt-6">
        <Stack gap="lg">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
              Weekly Work Progress
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              Monitor your contributions against the weekly target
            </p>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            <Group justify="center" className="relative">
              <div className="absolute inset-0 bg-brand-500/5 dark:bg-brand-500/5 blur-3xl rounded-full" />
              <RingProgress
                size={140}
                thickness={14}
                roundCaps
                sections={[
                  { value: percentage, color: isOvertime ? "orange" : "brand" },
                ]}
                label={
                  <Text
                    ta="center"
                    fw={800}
                    size="xl"
                    className="text-gray-900 dark:text-white"
                  >
                    {percentage}%
                  </Text>
                }
              />
            </Group>

            <Stack gap="md" justify="center">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                <Group gap="xs">
                  <div className="p-1.5 rounded-lg bg-brand-500/10">
                    <Clock
                      size={18}
                      className="text-brand-600 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Worked Hours
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {workedHours} hrs
                    </p>
                  </div>
                </Group>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                <Group gap="xs">
                  <div className="p-1.5 rounded-lg bg-gray-500/10">
                    <TrendingUp
                      size={18}
                      className="text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Weekly Target
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {expectedHours} hrs
                    </p>
                  </div>
                </Group>
              </div>

              {isOvertime && (
                <Badge
                  color="orange"
                  size="md"
                  variant="light"
                  className="h-9 rounded-lg"
                >
                  Overtime tracked: +{overtimeHours.toFixed(1)} hrs
                </Badge>
              )}
            </Stack>
          </SimpleGrid>
        </Stack>
      </CardContent>
    </Card>
  );
}
