import cron from "node-cron";
import {
  generateAllPendingWeeklyReports,
  generateAllPendingMonthlyReports,
} from "../app/actions/automation-reports";
import {
  generateAllPendingDepartmentReports,
  generateWeeklyDepartmentReport,
  generateMonthlyDepartmentReport,
} from "../app/actions/departmental-reports";
import { db } from "../lib/db";
import { departments } from "../lib/db/schema";

export function setupCronJobs(io: any) {
  console.log("Setting up automated cron jobs...");

  // Weekly reports: Friday 5 PM
  cron.schedule(
    "0 17 * * 5",
    async () => {
      console.log("Running scheduled Weekly Report generation...");
      try {
        const reports = await generateAllPendingWeeklyReports();
        if (reports && reports.length > 0) {
          console.log(
            `Successfully generated ${reports.length} weekly reports.`,
          );
          io.emit("notification", {
            type: "WEEKLY_REPORT_GENERATED",
            message: "Weekly reports have been automatically generated.",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Cron Error (Weekly Reports):", error);
      }
    },
    {
      timezone: "Africa/Kampala",
    },
  );

  // Monthly reports: Every midnight to check for personalized month-end
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("Checking for personalized Monthly Report generation...");
      try {
        const reports = await generateAllPendingMonthlyReports();
        if (reports && reports.length > 0) {
          console.log(
            `Successfully generated ${reports.length} monthly reports.`,
          );
          io.emit("notification", {
            type: "MONTHLY_REPORT_GENERATED",
            message: "Monthly reports have been generated for some users.",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Cron Error (Monthly Reports):", error);
      }
    },
    {
      timezone: "Africa/Kampala",
    },
  );

  // --- Departmental Combined Reports ---

  // Daily Departmental: 9 PM Daily
  cron.schedule(
    "0 21 * * *",
    async () => {
      console.log("Generating Daily Departmental Reports...");
      try {
        await generateAllPendingDepartmentReports();
        io.emit("notification", {
          type: "DEPT_REPORT_GENERATED",
          message: "Daily departmental summaries have been generated.",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Cron Error (Daily Dept Reports):", error);
      }
    },
    { timezone: "Africa/Kampala" },
  );

  // Weekly Departmental: Friday 7 PM (After user weekly at 5 PM)
  cron.schedule(
    "0 19 * * 5",
    async () => {
      console.log("Generating Weekly Departmental Reports...");
      const now = new Date();
      const end = now.toISOString().split("T")[0];
      const start = new Date(now.setDate(now.getDate() - 6))
        .toISOString()
        .split("T")[0];

      try {
        const depts = await db.select().from(departments);
        for (const dept of depts) {
          await generateWeeklyDepartmentReport(dept.id, start, end);
        }
        io.emit("notification", {
          type: "DEPT_REPORT_GENERATED",
          message: "Weekly departmental summaries have been generated.",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Cron Error (Weekly Dept Reports):", error);
      }
    },
    { timezone: "Africa/Kampala" },
  );

  // Monthly Departmental: 1 AM Daily (Checks if many user monthly reports were generated)
  cron.schedule(
    "0 1 * * *",
    async () => {
      console.log("Generating Monthly Departmental Reports...");
      const now = new Date();
      const month = now.getMonth() + 1; // getMonth is 0-indexed
      const year = now.getFullYear();

      try {
        const depts = await db.select().from(departments);
        for (const dept of depts) {
          await generateMonthlyDepartmentReport(dept.id, month, year);
        }
        io.emit("notification", {
          type: "DEPT_REPORT_GENERATED",
          message: "Monthly departmental summaries have been generated.",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Cron Error (Monthly Dept Reports):", error);
      }
    },
    { timezone: "Africa/Kampala" },
  );
}
