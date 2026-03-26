-- Protocol completions table for daily checklist tracking
CREATE TABLE IF NOT EXISTS protocol_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES protocol_tools(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, protocol_id, tool_id, completed_date)
);

-- Index for fast lookups by user + protocol + date
CREATE INDEX idx_completions_user_protocol_date
  ON protocol_completions(user_id, protocol_id, completed_date);

-- Index for streak calculations (user + protocol ordered by date)
CREATE INDEX idx_completions_streak
  ON protocol_completions(user_id, protocol_id, completed_date DESC);

-- RLS policies
ALTER TABLE protocol_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON protocol_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON protocol_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON protocol_completions FOR DELETE
  USING (auth.uid() = user_id);
