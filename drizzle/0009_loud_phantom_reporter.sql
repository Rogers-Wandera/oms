ALTER TYPE "oms"."report_status" ADD VALUE 'HEAD_REVIEWED' BEFORE 'APPROVED';--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD COLUMN "head_signature_url" text;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ADD COLUMN "accomplishments" jsonb;--> statement-breakpoint
ALTER TABLE "oms"."departments" ADD COLUMN "head_id" uuid;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ADD COLUMN "head_signature_url" text;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ADD COLUMN "head_signature_url" text;