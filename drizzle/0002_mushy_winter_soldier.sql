ALTER TYPE "oms"."role" ADD VALUE 'MANAGER';--> statement-breakpoint
ALTER TABLE "oms"."company_settings" ADD COLUMN "working_hours" jsonb DEFAULT '[{"day":"Mon","startTime":"08:00","endTime":"17:00","isClosed":false},{"day":"Tue","startTime":"08:00","endTime":"17:00","isClosed":false},{"day":"Wed","startTime":"08:00","endTime":"17:00","isClosed":false},{"day":"Thu","startTime":"08:00","endTime":"17:00","isClosed":false},{"day":"Fri","startTime":"08:00","endTime":"17:00","isClosed":false},{"day":"Sat","startTime":"09:00","endTime":"14:00","isClosed":false},{"day":"Sun","startTime":"00:00","endTime":"00:00","isClosed":true}]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD COLUMN "manager_signature_url" text;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ADD COLUMN "manager_signature_url" text;--> statement-breakpoint
ALTER TABLE "oms"."users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "oms"."users" ADD COLUMN "joined_date" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "oms"."users" ADD COLUMN "month_end_day" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ADD COLUMN "manager_signature_url" text;