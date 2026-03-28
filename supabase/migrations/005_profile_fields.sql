-- Migration 005: Add first_name, last_name, age to profiles table (PB-70)
-- Idempotent: uses IF NOT EXISTS so safe to re-run

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INTEGER;

-- RLS note: The existing users_select, users_insert, users_update policies
-- already cover all columns (no column-level restrictions), so no RLS
-- changes are needed.

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
