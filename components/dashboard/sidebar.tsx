"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  userNavItems,
  supervisorNavItems,
  managerNavItems,
  adminNavItems,
} from "@/lib/navigation";
import { Building2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface SidebarProps {
  user: {
    role: string;
    name: string;
  };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { layout, isSidebarExpanded } = useSettings();

  const isSupervisor = user.role === "SUPERVISOR" || user.role === "ADMIN";
  const isManager = user.role === "MANAGER" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";

  if (layout === "horizontal") return null;

  const isMini = layout === "mini" || !isSidebarExpanded;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5 transition-all duration-300 z-50",
          isMini ? "lg:w-20" : "lg:w-64",
        )}
      >
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="shrink-0 w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {!isMini && (
            <span className="font-semibold text-lg whitespace-nowrap">
              Office Manager
            </span>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          <div className="mb-4">
            <p
              className={cn(
                "px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 transition-opacity",
                isMini ? "opacity-0 h-0" : "opacity-100",
              )}
            >
              Main
            </p>
            {userNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
                isMini={isMini}
              />
            ))}
          </div>

          {isSupervisor && (
            <div className="mb-4">
              <p
                className={cn(
                  "px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 transition-opacity",
                  isMini ? "opacity-0 h-0" : "opacity-100",
                )}
              >
                Supervisor
              </p>
              {supervisorNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  isMini={isMini}
                />
              ))}
            </div>
          )}

          {isAdmin && (
            <div className="mb-4">
              <p
                className={cn(
                  "px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 transition-opacity",
                  isMini ? "opacity-0 h-0" : "opacity-100",
                )}
              >
                Admin
              </p>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  isMini={isMini}
                />
              ))}
            </div>
          )}
          {isManager && (
            <div className="mb-4">
              <p
                className={cn(
                  "px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 transition-opacity",
                  isMini ? "opacity-0 h-0" : "opacity-100",
                )}
              >
                Manager
              </p>
              {managerNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  isMini={isMini}
                />
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  isMini,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isMini: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
        isActive
          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white",
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-transform duration-300 group-hover:scale-110",
          isMini ? "w-6 h-6" : "w-5 h-5",
          isActive ? "text-white" : "text-gray-400 group-hover:text-brand-500",
        )}
      />
      {!isMini && <span className="whitespace-nowrap">{label}</span>}
      {isMini && (
        <div className="absolute left-full ml-6 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
