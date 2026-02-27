"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  ActionIcon,
  Indicator,
  Stack,
  Text,
  ScrollArea,
  UnstyledButton,
  Group,
  Box,
  Badge,
  Divider,
  Button,
} from "@mantine/core";
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
} from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [data, count] = await Promise.all([
        getNotifications(userId),
        getUnreadNotificationCount(userId),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 60 seconds (basic real-time)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = async (id: string, link?: string) => {
    await markAsRead(id);
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    if (link) {
      router.push(link);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TASK":
        return <Info size={16} className="text-brand-500" />;
      case "REPORT":
        return <CheckCircle size={16} className="text-success-500" />;
      case "SECURITY":
        return <AlertTriangle size={16} className="text-error-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  return (
    <Popover width={400} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <Indicator
          label={unreadCount > 9 ? "9+" : unreadCount}
          size={16}
          disabled={unreadCount === 0}
          offset={2}
          color="brand"
        >
          <ActionIcon variant="subtle" color="gray" size="lg">
            <Bell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box p="md">
          <Group justify="space-between">
            <Text fw={600} size="sm">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <UnstyledButton onClick={handleMarkAllAsRead}>
                <Text
                  size="xs"
                  color="brand"
                  fw={700}
                  className="hover:underline"
                >
                  Mark all as read
                </Text>
              </UnstyledButton>
            )}
          </Group>
        </Box>

        <Divider />

        <ScrollArea h={350} scrollbars="y">
          {notifications.length === 0 ? (
            <Stack align="center" justify="center" p="xl" h={300} gap="xs">
              <Bell size={32} opacity={0.2} />
              <Text size="sm" c="dimmed">
                No notifications yet
              </Text>
            </Stack>
          ) : (
            <Stack gap={0}>
              {notifications.map((n) => (
                <UnstyledButton
                  key={n.id}
                  p="md"
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  className={cn(
                    "transition-colors border-b border-gray-100 dark:border-white/5",
                    n.isRead
                      ? "bg-transparent"
                      : "bg-brand-500/5 dark:bg-brand-500/10",
                  )}
                >
                  <Group align="flex-start" wrap="nowrap">
                    <Box mt={2}>{getIcon(n.type)}</Box>
                    <Box style={{ flex: 1 }}>
                      <Text
                        size="sm"
                        fw={n.isRead ? 600 : 800}
                        className={cn(
                          n.isRead
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-900 dark:text-white",
                        )}
                      >
                        {n.title}
                      </Text>
                      <Text
                        size="xs"
                        c="dimmed"
                        lineClamp={2}
                        className="font-medium"
                      >
                        {n.message}
                      </Text>
                      <Text size="xs" c="dimmed" mt={4} className="italic">
                        {formatDistanceToNow(new Date(n.creationDate), {
                          addSuffix: true,
                        })}
                      </Text>
                    </Box>
                    {!n.isRead && (
                      <Badge
                        color="brand"
                        variant="filled"
                        size="xs"
                        circle
                        p={0}
                        h={8}
                        w={8}
                        className="animate-pulse shadow-sm shadow-brand-500/50"
                      />
                    )}
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </ScrollArea>

        <Divider />

        <Box p="xs" ta="center">
          <Button variant="subtle" size="xs" fullWidth disabled>
            View all notifications
          </Button>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}
