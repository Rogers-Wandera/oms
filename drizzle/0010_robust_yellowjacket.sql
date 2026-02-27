ALTER TABLE "oms"."daily_reports" ADD COLUMN "supervisor_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD COLUMN "head_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD COLUMN "manager_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ADD COLUMN "supervisor_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ADD COLUMN "head_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ADD COLUMN "manager_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ADD COLUMN "supervisor_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ADD COLUMN "head_comment" text;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ADD COLUMN "manager_comment" text;