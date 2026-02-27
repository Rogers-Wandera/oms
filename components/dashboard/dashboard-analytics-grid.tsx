"use client";

import { Grid, Stack } from "@mantine/core";
import { HoursAnalytics } from "./hours-analytics";
import { StatsCards } from "./stats-cards";
import { OnlineUsersWidget } from "./online-users-widget";
import { RecentActivity } from "./recent-activity";

interface DashboardAnalyticsGridProps {
  stats: any;
  recentActivity: any;
  showOnlineWidget: boolean;
}

export function DashboardAnalyticsGrid({
  stats,
  recentActivity,
  showOnlineWidget,
}: DashboardAnalyticsGridProps) {
  return (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack gap="lg">
          <HoursAnalytics workedHours={stats.weeklyHours} expectedHours={45} />
          <StatsCards stats={stats} />
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="lg">
          {showOnlineWidget && <OnlineUsersWidget />}
          <RecentActivity activities={recentActivity} />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
