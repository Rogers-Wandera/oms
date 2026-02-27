"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  ActionIcon,
  Tooltip,
  Text,
  Stack,
  Group,
  Avatar,
  Badge,
  ScrollArea,
  Divider,
  Box,
} from "@mantine/core";
import { Monitor, Circle } from "lucide-react";
import { getOnlineUsers } from "@/app/actions/presence";
import { cn } from "@/lib/utils";

export function OnlineUsersMonitor() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOnlineUsers = async () => {
    try {
      const users = await getOnlineUsers();
      setOnlineUsers(users);
    } catch (error) {
      console.error("Failed to fetch online users:", error);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
    // Poll every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover width={300} position="bottom-end" shadow="md">
      <Popover.Target>
        <Tooltip label="Active Presence">
          <ActionIcon
            variant="light"
            color={onlineUsers.length > 0 ? "success" : "gray"}
            size="lg"
            className={cn(onlineUsers.length > 0 && "animate-pulse")}
          >
            <Monitor size={18} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box p="md">
          <Group justify="space-between">
            <Text fw={600} size="sm">
              Online Users
            </Text>
            <Badge
              color="success"
              variant="filled"
              size="sm"
              className="font-bold uppercase tracking-widest text-[10px]"
            >
              {onlineUsers.length} Online
            </Badge>
          </Group>
        </Box>

        <Divider />

        <ScrollArea h={300} p="xs">
          {onlineUsers.length === 0 ? (
            <Text size="xs" c="dimmed" ta="center" py="xl">
              No users currently online
            </Text>
          ) : (
            <Stack gap="xs">
              {onlineUsers.map((u) => (
                <Group
                  key={u.id}
                  justify="space-between"
                  wrap="nowrap"
                  className="p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Group gap="sm" wrap="nowrap">
                    <Avatar
                      size="sm"
                      radius="xl"
                      color="brand"
                      className="font-bold"
                    >
                      {u.firstName[0]}
                      {u.lastName[0]}
                    </Avatar>
                    <Box>
                      <Text
                        size="xs"
                        fw={700}
                        className="text-gray-900 dark:text-gray-200"
                      >
                        {u.firstName} {u.lastName}
                      </Text>
                      <Text
                        size="10px"
                        c="dimmed"
                        className="uppercase font-bold tracking-tighter"
                      >
                        {u.role}
                      </Text>
                    </Box>
                  </Group>
                  <Circle
                    size={10}
                    className="fill-success-500 text-success-500"
                  />
                </Group>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}
