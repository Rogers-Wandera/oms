import {
  boolean,
  integer,
  jsonb,
  text,
  timestamp,
  date,
  uuid,
  pgSchema,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Dynamic Schema Definition
const schemaName =
  process.env.DB_SCHEMA && process.env.DB_SCHEMA !== "public"
    ? process.env.DB_SCHEMA
    : "oms";
export const omsSchema = pgSchema(schemaName);

// 2. Enums
export const roleEnum = omsSchema.enum("role", [
  "ADMIN",
  "USER",
  "SUPERVISOR",
  "MANAGER",
]);
export const taskStatusEnum = omsSchema.enum("task_status", [
  "PLANNED",
  "DONE",
  "NOT_DONE",
]);
export const reportStatusEnum = omsSchema.enum("report_status", [
  "DRAFT",
  "SUBMITTED",
  "REVIEWED",
  "HEAD_REVIEWED",
  "APPROVED",
  "REJECTED",
]);

export const departmentReportTypeEnum = omsSchema.enum(
  "department_report_type",
  ["DAILY", "WEEKLY", "MONTHLY"],
);
export const extensionStatusEnum = omsSchema.enum("extension_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const notificationTypeEnum = omsSchema.enum("notification_type", [
  "TASK",
  "REPORT",
  "SYSTEM",
  "SECURITY",
]);

export const auditTypeEnum = omsSchema.enum("audit_type", [
  "LOGIN_SUCCESS",
  "LOGIN_FAILURE",
  "LOGOUT",
  "USER_LOCK",
  "USER_UNLOCK",
  "PASSWORD_RESET_REQUEST",
  "PASSWORD_RESET_SUCCESS",
]);

// 3. Audit Helper Columns
const auditColumns = {
  createdBy: uuid("created_by"),
  creationDate: timestamp("creation_date").defaultNow().notNull(),
  updatedBy: uuid("updated_by"),
  updateDate: timestamp("update_date"),
  deletedBy: uuid("deleted_by"),
  deleteDate: timestamp("delete_date"),
};

// 4. Tables

export const departments = omsSchema.table("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  headId: uuid("head_id"), // Removed reference to fix circular dependency
  ...auditColumns,
});

export const users = omsSchema.table(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    role: roleEnum("role").notNull().default("USER"),
    departmentId: uuid("department_id").references(() => departments.id),
    supervisorId: uuid("supervisor_id"),
    signatureUrl: text("signature_url"),
    phone: text("phone"),
    joinedDate: date("joined_date").defaultNow().notNull(),
    monthEndDay: integer("month_end_day").default(30).notNull(), // 1-30

    // Security & Status
    isVerified: boolean("is_verified").default(false).notNull(),
    isLocked: boolean("is_locked").default(false).notNull(),
    lockedUntil: timestamp("locked_until"),
    loginAttempts: integer("login_attempts").default(0).notNull(),
    lastLoginDate: timestamp("last_login_date"),
    isOnline: boolean("is_online").default(false).notNull(),
    lastActive: timestamp("last_active"),

    // Password Reset
    resetToken: text("reset_token"),
    resetTokenExpires: timestamp("reset_token_expires"),

    // Settings
    settings: jsonb("settings")
      .$type<{
        security: {
          twoFactorMethod: "EMAIL" | "SMS" | "TOTP";
          twoFactorEnabled: boolean;
          twoFactorBackupCodes: string[];
          twoFactorSecret: string | null;
          twoFactorSetupDate: string | null;
          loginNotifications: boolean;
          suspiciousActivityAlerts: boolean;
          blockedIpAddresses: string[];
        };
        privacy: {
          emailVisibility: boolean;
          phoneVisibility: boolean;
          showOnlineStatus: boolean;
        };
        notifications: {
          productUpdates: boolean;
          securityAlerts: boolean;
          newsletterSubscription: boolean;
        };
        appearance: {
          theme: "light" | "dark" | "system";
          fontFamily: "outfit" | "inter" | "roboto" | "poppins";
          colorScheme:
            | "default"
            | "brand"
            | "blue"
            | "orange"
            | "success"
            | "error"
            | "warning"
            | "purple"
            | "pink"
            | "dark";
          layout: "default" | "horizontal" | "mini";
          layoutWidth: "fluid" | "container";
          isSidebarExpanded: boolean;
        };
        accessibility: {
          fontSize: "xs" | "sm" | "md" | "lg" | "xl";
        };
        work: {
          startTime: string; // e.g. "08:00"
          endTime: string; // e.g. "17:00"
          timezone: string; // e.g. "Africa/Kampala"
        };
      }>()
      .default({
        security: {
          twoFactorMethod: "EMAIL",
          twoFactorEnabled: false,
          twoFactorBackupCodes: [],
          twoFactorSecret: null,
          twoFactorSetupDate: null,
          loginNotifications: true,
          suspiciousActivityAlerts: true,
          blockedIpAddresses: [],
        },
        privacy: {
          emailVisibility: false,
          phoneVisibility: false,
          showOnlineStatus: true,
        },
        notifications: {
          productUpdates: true,
          securityAlerts: true,
          newsletterSubscription: false,
        },
        appearance: {
          theme: "system",
          fontFamily: "outfit",
          colorScheme: "default",
          layout: "default",
          layoutWidth: "fluid",
          isSidebarExpanded: true,
        },
        accessibility: {
          fontSize: "md",
        },
        work: {
          startTime: "08:00",
          endTime: "17:00",
          timezone: "Africa/Kampala",
        },
      })
      .notNull(),
    ...auditColumns,
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  }),
);

