import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeamReportsList } from "@/components/supervisor/team-reports-list";
import { TeamOverview } from "@/components/supervisor/team-overview";

import { db } from "@/lib/db";
import {
  users,
  dailyReports,
  reportComments,
  attendance,
} from "@/lib/db/schema";
import { eq, and, desc, count, sql as drizzleSql, asc } from "drizzle-orm";

async function getTeamMembers(supervisorId: string) {
  const members = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.supervisorId, supervisorId))
    .orderBy(asc(users.firstName));

  return members.map((m) => ({
    ...m,
    name: `${m.firstName} ${m.lastName}`.trim(),
  }));
}

async function getTeamReports(supervisorId: string) {
  const reports = await db.query.dailyReports.findMany({
    where: (dr, { exists }) =>
      exists(
        db
          .select()
          .from(users)
          .where(
            and(eq(users.id, dr.userId), eq(users.supervisorId, supervisorId)),
          ),
      ),
    orderBy: [desc(dailyReports.date), desc(dailyReports.creationDate)],
    limit: 50,
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      comments: {
        with: {
          commenter: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [desc(reportComments.creationDate)],
      },
    },
  });

  return reports.map((r) => ({
    ...r,
    user_id: r.userId,
    content: r.userComment || "",
    report_date: r.date,
    creation_date: r.creationDate.toISOString(),
    created_at: r.creationDate.toISOString(),
    user_name: `${r.user?.firstName} ${r.user?.lastName}`.trim(),
    user_email: r.user?.email,
    comments: (r.comments || []).map((c) => ({
      id: c.id,
      comment: c.message,
      creation_date: c.creationDate.toISOString(),
      created_at: c.creationDate.toISOString(),
      user_name: `${c.commenter?.firstName} ${c.commenter?.lastName}`.trim(),
    })),
  }));
}

async function getTeamStats(supervisorId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [memberCount, todayReports, pendingReports, todayAttendance] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(users)
        .where(eq(users.supervisorId, supervisorId)),
      db
        .select({ value: count() })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(
          and(
            eq(users.supervisorId, supervisorId),
            eq(dailyReports.date, today),
          ),
        ),
      db
        .select({ value: count() })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        // Map 'PENDING' to 'SUBMITTED' or whatever the schema uses
        .where(
          and(
            eq(users.supervisorId, supervisorId),
            eq(dailyReports.status, "SUBMITTED"),
          ),
        ),
      db
        .select({ value: count() })
        .from(attendance)
        .innerJoin(users, eq(attendance.userId, users.id))
        .where(
          and(eq(users.supervisorId, supervisorId), eq(attendance.date, today)),
        ),
    ]);

  return {
    teamSize: Number(memberCount[0]?.value || 0),
    todayReports: Number(todayReports[0]?.value || 0),
    pendingReports: Number(pendingReports[0]?.value || 0),
    todayAttendance: Number(todayAttendance[0]?.value || 0),
  };
}

export default async function SupervisorTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "SUPERVISOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [teamMembers, reports, stats] = await Promise.all([
    getTeamMembers(session.user.id),
    getTeamReports(session.user.id),
    getTeamStats(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team Reports</h2>
        <p className="text-muted-foreground">
          Review and provide feedback on your team&apos;s daily reports
        </p>
      </div>

      <TeamOverview stats={stats} />

      <TeamReportsList
        reports={reports}
        teamMembers={teamMembers}
        supervisorId={session.user.id}
      />
    </div>
  );
}
