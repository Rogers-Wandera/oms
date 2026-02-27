ALTER TABLE "oms"."attendance" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."attendance" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."attendance" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."attendance" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."auth_audit" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."auth_audit" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."auth_audit" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."auth_audit" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."company_settings" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."company_settings" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."company_settings" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."company_settings" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."departments" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."departments" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."departments" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."departments" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."notifications" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."notifications" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."notifications" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."notifications" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."report_comments" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."report_comments" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."report_comments" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."report_comments" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."shifts" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."shifts" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."shifts" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."shifts" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."sub_tasks" ALTER COLUMN "completed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."sub_tasks" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."sub_tasks" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."sub_tasks" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."sub_tasks" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."tasks" ALTER COLUMN "completed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."tasks" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."tasks" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."tasks" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."tasks" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."time_extensions" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."time_extensions" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."time_extensions" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."time_extensions" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."user_sessions" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."user_sessions" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."user_sessions" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."user_sessions" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."user_shifts" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."user_shifts" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."user_shifts" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."user_shifts" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."users" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."users" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."users" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."users" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "creation_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "creation_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "update_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "delete_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ADD COLUMN "accomplishments" jsonb;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ADD COLUMN "accomplishments" jsonb;