-- Protocol favorites (bookmarking protocols for quick access)
CREATE TABLE public.protocol_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, protocol_id)
);

CREATE INDEX idx_protocol_favorites_user ON public.protocol_favorites(user_id);

-- RLS
ALTER TABLE public.protocol_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_select ON public.protocol_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY favorites_insert ON public.protocol_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY favorites_delete ON public.protocol_favorites FOR DELETE USING (auth.uid() = user_id);
