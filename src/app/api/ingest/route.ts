import { NextRequest, NextResponse } from "next/server";
import { runPodcastScraper } from "@/lib/ingestion/podcast-scraper";
import { runNewsletterScraper } from "@/lib/ingestion/newsletter-scraper";
import { chunkPodcastEpisodes, chunkNewsletters } from "@/lib/ingestion/chunker";
import { runFullEmbeddingPipeline } from "@/lib/ingestion/embed-pipeline";
import { runProtocolExtraction } from "@/lib/ingestion/protocol-extractor";

export async function POST(request: NextRequest) {
  // Simple API key auth for admin operations
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { step } = await request.json();

  try {
    switch (step) {
      case "scrape-podcasts": {
        const result = await runPodcastScraper();
        return NextResponse.json({ success: true, ...result });
      }

      case "scrape-newsletters": {
        const result = await runNewsletterScraper();
        return NextResponse.json({ success: true, ...result });
      }

      case "chunk-podcasts": {
        const totalChunks = await chunkPodcastEpisodes();
        return NextResponse.json({ success: true, totalChunks });
      }

      case "chunk-newsletters": {
        const totalChunks = await chunkNewsletters();
        return NextResponse.json({ success: true, totalChunks });
      }

      case "embed": {
        const result = await runFullEmbeddingPipeline();
        return NextResponse.json({ success: true, ...result });
      }

      case "extract-protocols": {
        const totalProtocols = await runProtocolExtraction();
        return NextResponse.json({ success: true, totalProtocols });
      }

      case "full-pipeline": {
        // Run the complete ingestion pipeline
        const podcasts = await runPodcastScraper();
        const newsletters = await runNewsletterScraper();
        const podcastChunks = await chunkPodcastEpisodes();
        const newsletterChunks = await chunkNewsletters();
        const embeddings = await runFullEmbeddingPipeline();
        const protocols = await runProtocolExtraction();

        return NextResponse.json({
          success: true,
          podcasts,
          newsletters,
          chunks: { podcasts: podcastChunks, newsletters: newsletterChunks },
          embeddings,
          protocols,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown step: ${step}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "production"
          ? "Ingestion failed"
          : error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
