CREATE TYPE "public"."pharmacy_verification_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "pic_name" text;--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "npwp" text;--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "sia_number" text;--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "sipa_number" text;--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "verification_status" "pharmacy_verification_status" DEFAULT 'pending' NOT NULL;