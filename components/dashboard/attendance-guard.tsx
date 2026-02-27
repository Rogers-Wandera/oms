"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Card,
  Container,
  Title,
  Text,
  Button,
  Stack,
  Center,
} from "@mantine/core";
import { Clock, LogIn } from "lucide-react";
import { AttendanceCard } from "./attendance-card";

interface AttendanceGuardProps {
  children: React.ReactNode;
  user: any;
  attendanceBase: any;
  accessAllowed: boolean;
  reason?: string;
  twoFactorSetupRequired?: boolean;
}

export function AttendanceGuard({
  children,
  user,
  attendanceBase,
  accessAllowed,
  reason,
  twoFactorSetupRequired,
}: AttendanceGuardProps) {
  const pathname = usePathname();

  if (twoFactorSetupRequired && !pathname.startsWith("/dashboard/profile")) {
    return (
      <Container size="sm" py={100}>
        <Center>
          <Stack gap="xl" align="center" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                backgroundColor: "var(--mantine-color-red-light)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogIn size={40} color="var(--mantine-color-red-filled)" />
            </div>

            <div>
              <Title order={2}>Two-Factor Setup Required</Title>
              <Text c="dimmed" mt="sm">
                Admin access requires an authenticator app. Complete setup to
                continue.
              </Text>
            </div>

            <Button
              color="brand"
              size="md"
              onClick={() => (window.location.href = "/dashboard/profile")}
            >
              Go to Profile Setup
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (accessAllowed) {
    return <>{children}</>;
  }

  // 3. Otherwise, block everything except the dashboard (where they can clock in)
  // Or simply show an overlay if they are not on the clock-in route
  // The user said "not allow them to do anything until they clock in"

  return (
    <Container size="sm" py={100}>
      <Center>
        <Stack gap="xl" align="center" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: "var(--mantine-color-blue-light)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={40} color="var(--mantine-color-blue-filled)" />
          </div>

          <div>
            <Title order={2}>Access Restricted</Title>
            <Text c="dimmed" mt="sm">
              {reason === "NOT_CLOCKED_IN" &&
                "Please clock in to access the system and manage your tasks."}
              {reason === "CLOCKED_OUT" &&
                "You have already clocked out for today. System access is restricted until tomorrow."}
              {!reason && "Access to this area is restricted."}
            </Text>
          </div>

          {reason === "NOT_CLOCKED_IN" && (
            <Card withBorder padding="xl" radius="md" shadow="sm" w="100%">
              <AttendanceCard attendance={attendanceBase} userId={user.id} />
            </Card>
          )}

          {reason === "CLOCKED_OUT" && (
            <Text size="sm" c="red" fw={500}>
              Contact your administrator if you need a time extension.
            </Text>
          )}
        </Stack>
      </Center>
    </Container>
  );
}
