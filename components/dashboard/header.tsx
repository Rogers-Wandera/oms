"use client";

import {
  ActionIcon,
  Avatar,
  Group,
  Menu,
  Text,
  Tooltip,
  Box,
  UnstyledButton,
} from "@mantine/core";
import {
  LogOut,
  Settings,
  User,
  Monitor,
  MoreHorizontal,
  Menu as MenuIcon,
  ChevronDown,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { NotificationCenter } from "./notification-center";
import { OnlineUsersMonitor } from "./online-users-monitor";
import { PreferencesDrawer } from "./preferences-drawer";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import {
  userNavItems,
  supervisorNavItems,
  managerNavItems,
  adminNavItems,
} from "@/lib/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Drawer, Stack, Burger } from "@mantine/core";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    settings?: any;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [preferencesOpened, setPreferencesOpened] = useState(false);
  const [mobileNavOpened, setMobileNavOpened] = useState(false);
  const { layout } = useSettings();
  const pathname = usePathname();

  const isSupervisor = user.role === "SUPERVISOR" || user.role === "ADMIN";
  const isManager = user.role === "MANAGER" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase() || "U";

  const allNavItems = [
    ...userNavItems,
    ...(isSupervisor ? supervisorNavItems : []),
    ...(isManager ? managerNavItems : []),
    ...(isAdmin ? adminNavItems : []),
  ];

  const DESKTOP_LIMIT = 5;
  const visibleItems = allNavItems.slice(0, DESKTOP_LIMIT);
  const overflowItems = allNavItems.slice(DESKTOP_LIMIT);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          {layout === "horizontal" && (
            <Burger
              opened={mobileNavOpened}
              onClick={() => setMobileNavOpened(true)}
              hiddenFrom="lg"
              size="sm"
            />
          )}
          <Text fw={700} size="lg" className="gradient-text shrink-0">
            OMS Enterprise
          </Text>
        </div>

        {layout === "horizontal" && (
          <nav className="hidden lg:flex items-center gap-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                  pathname === item.href
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}

            {overflowItems.length > 0 && (
              <Menu shadow="md" width={200} position="bottom-start" offset={8}>
                <Menu.Target>
                  <UnstyledButton className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                    More <ChevronDown size={14} />
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  {overflowItems.map((item) => (
                    <Menu.Item
                      key={item.href}
                      component={Link}
                      href={item.href}
                      leftSection={<item.icon size={14} />}
                      className={cn(
                        pathname === item.href && "bg-brand-50 text-brand-600",
                      )}
                    >
                      {item.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
          </nav>
        )}
      </div>

      <Drawer
        opened={mobileNavOpened}
        onClose={() => setMobileNavOpened(false)}
        size="75%"
        padding="md"
        title={
          <Text fw={700} size="lg" className="gradient-text">
            Navigation
          </Text>
        }
        hiddenFrom="lg"
      >
        <Stack gap="xs">
          {allNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpened(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                pathname === item.href
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5",
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </Stack>
      </Drawer>

      <Group gap="md">
        {user.role === "ADMIN" && <OnlineUsersMonitor />}

        <NotificationCenter userId={user.id} />

        <Menu
          shadow="md"
          width={200}
          position="bottom-end"
          transitionProps={{ transition: "pop-top-right" }}
        >
          <Menu.Target>
            <UnstyledButton style={{ padding: "4px", borderRadius: "50%" }}>
              <Avatar
                src={null}
                alt={user.name || "User"}
                radius="xl"
                className="bg-brand-500 text-white font-bold"
              >
                {initials}
              </Avatar>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Application</Menu.Label>
            <Menu.Item
              leftSection={<User size={14} />}
              component={Link}
              href="/dashboard/profile"
            >
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<Settings size={14} />}
              onClick={() => setPreferencesOpened(true)}
            >
              System Preferences
            </Menu.Item>

            <Menu.Divider />

            <Menu.Label>Danger zone</Menu.Label>
            <Menu.Item
              color="red"
              leftSection={<LogOut size={14} />}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <PreferencesDrawer
        opened={preferencesOpened}
        onClose={() => setPreferencesOpened(false)}
        userSettings={user.settings}
      />
    </header>
  );
}