export const userSessions = omsSchema.table("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  ...auditColumns,
});

export const tasks = omsSchema.table("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  status: taskStatusEnum("status").notNull().default("PLANNED"),
  assignedTo: uuid("assigned_to")
    .references(() => users.id)
    .notNull(),
  ...auditColumns,
});

export const subTasks = omsSchema.table("sub_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .references(() => tasks.id)
    .notNull(),
  title: text("title").notNull(),
  isDone: boolean("is_done").default(false).notNull(),
  ...auditColumns,
});

export const dailyReports = omsSchema.table(
  "daily_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    date: date("date").notNull(),
    status: reportStatusEnum("status").notNull().default("DRAFT"),
    userComment: text("user_comment"),
    signatureUrl: text("signature_url"),
    supervisorSignatureUrl: text("supervisor_signature_url"),
    supervisorComment: text("supervisor_comment"),
    headSignatureUrl: text("head_signature_url"),
    headComment: text("head_comment"),
    managerSignatureUrl: text("manager_signature_url"),
    managerComment: text("manager_comment"),
    accomplishments: jsonb("accomplishments").$type<any[]>(),
    ...auditColumns,
  },
  (table) => ({
    userDateIdx: uniqueIndex("user_date_idx").on(table.userId, table.date),
  }),
);

export const reportComments = omsSchema.table("report_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id")
    .references(() => dailyReports.id)
    .notNull(),
  commentBy: uuid("comment_by")
    .references(() => users.id)
    .notNull(),
  role: roleEnum("role").notNull(),
  message: text("message").notNull(),
  ...auditColumns,
});

export const attendance = omsSchema.table(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    date: date("date").notNull(),
    clockIn: timestamp("clock_in"),
    clockOut: timestamp("clock_out"),
    ...auditColumns,
  },
  (table) => ({
    userDateIdx: uniqueIndex("attendance_user_date_idx").on(
      table.userId,
      table.date,
    ),
  }),
);

export const weeklyReports = omsSchema.table("weekly_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  summary: text("summary"),
  totalHoursWorked: integer("total_hours_worked"),
  status: reportStatusEnum("status").notNull().default("SUBMITTED"),
  signatureUrl: text("signature_url"),
  supervisorSignatureUrl: text("supervisor_signature_url"),
  supervisorComment: text("supervisor_comment"),
  headSignatureUrl: text("head_signature_url"),
  headComment: text("head_comment"),
  managerSignatureUrl: text("manager_signature_url"),
  managerComment: text("manager_comment"),
  ...auditColumns,
});

export const monthlyReports = omsSchema.table("monthly_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  summary: text("summary"),
  totalHoursWorked: integer("total_hours_worked"),
  status: reportStatusEnum("status").notNull().default("SUBMITTED"),
  signatureUrl: text("signature_url"),
  supervisorSignatureUrl: text("supervisor_signature_url"),
  supervisorComment: text("supervisor_comment"),
  headSignatureUrl: text("head_signature_url"),
  headComment: text("head_comment"),
  managerSignatureUrl: text("manager_signature_url"),
  managerComment: text("manager_comment"),
  ...auditColumns,
});

export const companySettings = omsSchema.table("company_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  headerText: text("header_text"),
  footerText: text("footer_text"),
  logoUrl: text("logo_url"),
  timezone: text("timezone").default("Africa/Kampala").notNull(),
  workingHours: jsonb("working_hours")
    .$type<
      {
        day: string; // Mon, Tue, etc.
        startTime: string;
        endTime: string;
        isClosed: boolean;
      }[]
    >()
    .default([
      { day: "Mon", startTime: "08:00", endTime: "17:00", isClosed: false },
      { day: "Tue", startTime: "08:00", endTime: "17:00", isClosed: false },
      { day: "Wed", startTime: "08:00", endTime: "17:00", isClosed: false },
      { day: "Thu", startTime: "08:00", endTime: "17:00", isClosed: false },
      { day: "Fri", startTime: "08:00", endTime: "17:00", isClosed: false },
      { day: "Sat", startTime: "09:00", endTime: "14:00", isClosed: false },
      { day: "Sun", startTime: "00:00", endTime: "00:00", isClosed: true },
    ])
    .notNull(),
  ...auditColumns,
});

export const departmentReports = omsSchema.table("department_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  departmentId: uuid("department_id")
    .references(() => departments.id)
    .notNull(),
  type: departmentReportTypeEnum("type").notNull(),
  date: date("date"), // for DAILY
  startDate: date("start_date"), // for WEEKLY
  endDate: date("end_date"), // for WEEKLY
  month: integer("month"), // for MONTHLY
  year: integer("year"), // for MONTHLY
  summary: text("summary").notNull(),
  status: reportStatusEnum("status").notNull().default("DRAFT"),
  ...auditColumns,
});

