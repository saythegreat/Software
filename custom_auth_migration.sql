-- ============================================================
-- FreshTrack Custom Auth Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the custom users table (replaces Supabase Auth users)
CREATE TABLE IF NOT EXISTS custom_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  verify_token   TEXT,
  verify_token_expires_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Update inventory_items to reference custom_users instead of auth.users
-- (If you already have inventory_items with auth user_id, this changes the FK)
-- First drop the old FK if it exists:
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_user_id_fkey;

-- Re-add FK pointing to our custom_users table:
ALTER TABLE inventory_items
  ADD CONSTRAINT inventory_items_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES custom_users(id) ON DELETE CASCADE;

-- 3. Disable Supabase RLS on custom_users (we handle auth ourselves)
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON custom_users
  USING (true) WITH CHECK (true);

-- 4. Make inventory_items accessible by service role (no RLS checks needed)
-- (keep existing RLS or drop it — using service role key bypasses RLS anyway)
