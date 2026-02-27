CREATE SCHEMA "oms";
--> statement-breakpoint
CREATE TYPE "oms"."report_status" AS ENUM('DRAFT', 'SUBMITTED', 'REVIEWED', 'ESCALATED');--> statement-breakpoint
CREATE TYPE "oms"."role" AS ENUM('ADMIN', 'USER', 'SUPERVISOR');--> statement-breakpoint
CREATE TYPE "oms"."task_status" AS ENUM('PLANNED', 'DONE', 'NOT_DONE');--> statement-breakpoint
CREATE TABLE "oms"."attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"clock_in" timestamp,
	"clock_out" timestamp,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."daily_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "oms"."report_status" DEFAULT 'DRAFT' NOT NULL,
	"user_comment" text,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."report_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"comment_by" uuid NOT NULL,
	"role" "oms"."role" NOT NULL,
	"message" text NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"status" "oms"."task_status" DEFAULT 'PLANNED' NOT NULL,
	"assigned_to" uuid NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "oms"."role" DEFAULT 'USER' NOT NULL,
	"department_id" uuid,
	"supervisor_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_until" timestamp,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"last_login_date" timestamp,
	"settings" jsonb DEFAULT '{"security":{"twoFactorMethod":"EMAIL","twoFactorEnabled":false,"twoFactorBackupCodes":[],"twoFactorSecret":null,"twoFactorSetupDate":null,"loginNotifications":true,"suspiciousActivityAlerts":true,"blockedIpAddresses":[]},"privacy":{"emailVisibility":false,"phoneVisibility":false,"showOnlineStatus":true},"notifications":{"productUpdates":true,"securityAlerts":true,"newsletterSubscription":false},"appearance":{"theme":"system"},"accessibility":{"fontSize":"md"}}'::jsonb NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "oms"."attendance" ADD CONSTRAINT "attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD CONSTRAINT "daily_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."report_comments" ADD CONSTRAINT "report_comments_report_id_daily_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "oms"."daily_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."report_comments" ADD CONSTRAINT "report_comments_comment_by_users_id_fk" FOREIGN KEY ("comment_by") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "oms"."departments"("id") ON DELETE no action ON UPDATE no action;