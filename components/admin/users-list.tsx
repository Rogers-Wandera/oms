"use client";

import { useState } from "react";
import {
  Badge,
  Text,
  Group,
  ActionIcon,
  Menu,
  Stack,
  Avatar,
  Loader,
} from "@mantine/core";
import {
  MoreVertical,
  Shield,
  User,
  UserCog,
  Lock,
  Unlock,
  Clock,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  lockUser,
  unlockUser,
  invalidateAllUserSessions,
} from "@/app/actions/auth-audit";
import { disableTwoFactorForUser } from "@/app/actions/two-factor";
import { createNotification } from "@/app/actions/notifications";
import { DataTable } from "@/components/ui/data-table";
import { notifications } from "@mantine/notifications";
import { ExtendSessionModal } from "./extend-session-modal";

interface UserData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department_name: string | null;
  department_id: string | null;
  supervisor_name: string | null;
  supervisor_id: string | null;
  shift_name: string | null;
  shift_id: string | null;
  creation_date: string;
  is_locked: boolean;
  is_online: boolean;
  last_login?: string;
}

interface UsersListProps {
  users: UserData[];
  departments: any[];
  supervisors: any[];
  shifts: any[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  onEdit: (user: UserData) => void;
  onPageChange?: (page: number) => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  isLoading?: boolean;
}

export function UsersList({
  users,
  departments,
  supervisors,
  shifts,
  totalPages,
  currentPage,
  totalCount,
  onEdit,
  onPageChange,
  onSearchChange,
  searchValue,
  isLoading = false,
}: UsersListProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [extendingUser, setExtendingUser] = useState<UserData | null>(null);

  const handleLockUser = async (user: UserData) => {
    setLoadingAction(user.id);
    try {
      await lockUser(user.id, "Manually suspended by Admin");
      notifications.show({
        title: "Success",
        message: "User suspended",
        color: "success",
      });
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to suspend user",
        color: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnlockUser = async (user: UserData) => {
    setLoadingAction(user.id);
    try {
      await unlockUser(user.id);
      notifications.show({
        title: "Success",
        message: "User unlocked",
        color: "success",
      });
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to unlock user",
        color: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogOutUser = async (user: UserData) => {
    setLoadingAction(user.id);
    try {
      await invalidateAllUserSessions(user.id);
      notifications.show({
        title: "Success",
        message: "User force logged out",
        color: "success",
      });
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to log out user",
        color: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDisableTwoFactor = async (user: UserData) => {
    setLoadingAction(user.id);
    try {
      const result = await disableTwoFactorForUser(user.id);
      if (result.error) {
        notifications.show({
          title: "Error",
          message: result.error,
          color: "error",
        });
        return;
      }

      notifications.show({
        title: "Success",
        message: "Two-factor authentication disabled for user",
        color: "success",
      });
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to disable 2FA",
        color: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge
            variant="filled"
            color="brand"
            className="shadow-sm uppercase tracking-widest text-[10px]"
            leftSection={<Shield size={10} />}
          >
            Admin
          </Badge>
        );
      case "SUPERVISOR":
        return (
          <Badge
            color="brand"
            variant="light"
            className="uppercase tracking-widest text-[10px]"
            leftSection={<UserCog size={10} />}
          >
            Supervisor
          </Badge>
        );
      case "MANAGER":
        return (
          <Badge
            color="brand"
            variant="outline"
            className="uppercase tracking-widest text-[10px]"
            leftSection={<AlertCircle size={10} />}
          >
            Manager
          </Badge>
        );
      default:
        return (
          <Badge
            color="gray"
            variant="light"
            className="uppercase tracking-widest text-[10px]"
            leftSection={<User size={10} />}
          >
            User
          </Badge>
        );
    }
  };

  const columns = [
    {
      accessor: "name",
      title: "User",
      width: "25%",
      render: (user: UserData) => (
        <Group gap="sm" wrap="nowrap">
          <Avatar
            color="brand"
            radius="xl"
            size="sm"
            className="font-bold border border-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-400"
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </Avatar>
          <Stack gap={0}>
            <Text size="sm" fw={700} className="text-gray-900 dark:text-white">
              {user.name}
            </Text>
            <Text size="xs" className="text-gray-500 font-medium">
              {user.email}
            </Text>
          </Stack>
        </Group>
      ),
    },
    {
      accessor: "role",
      title: "Role & Dept",
      render: (user: UserData) => (
        <Stack gap={4}>
          <div className="flex">{getRoleBadge(user.role)}</div>
          <Text
            size="xs"
            className="text-gray-500 font-bold uppercase tracking-tight"
          >
            {user.department_name || "No Department"}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "shift",
      title: "Shift/Supervisor",
      render: (user: UserData) => (
        <Stack gap={4}>
          <Group
            gap={4}
            wrap="nowrap"
            className="text-gray-600 dark:text-gray-400"
          >
            <Clock size={12} className="text-brand-500" />
            <Text size="xs" fw={500}>
              {user.shift_name || "No Shift"}
            </Text>
          </Group>
          <Group
            gap={4}
            wrap="nowrap"
            className="text-gray-600 dark:text-gray-400"
          >
            <UserCog size={12} className="text-brand-500" />
            <Text size="xs" fw={500}>
              {user.supervisor_name || "No Supervisor"}
            </Text>
          </Group>
        </Stack>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      render: (user: UserData) => (
        <Group gap="xs">
          {user.is_online ? (
            <Badge
              color="success"
              variant="dot"
              size="sm"
              className="font-bold uppercase tracking-widest text-[9px]"
            >
              Online
            </Badge>
          ) : (
            <Badge
              color="gray"
              variant="dot"
              size="sm"
              className="font-bold uppercase tracking-widest text-[9px]"
            >
              Offline
            </Badge>
          )}
          {user.is_locked && (
            <Badge
              color="error"
              variant="filled"
              size="xs"
              className="rounded font-bold"
              leftSection={<Lock size={10} />}
            >
              Suspended
            </Badge>
          )}
        </Group>
      ),
    },
    {
      accessor: "last_login",
      title: "Last Active",
      render: (user: UserData) => (
        <Text size="xs" className="text-gray-500 font-medium italic">
          {user.last_login
            ? formatDistanceToNow(new Date(user.last_login), {
                addSuffix: true,
              })
            : "Never"}
        </Text>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 50,
      render: (user: UserData) => (
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              loading={loadingAction === user.id}
            >
              <MoreVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<User size={14} />}
              onClick={() => onEdit(user)}
            >
              Edit Details
            </Menu.Item>
            <Menu.Item
              leftSection={<Clock size={14} />}
              onClick={() => setExtendingUser(user)}
            >
              Extend Session
            </Menu.Item>

            <Menu.Divider />
            <Menu.Label>Security</Menu.Label>

            <Menu.Item
              leftSection={<LogOut size={14} />}
              color="orange"
              onClick={() => handleLogOutUser(user)}
            >
              Force Log Out
            </Menu.Item>

            <Menu.Item
              leftSection={<Shield size={14} />}
              color="yellow"
              onClick={() => handleDisableTwoFactor(user)}
            >
              Reset 2FA
            </Menu.Item>

            {user.is_locked ? (
              <Menu.Item
                color="green"
                leftSection={<Unlock size={14} />}
                onClick={() => handleUnlockUser(user)}
              >
                Unlock / Unsuspend
              </Menu.Item>
            ) : (
              <Menu.Item
                color="red"
                leftSection={<Lock size={14} />}
                onClick={() => handleLockUser(user)}
              >
                Suspend User
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <Stack gap="md">
      <DataTable
        data={users}
        columns={columns}
        searchable
        searchKeys={["name", "email"]}
        pagination
        defaultPageSize={10}
      />

      {extendingUser && (
        <ExtendSessionModal
          opened={!!extendingUser}
          onClose={() => setExtendingUser(null)}
          userId={extendingUser.id}
          userName={extendingUser.name}
        />
      )}
    </Stack>
  );
}
