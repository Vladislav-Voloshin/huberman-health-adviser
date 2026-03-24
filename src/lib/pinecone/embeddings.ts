import Anthropic from '@anthropic-ai/sdk';

function getVoyageApiKey() {
  return process.env.VOYAGE_API_KEY || process.env.ANTHROPIC_API_KEY!;
}

export function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getVoyageApiKey()}`,
    },
    body: JSON.stringify({
      input: [text],
      model: 'voyage-3-lite',
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const batchSize = 128;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getVoyageApiKey()}`,
      },
      body: JSON.stringify({
        input: batch,
        model: 'voyage-3-lite',
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    allEmbeddings.push(...data.data.map((d: { embedding: number[] }) => d.embedding));
  }

  return allEmbeddings;
}
