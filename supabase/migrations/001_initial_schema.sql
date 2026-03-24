-- Users profile (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding survey responses
CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  health_goals TEXT[] DEFAULT '{}',
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  exercise_frequency TEXT,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  supplement_experience TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocol categories
CREATE TABLE public.protocol_categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocols (predefined toolkits)
CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL REFERENCES public.protocol_categories(slug),
  description TEXT NOT NULL,
  effectiveness_rank INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'advanced')),
  time_commitment TEXT,
  source_episodes TEXT[] DEFAULT '{}',
  source_type TEXT CHECK (source_type IN ('podcast', 'newsletter', 'book', 'research')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocol tools (individual actionable steps within a protocol)
CREATE TABLE public.protocol_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  effectiveness_rank INTEGER NOT NULL,
  timing TEXT,
  duration TEXT,
  frequency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Podcast episodes
CREATE TABLE public.podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_number INTEGER UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  publish_date DATE,
  duration_seconds INTEGER,
  transcript TEXT,
  guests TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  url TEXT,
  ingested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletters
CREATE TABLE public.newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  publish_date DATE,
  content TEXT,
  topics TEXT[] DEFAULT '{}',
  url TEXT,
  ingested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content chunks (for RAG)
CREATE TABLE public.content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('podcast', 'newsletter', 'book', 'research')),
  source_title TEXT NOT NULL,
  source_id UUID,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  pinecone_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  protocol_id UUID REFERENCES public.protocols(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User protocols (tracking which protocols a user has adopted)
CREATE TABLE public.user_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, protocol_id)
);

-- Indexes
CREATE INDEX idx_protocols_category ON public.protocols(category);
CREATE INDEX idx_protocols_effectiveness ON public.protocols(effectiveness_rank);
CREATE INDEX idx_protocol_tools_protocol ON public.protocol_tools(protocol_id);
CREATE INDEX idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_content_chunks_source ON public.content_chunks(source_type, source_id);
CREATE INDEX idx_content_chunks_pinecone ON public.content_chunks(pinecone_id);
CREATE INDEX idx_podcast_episodes_ingested ON public.podcast_episodes(ingested);
CREATE INDEX idx_newsletters_ingested ON public.newsletters(ingested);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_protocols ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY users_select ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update ON public.users FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own survey
CREATE POLICY survey_select ON public.survey_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY survey_insert ON public.survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their own chats
CREATE POLICY chats_select ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chats_insert ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chats_update ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY chats_delete ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY messages_select ON public.chat_messages FOR SELECT
  USING (session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY messages_insert ON public.chat_messages FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()));

-- Users can manage their protocol subscriptions
CREATE POLICY user_protocols_select ON public.user_protocols FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_protocols_insert ON public.user_protocols FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_protocols_update ON public.user_protocols FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_protocols_delete ON public.user_protocols FOR DELETE USING (auth.uid() = user_id);

-- Public read access for protocols, categories, episodes, newsletters
ALTER TABLE public.protocol_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_public_read ON public.protocol_categories FOR SELECT USING (true);
CREATE POLICY protocols_public_read ON public.protocols FOR SELECT USING (true);
CREATE POLICY tools_public_read ON public.protocol_tools FOR SELECT USING (true);
CREATE POLICY episodes_public_read ON public.podcast_episodes FOR SELECT USING (true);
CREATE POLICY newsletters_public_read ON public.newsletters FOR SELECT USING (true);
CREATE POLICY chunks_public_read ON public.content_chunks FOR SELECT USING (true);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone)
  VALUES (NEW.id, NEW.email, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON public.protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed protocol categories
INSERT INTO public.protocol_categories (slug, name, description, icon, sort_order) VALUES
  ('sleep', 'Sleep', 'Optimize sleep quality and duration', 'moon', 1),
  ('focus', 'Focus & Productivity', 'Enhance concentration and cognitive performance', 'brain', 2),
  ('exercise', 'Exercise & Recovery', 'Physical performance and recovery protocols', 'dumbbell', 3),
  ('stress', 'Stress & Anxiety', 'Manage stress and reduce anxiety', 'heart', 4),
  ('nutrition', 'Nutrition & Supplements', 'Dietary protocols and supplementation', 'apple', 5),
  ('hormones', 'Hormones & Health', 'Optimize hormonal health naturally', 'activity', 6),
  ('cold-heat', 'Cold & Heat Exposure', 'Deliberate cold and heat protocols', 'thermometer', 7),
  ('light', 'Light Exposure', 'Circadian rhythm and light optimization', 'sun', 8),
  ('motivation', 'Motivation & Dopamine', 'Drive, reward systems, and habit formation', 'zap', 9),
  ('mental-health', 'Mental Health', 'Depression, mood, and emotional regulation', 'smile', 10);
