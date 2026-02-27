import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AttendanceGuard } from "@/components/dashboard/attendance-guard";
import { PresenceHeartbeat } from "@/components/dashboard/presence-heartbeat";
import { FloatingSettings } from "@/components/dashboard/floating-settings";
import {
  getCurrentAttendance,
  canAccessSystem,
} from "@/app/actions/attendance";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [attendance, accessResult] = await Promise.all([
    getCurrentAttendance(session.user.id),
    canAccessSystem(session.user.id, session.user.role),
  ]);

  // Force logout if user is locked
  if ((session.user as any).isLocked) {
    redirect("/login?error=Locked");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <PresenceHeartbeat userId={session.user.id} />
      <DashboardSidebar user={session.user} />
      <div className="flex flex-col flex-1 main-content">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="app-container">
            <AttendanceGuard
              user={session.user}
              attendanceBase={attendance}
              accessAllowed={accessResult.allowed}
              reason={accessResult.reason}
            >
              {children}
            </AttendanceGuard>
          </div>
        </main>
        <FloatingSettings userSettings={(session.user as any).settings} />
      </div>
    </div>
  );
}