// --- New Tables for Shifts and Extensions ---

export const shifts = omsSchema.table("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(), // "08:00"
  endTime: text("end_time").notNull(), // "17:00"
  daysOfWeek: text("days_of_week").notNull(), // "1,2,3,4,5"
  ...auditColumns,
});

export const userShifts = omsSchema.table("user_shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  shiftId: uuid("shift_id")
    .references(() => shifts.id)
    .notNull(),
  ...auditColumns,
});

export const timeExtensions = omsSchema.table("time_extensions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  date: date("date").notNull(),
  extendedUntil: timestamp("extended_until").notNull(),
  reason: text("reason"),
  status: extensionStatusEnum("status").notNull().default("PENDING"),
  approvedBy: uuid("approved_by").references(() => users.id),
  ...auditColumns,
});

export const notifications = omsSchema.table("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull().default("SYSTEM"),
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"),
  ...auditColumns,
});

export const authAudit = omsSchema.table("auth_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  type: auditTypeEnum("type").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  message: text("message"),
  ...auditColumns,
});

// Relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
  reports: many(departmentReports),
}));

export const departmentReportsRelations = relations(
  departmentReports,
  ({ one }) => ({
    department: one(departments, {
      fields: [departmentReports.departmentId],
      references: [departments.id],
    }),
  }),
);

export const shiftsRelations = relations(shifts, ({ many }) => ({
  userShifts: many(userShifts),
}));

export const userShiftsRelations = relations(userShifts, ({ one }) => ({
  user: one(users, {
    fields: [userShifts.userId],
    references: [users.id],
  }),
  shift: one(shifts, {
    fields: [userShifts.shiftId],
    references: [shifts.id],
  }),
}));

export const timeExtensionsRelations = relations(timeExtensions, ({ one }) => ({
  user: one(users, {
    fields: [timeExtensions.userId],
    references: [users.id],
    relationName: "user",
  }),
  approver: one(users, {
    fields: [timeExtensions.approvedBy],
    references: [users.id],
    relationName: "approver",
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  supervisor: one(users, {
    fields: [users.supervisorId],
    references: [users.id],
    relationName: "supervisor",
  }),
  subordinates: many(users, { relationName: "supervisor" }),
  assignedTasks: many(tasks, { relationName: "assignee" }),
  reports: many(dailyReports),
  attendance: many(attendance),
  comments: many(reportComments),
  sessions: many(userSessions),
  weeklyReports: many(weeklyReports),
  monthlyReports: many(monthlyReports),
  shifts: many(userShifts),
  extensions: many(timeExtensions, { relationName: "user" }),
  approvedExtensions: many(timeExtensions, { relationName: "approver" }),
  notifications: many(notifications),
  authAudits: many(authAudit),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assignee",
  }),
  subTasks: many(subTasks),
}));

export const subTasksRelations = relations(subTasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subTasks.taskId],
    references: [tasks.id],
  }),
}));

export const dailyReportsRelations = relations(
  dailyReports,
  ({ one, many }) => ({
    user: one(users, {
      fields: [dailyReports.userId],
      references: [users.id],
    }),
    comments: many(reportComments),
  }),
);

export const reportCommentsRelations = relations(reportComments, ({ one }) => ({
  report: one(dailyReports, {
    fields: [reportComments.reportId],
    references: [dailyReports.id],
  }),
  commenter: one(users, {
    fields: [reportComments.commentBy],
    references: [users.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
}));

export const weeklyReportsRelations = relations(weeklyReports, ({ one }) => ({
  user: one(users, {
    fields: [weeklyReports.userId],
    references: [users.id],
  }),
}));

export const monthlyReportsRelations = relations(monthlyReports, ({ one }) => ({
  user: one(users, {
    fields: [monthlyReports.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const authAuditRelations = relations(authAudit, ({ one }) => ({
  user: one(users, {
    fields: [authAudit.userId],
    references: [users.id],
  }),
}));

// Types
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type SubTask = typeof subTasks.$inferSelect;
export type NewSubTask = typeof subTasks.$inferInsert;
export type DailyReport = typeof dailyReports.$inferSelect;
export type NewDailyReport = typeof dailyReports.$inferInsert;
export type ReportComment = typeof reportComments.$inferSelect;
export type NewReportComment = typeof reportComments.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
export type CompanySetting = typeof companySettings.$inferSelect;
export type NewCompanySetting = typeof companySettings.$inferInsert;
export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type NewWeeklyReport = typeof weeklyReports.$inferInsert;
export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type NewMonthlyReport = typeof monthlyReports.$inferInsert;
export type DepartmentReport = typeof departmentReports.$inferSelect;
export type NewDepartmentReport = typeof departmentReports.$inferInsert;
export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type TimeExtension = typeof timeExtensions.$inferSelect;
export type NewTimeExtension = typeof timeExtensions.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type AuthAudit = typeof authAudit.$inferSelect;
export type NewAuthAudit = typeof authAudit.$inferInsert;
