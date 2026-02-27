import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  dailyReports,
  weeklyReports,
  monthlyReports,
  users,
} from "@/lib/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import { ManagerReviewView } from "@/components/manager/manager-review-view";
import { getPendingExtensions } from "@/app/actions/extensions";

export default async function ManagerReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const [pendingDaily, pendingWeekly, pendingMonthly, pendingExtensions] =
    await Promise.all([
      db.query.dailyReports.findMany({
        where: or(
          eq(dailyReports.status, "HEAD_REVIEWED"),
          and(
            eq(dailyReports.status, "SUBMITTED"),
            inArray(
              dailyReports.userId,
              db
                .select({ id: users.id })
                .from(users)
                .where(inArray(users.role, ["ADMIN", "MANAGER"])),
            ),
          ),
        ),
        with: { user: true },
      }),
      db.query.weeklyReports.findMany({
        where: or(
          eq(weeklyReports.status, "HEAD_REVIEWED"),
          and(
            eq(weeklyReports.status, "SUBMITTED"),
            inArray(
              weeklyReports.userId,
              db
                .select({ id: users.id })
                .from(users)
                .where(inArray(users.role, ["ADMIN", "MANAGER"])),
            ),
          ),
        ),
        with: { user: true },
      }),
      db.query.monthlyReports.findMany({
        where: or(
          eq(monthlyReports.status, "HEAD_REVIEWED"),
          and(
            eq(monthlyReports.status, "SUBMITTED"),
            inArray(
              monthlyReports.userId,
              db
                .select({ id: users.id })
                .from(users)
                .where(inArray(users.role, ["ADMIN", "MANAGER"])),
            ),
          ),
        ),
        with: { user: true },
      }),
      getPendingExtensions(),
    ]);

  return (
    <ManagerReviewView
      dailyReports={pendingDaily}
      weeklyReports={pendingWeekly}
      monthlyReports={pendingMonthly}
      pendingExtensions={pendingExtensions as any}
      manager={session.user}
    />
  );
}
