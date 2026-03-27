-- Remove public read access on content tables.
-- These tables hold raw scraped content and should only be accessible via
-- the service-role key (used by the RAG/ingestion pipeline).

DROP POLICY IF EXISTS chunks_public_read ON public.content_chunks;
DROP POLICY IF EXISTS episodes_public_read ON public.podcast_episodes;
DROP POLICY IF EXISTS newsletters_public_read ON public.newsletters;

-- Service-role connections bypass RLS entirely, so no replacement SELECT
-- policy is needed — the ingestion pipeline and chat RAG route already
-- use the service-role client.
