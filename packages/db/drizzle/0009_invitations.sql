CREATE TYPE "invitation_role" AS ENUM('pharmacy', 'driver');

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "token" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "role" "invitation_role" NOT NULL,
  "invited_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "used_at" timestamp with time zone,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
