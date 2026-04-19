CREATE TYPE "public"."driver_sim_class" AS ENUM('A', 'B1', 'B2', 'C');--> statement-breakpoint
CREATE TYPE "public"."driver_vehicle_type" AS ENUM('motorcycle', 'car', 'bicycle');--> statement-breakpoint
CREATE TYPE "public"."driver_verification_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "nik" text;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "vehicle_type" "driver_vehicle_type";--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "vehicle_model" text;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "sim_class" "driver_sim_class";--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "sim_number" text;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "sim_expires_at" date;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "payout_bank" text;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "payout_account_number" text;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "payout_account_name" text;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "verification_status" "driver_verification_status" DEFAULT 'pending' NOT NULL;