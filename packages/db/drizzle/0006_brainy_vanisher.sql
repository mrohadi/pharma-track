CREATE TYPE "public"."order_payment_mode" AS ENUM('cod', 'prepaid', 'insurance');--> statement-breakpoint
CREATE TYPE "public"."order_priority" AS ENUM('normal', 'urgent');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_cents" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_ratings_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subdistrict" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "priority" "order_priority" DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_mode" "order_payment_mode" DEFAULT 'cod' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_cents" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "driver_fee_cents" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_ratings" ADD CONSTRAINT "order_ratings_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO order_items (id, order_id, name, quantity, position)
SELECT gen_random_uuid(), id, medicine_text, 1, 0 FROM orders;
