import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export function getPinecone() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export function getIndex() {
  const pc = getPinecone();
  return pc.index(process.env.PINECONE_INDEX || 'craftwell');
}

export interface VectorMetadata {
  [key: string]: string | number;
  source_type: string;
  source_title: string;
  source_id: string;
  chunk_index: number;
  content: string;
}

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata: VectorMetadata }[]
) {
  const index = getIndex();
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert({ records: batch });
  }
}

export async function queryVectors(
  embedding: number[],
  topK: number = 5,
  filter?: Record<string, string>
) {
  const index = getIndex();
  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
  });
  return results.matches || [];
}
