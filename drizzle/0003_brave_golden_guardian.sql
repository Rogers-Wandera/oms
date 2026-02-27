CREATE TYPE "oms"."department_report_type" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TABLE "oms"."department_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"type" "oms"."department_report_type" NOT NULL,
	"date" date,
	"start_date" date,
	"end_date" date,
	"month" integer,
	"year" integer,
	"summary" text NOT NULL,
	"status" "oms"."report_status" DEFAULT 'DRAFT' NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED'::text;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED'::text;--> statement-breakpoint
DROP TYPE "oms"."report_status";--> statement-breakpoint
CREATE TYPE "oms"."report_status" AS ENUM('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."daily_reports" ALTER COLUMN "status" SET DATA TYPE "oms"."report_status" USING "status"::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ALTER COLUMN "status" SET DATA TYPE "oms"."report_status" USING "status"::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED'::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."monthly_reports" ALTER COLUMN "status" SET DATA TYPE "oms"."report_status" USING "status"::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED'::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."weekly_reports" ALTER COLUMN "status" SET DATA TYPE "oms"."report_status" USING "status"::"oms"."report_status";--> statement-breakpoint
ALTER TABLE "oms"."department_reports" ADD CONSTRAINT "department_reports_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "oms"."departments"("id") ON DELETE no action ON UPDATE no action;