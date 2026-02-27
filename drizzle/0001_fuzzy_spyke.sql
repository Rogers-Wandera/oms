CREATE TABLE "oms"."company_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"header_text" text,
	"footer_text" text,
	"logo_url" text,
	"timezone" text DEFAULT 'Africa/Kampala' NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."monthly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"summary" text,
	"total_hours_worked" integer,
	"status" "oms"."report_status" DEFAULT 'SUBMITTED' NOT NULL,
	"signature_url" text,
	"supervisor_signature_url" text,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."sub_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"title" text NOT NULL,
	"is_done" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."weekly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"summary" text,
	"total_hours_worked" integer,
	"status" "oms"."report_status" DEFAULT 'SUBMITTED' NOT NULL,
	"signature_url" text,
	"supervisor_signature_url" text,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "oms"."users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "oms"."users" ALTER COLUMN "settings" SET DEFAULT '{"security":{"twoFactorMethod":"EMAIL","twoFactorEnabled":false,"twoFactorBackupCodes":[],"twoFactorSecret":null,"twoFactorSetupDate":null,"loginNotifications":true,"suspiciousActivityAlerts":true,"blockedIpAddresses":[]},"privacy":{"emailVisibility":false,"phoneVisibility":false,"showOnlineStatus":true},"notifications":{"productUpdates":true,"securityAlerts":true,"newsletterSubscription":false},"appearance":{"theme":"system"},"accessibility":{"fontSize":"md"},"work":{"startTime":"08:00","endTime":"17:00","timezone":"Africa/Kampala"}}'::jsonb;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD COLUMN "signature_url" text;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD COLUMN "supervisor_signature_url" text;--> statement-breakpoint
ALTER TABLE "oms"."users" ADD COLUMN "signature_url" text;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ADD CONSTRAINT "monthly_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."sub_tasks" ADD CONSTRAINT "sub_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "oms"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ADD CONSTRAINT "weekly_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_date_idx" ON "oms"."daily_reports" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "oms"."users" USING btree ("email");