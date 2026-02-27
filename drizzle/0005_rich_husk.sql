CREATE TYPE "oms"."audit_type" AS ENUM('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'USER_LOCK', 'USER_UNLOCK', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS');--> statement-breakpoint
CREATE TYPE "oms"."notification_type" AS ENUM('TASK', 'REPORT', 'SYSTEM', 'SECURITY');--> statement-breakpoint
CREATE TABLE "oms"."auth_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" "oms"."audit_type" NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"message" text,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "oms"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "oms"."notification_type" DEFAULT 'SYSTEM' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"link" text,
	"created_by" uuid,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"update_date" timestamp,
	"deleted_by" uuid,
	"delete_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "oms"."users" ADD COLUMN "is_online" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "oms"."users" ADD COLUMN "last_active" timestamp;--> statement-breakpoint
ALTER TABLE "oms"."auth_audit" ADD CONSTRAINT "auth_audit_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oms"."notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "oms"."users"("id") ON DELETE no action ON UPDATE no action;