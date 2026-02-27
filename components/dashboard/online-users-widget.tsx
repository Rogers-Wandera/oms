"use client";

import { useEffect, useState } from "react";
import {
  Group,
  Text,
  Avatar,
  Stack,
  Badge,
  ScrollArea,
  Skeleton,
  Indicator,
  Box,
} from "@mantine/core";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Clock } from "lucide-react";
import { getOnlineUsers } from "@/app/actions/presence";

export function OnlineUsersWidget() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await getOnlineUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const [page, setPage] = useState(1);

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="pt-6">
          <Skeleton h={300} />
        </CardContent>
      </Card>
    );
  }

  const pageSize = 6;
  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="premium-card h-full">
      <CardContent className="pt-6">
        <Group justify="space-between" mb="xl">
          <Group gap="xs">
            {/* Replaced Monitor icon with new div containing Clock icon */}
            <div className="p-2 rounded-xl bg-brand-500/15 border border-brand-500/30 shadow-sm shadow-brand-500/10">
              <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Active Presence
            </h4>
          </Group>
          <Badge
            color="success"
            variant="filled"
            className="h-6 rounded-lg uppercase tracking-widest text-[10px] shadow-sm shadow-success-500/20"
          >
            {users.length} ONLINE
          </Badge>
        </Group>

        <ScrollArea h={300} offsetScrollbars>
          {users.length === 0 ? (
            <Box ta="center" py="xl">
              <Text size="sm" className="text-gray-500">
                No active users
              </Text>
            </Box>
          ) : (
            <Stack gap="md">
              {paginatedUsers.map((u) => (
                <Group
                  key={u.id}
                  justify="space-between"
                  wrap="nowrap"
                  className="p-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/5 hover:bg-gray-50 dark:hover:bg-white/2 transition-all"
                >
                  <Group gap="sm" wrap="nowrap">
                    <Indicator
                      color="green"
                      size={8}
                      offset={2}
                      position="bottom-end"
                      withBorder
                    >
                      <Avatar
                        size="md"
                        radius="lg"
                        className="bg-brand-500 text-white font-bold border-2 border-white dark:border-gray-900 shadow-sm"
                      >
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </Avatar>
                    </Indicator>
                    <Stack gap={0}>
                      <Text
                        size="sm"
                        fw={600}
                        className="text-gray-900 dark:text-gray-200"
                      >
                        {u.firstName} {u.lastName}
                      </Text>
                      <Text size="xs" className="text-gray-500 font-medium">
                        {u.role}
                      </Text>
                    </Stack>
                  </Group>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                    <Text
                      size="10px"
                      className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter"
                    >
                      Active Now
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          )}
        </ScrollArea>

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Text size="xs" className="text-gray-400 dark:text-gray-500">
              Page {page} of {totalPages}
            </Text>
            <Group gap={5}>
              <Text
                size="xs"
                className={`cursor-pointer ${page === 1 ? "text-gray-300 dark:text-gray-700 opacity-50" : "text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300"}`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Text>
              <Text size="xs" className="text-gray-300 dark:text-gray-600">
                |
              </Text>
              <Text
                size="xs"
                className={`cursor-pointer ${page === totalPages ? "text-gray-300 dark:text-gray-700 opacity-50" : "text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300"}`}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Text>
            </Group>
          </Group>
        )}
      </CardContent>
    </Card>
  );
}
