/**
 * Re-run protocol extraction with expanded knowledge base
 * Run: npx tsx scripts/reextract-protocols.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { runProtocolExtraction } from "../src/lib/ingestion/protocol-extractor";

async function main() {
  console.log("Starting protocol re-extraction with expanded knowledge base...");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗");
  console.log("Anthropic API:", process.env.ANTHROPIC_API_KEY ? "✓" : "✗");

  const total = await runProtocolExtraction();
  console.log(`\nDone! ${total} protocols extracted and stored.`);
}

main().catch(console.error);
