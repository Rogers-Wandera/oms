CREATE TYPE "oms"."extension_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "oms"."shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"days_of_week" text NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."time_extensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"extended_until" timestamp NOT NULL,
	"reason" text,
	"status" "oms"."extension_status" DEFAULT 'PENDING' NOT NULL,
	"approved_by" uuid,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."user_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"shift_id" uuid NOT NULL,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "oms"."time_extensions" ADD CONSTRAINT "time_extensions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."time_extensions" ADD CONSTRAINT "time_extensions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."user_shifts" ADD CONSTRAINT "user_shifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."user_shifts" ADD CONSTRAINT "user_shifts_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "oms"."shifts"("id") ON DELETE no action ON UPDATE no action;