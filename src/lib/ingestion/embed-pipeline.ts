/**
 * Embedding Pipeline
 *
 * Takes content chunks from Supabase, generates embeddings via Voyage AI,
 * and upserts them into Pinecone for RAG retrieval.
 */

import { createClient } from "@supabase/supabase-js";
import { getEmbeddings } from "@/lib/pinecone/embeddings";
import { upsertVectors, type VectorMetadata } from "@/lib/pinecone/client";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Process un-embedded chunks: generate embeddings and store in Pinecone
 */
export async function runEmbeddingPipeline(batchSize = 50) {
  const supabase = getSupabase();
  // Get chunks without pinecone_id (not yet embedded)
  const { data: chunks, error } = await supabase
    .from("content_chunks")
    .select("*")
    .is("pinecone_id", null)
    .limit(batchSize);

  if (error) {
    console.error("Error fetching chunks:", error);
    return { processed: 0, errors: 1 };
  }

  if (!chunks || chunks.length === 0) {
    console.log("No chunks to embed");
    return { processed: 0, errors: 0 };
  }

  console.log(`Processing ${chunks.length} chunks...`);

  // Generate embeddings in batch
  const texts = chunks.map((c) => c.content);
  let embeddings: number[][];

  try {
    embeddings = await getEmbeddings(texts);
  } catch (err) {
    console.error("Error generating embeddings:", err);
    return { processed: 0, errors: chunks.length };
  }

  // Prepare vectors for Pinecone
  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: {
      source_type: chunk.source_type,
      source_title: chunk.source_title,
      source_id: chunk.source_id || "",
      chunk_index: chunk.metadata?.chunk_index
        ? parseInt(chunk.metadata.chunk_index)
        : i,
      content: chunk.content.slice(0, 1000), // Pinecone metadata limit
    } as VectorMetadata,
  }));

  // Upsert to Pinecone
  try {
    await upsertVectors(vectors);
  } catch (err) {
    console.error("Error upserting to Pinecone:", err);
    return { processed: 0, errors: chunks.length };
  }

  // Update Supabase chunks with pinecone_id
  for (const chunk of chunks) {
    await supabase
      .from("content_chunks")
      .update({ pinecone_id: chunk.id })
      .eq("id", chunk.id);
  }

  console.log(`Embedded and stored ${chunks.length} vectors`);
  return { processed: chunks.length, errors: 0 };
}

/**
 * Run the full embedding pipeline until all chunks are processed
 */
export async function runFullEmbeddingPipeline() {
  let totalProcessed = 0;
  let totalErrors = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await runEmbeddingPipeline(50);
    totalProcessed += result.processed;
    totalErrors += result.errors;

    if (result.processed === 0) {
      hasMore = false;
    }

    // Rate limiting
    if (hasMore) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(
    `Embedding pipeline complete: ${totalProcessed} processed, ${totalErrors} errors`
  );
  return { totalProcessed, totalErrors };
}
