/**
 * Fetch all YouTube episodes and embed them
 * Run: npx tsx scripts/fetch-youtube-episodes.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { runYouTubeScraper } from "../src/lib/ingestion/youtube-scraper";
import { runFullEmbeddingPipeline } from "../src/lib/ingestion/embed-pipeline";

async function main() {
  console.log("=== YouTube Episode Fetcher ===\n");
  console.log("YouTube API Key:", process.env.YOUTUBE_API_KEY ? "✓" : "✗");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗");
  console.log("Voyage AI Key:", process.env.VOYAGE_API_KEY ? "✓" : "✗");
  console.log("");

  // Step 1: Fetch YouTube videos
  const { total, stored } = await runYouTubeScraper();
  console.log(`\nYouTube: ${total} videos found, ${stored} new chunks stored\n`);

  // Step 2: Embed new chunks
  if (stored > 0) {
    console.log("Embedding new chunks into Pinecone...");
    const embedResult = await runFullEmbeddingPipeline();
    console.log(`Embedding complete:`, embedResult);
  } else {
    console.log("No new chunks to embed.");
  }

  console.log("\nDone!");
}

main().catch(console.error);
