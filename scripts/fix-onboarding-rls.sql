-- Fix 1: Add unique constraint on survey_responses.user_id for upsert to work
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_user_id_unique UNIQUE (user_id);

-- Fix 2: Add RLS policies for users table (allow authenticated users to update their own row)
-- First check/create policies
DO $$
BEGIN
  -- Allow users to read their own row
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Allow users to update their own row
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Allow users to insert their own row (for first OAuth login)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Fix 3: Add RLS policies for survey_responses table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'Users can view own survey') THEN
    CREATE POLICY "Users can view own survey" ON survey_responses FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'Users can insert own survey') THEN
    CREATE POLICY "Users can insert own survey" ON survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'Users can update own survey') THEN
    CREATE POLICY "Users can update own survey" ON survey_responses FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure RLS is enabled on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
