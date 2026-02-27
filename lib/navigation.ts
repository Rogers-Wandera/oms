import {
  Building2,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users,
  Settings,
  ClipboardList,
  BarChart3,
  User,
  ShieldCheck,
} from "lucide-react";

export const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/dashboard/reports", label: "Daily Reports", icon: FileText },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
];

export const supervisorNavItems = [
  { href: "/supervisor/team", label: "Team Reports", icon: ClipboardList },
  { href: "/supervisor/analytics", label: "Analytics", icon: BarChart3 },
];

export const managerNavItems = [
  { href: "/manager/reviews", label: "Final Reviews", icon: ShieldCheck },
  { href: "/manager/analytics", label: "Global Analytics", icon: BarChart3 },
  {
    href: "/manager/department-reports",
    label: "Dept. Reports",
    icon: Building2,
  },
];

export const adminNavItems = [
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
