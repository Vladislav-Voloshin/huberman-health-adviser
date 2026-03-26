-- Migration: Add profile fields to users table
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xoybijzmusbzpgzfvppu/sql/new

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
