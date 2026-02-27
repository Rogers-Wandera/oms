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
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardAuthGuard } from "@/components/dashboard/dashboard-auth-guard";

import { LocationGuard } from "@/components/dashboard/location-guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If no session on server, let client-side auth guard handle the redirect
  if (!session) {
    return <DashboardAuthGuard>{children}</DashboardAuthGuard>;
  }

  // If we have a session, fetch the data

  const [attendance, accessResult, fullUser] = await Promise.all([
    getCurrentAttendance(session.user.id),
    canAccessSystem(session.user.id, session.user.role),
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    }),
  ]);

  const securitySettings = fullUser?.settings?.security;
  const twoFactorSetupRequired =
    session.user.role === "ADMIN" && !securitySettings?.twoFactorEnabled;
  const sessionUser = {
    ...session.user,
    settings: fullUser?.settings,
  };

  // Force logout if user is locked
  if ((session.user as any).isLocked) {
    redirect("/login?error=Locked");
  }

  return (
    <DashboardAuthGuard>
      <LocationGuard>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <PresenceHeartbeat userId={session.user.id} />
          <DashboardSidebar user={sessionUser} />
          <div className="flex flex-col flex-1 main-content">
            <DashboardHeader user={sessionUser} />
            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
              <div className="app-container">
                <AttendanceGuard
                  user={sessionUser}
                  attendanceBase={attendance}
                  accessAllowed={accessResult.allowed}
                  reason={accessResult.reason}
                  twoFactorSetupRequired={twoFactorSetupRequired}
                >
                  {children}
                </AttendanceGuard>
              </div>
            </main>
            <FloatingSettings userSettings={fullUser?.settings} />
          </div>
        </div>
      </LocationGuard>
    </DashboardAuthGuard>
  );
}
