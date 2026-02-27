"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users,
  Settings,
  ClipboardList,
  BarChart3,
} from "lucide-react";

interface MobileSidebarProps {
  user: {
    role: string;
    name: string;
  };
}

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/dashboard/reports", label: "Daily Reports", icon: FileText },
];

const supervisorNavItems = [
  { href: "/supervisor/team", label: "Team Reports", icon: ClipboardList },
  { href: "/supervisor/analytics", label: "Analytics", icon: BarChart3 },
];

const adminNavItems = [
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function MobileSidebar({ user }: MobileSidebarProps) {
  const pathname = usePathname();

  const isSupervisor = user.role === "SUPERVISOR" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Building2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg">Office Manager</span>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Main
          </p>
          {userNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        {isSupervisor && (
          <div className="mb-4">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Supervisor
            </p>
            {supervisorNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="mb-4">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Admin
            </p>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "menu-item",
        isActive ? "menu-item-active" : "text-muted-foreground",
      )}
    >
      <Icon
        className={cn("menu-item-icon", isActive && "text-brand-foreground")}
      />
      {label}
    </Link>
  );
}
