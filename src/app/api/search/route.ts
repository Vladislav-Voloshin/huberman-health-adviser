import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError, handleApiError } from "@/lib/api/helpers";
import { getEmbedding } from "@/lib/pinecone/embeddings";
import { queryVectors } from "@/lib/pinecone/client";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return apiError("Query must be at least 2 characters", 400);
    }

    // Sanitize for PostgREST .or() — escape characters that break filter syntax
    const q = query.trim().replace(/[%_\\(),."']/g, "");

    // Run both searches in parallel
    const [protocolResults, knowledgeResults] = await Promise.all([
      // 1. Protocol text search via Supabase
      supabase
        .from("protocols")
        .select("id, title, slug, category, description, effectiveness_rank, difficulty")
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .order("effectiveness_rank")
        .limit(10),

      // 2. Semantic search via Pinecone
      (async () => {
        try {
          const embedding = await getEmbedding(q);
          const matches = await queryVectors(embedding, 8);
          return matches.map((m) => ({
            score: m.score,
            source_type: m.metadata?.source_type,
            source_title: m.metadata?.source_title,
            content: (m.metadata?.content as string)?.slice(0, 300),
          }));
        } catch (err) {
          console.warn("[Search] Semantic search unavailable:", err instanceof Error ? err.message : err);
          return [];
        }
      })(),
    ]);

    return NextResponse.json({
      protocols: protocolResults.data || [],
      knowledge: knowledgeResults,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
