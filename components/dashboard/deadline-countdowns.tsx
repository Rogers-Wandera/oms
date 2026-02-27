"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Text, Stack, Group, RingProgress, Center } from "@mantine/core";
import { Timer, CalendarClock } from "lucide-react";

interface DeadlineCountdownsProps {
  user: any;
}

export function DeadlineCountdowns({ user }: DeadlineCountdownsProps) {
  const [weeklyTime, setWeeklyTime] = useState("");
  const [monthlyTime, setMonthlyTime] = useState("");
  const [weeklyPercent, setWeeklyPercent] = useState(0);
  const [monthlyPercent, setMonthlyPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      // Weekly Deadline: Next Friday at 5 PM
      const nextFriday = new Date(now);
      nextFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
      nextFriday.setHours(17, 0, 0, 0);
      if (nextFriday < now) nextFriday.setDate(nextFriday.getDate() + 7);

      const weeklyDiff = nextFriday.getTime() - now.getTime();
      setWeeklyTime(formatDiff(weeklyDiff));
      setWeeklyPercent(
        Math.max(0, 100 - (weeklyDiff / (7 * 24 * 60 * 60 * 1000)) * 100),
      );

      // Monthly Deadline: Next User Month End Day at Midnight
      const monthEndDay = user.monthEndDay || 30;
      let nextMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        monthEndDay,
        0,
        0,
        0,
      );
      if (nextMonthEnd < now) {
        nextMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          monthEndDay,
          0,
          0,
          0,
        );
      }
      // Handle non-existent days in month
      const actualLastDay = new Date(
        nextMonthEnd.getFullYear(),
        nextMonthEnd.getMonth() + 1,
        0,
      ).getDate();
      if (monthEndDay > actualLastDay) {
        nextMonthEnd.setDate(actualLastDay);
      }

      const monthlyDiff = nextMonthEnd.getTime() - now.getTime();
      setMonthlyTime(formatDiff(monthlyDiff));
      setMonthlyPercent(
        Math.max(0, 100 - (monthlyDiff / (30 * 24 * 60 * 60 * 1000)) * 100),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [user.monthEndDay]);

  const formatDiff = (diff: number) => {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="premium-card group">
        <CardContent className="pt-6">
          <Group justify="space-between" align="center" className="relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Stack gap={0}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Weekly Report Deadline
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
                {weeklyTime}
              </h3>
              <p className="text-xs font-medium text-gray-500 mt-1">
                Every Friday @ 5:00 PM
              </p>
            </Stack>
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-brand-500/5 blur-xl rounded-full" />
              <RingProgress
                size={90}
                roundCaps
                thickness={8}
                sections={[{ value: weeklyPercent, color: "brand" }]}
                label={
                  <Center>
                    <Timer
                      size={22}
                      className="text-brand-600 dark:text-brand-400"
                    />
                  </Center>
                }
              />
            </div>
          </Group>
        </CardContent>
      </Card>

      <Card className="premium-card group">
        <CardContent className="pt-6">
          <Group justify="space-between" align="center" className="relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-success-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Stack gap={0}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Monthly Report Deadline
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
                {monthlyTime}
              </h3>
              <p className="text-xs font-medium text-gray-500 mt-1">
                Target Day: {user.monthEndDay || 30}
              </p>
            </Stack>
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-success-500/5 blur-xl rounded-full" />
              <RingProgress
                size={90}
                roundCaps
                thickness={8}
                sections={[{ value: monthlyPercent, color: "success" }]}
                label={
                  <Center>
                    <CalendarClock
                      size={22}
                      className="text-success-600 dark:text-success-400"
                    />
                  </Center>
                }
              />
            </div>
          </Group>
        </CardContent>
      </Card>
    </div>
  );
}
