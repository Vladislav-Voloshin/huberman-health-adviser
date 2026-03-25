/**
 * Examine.com Supplement Data Scraper
 *
 * Fetches supplement information from Examine.com including
 * dosages, evidence grades, benefits, and interactions.
 * Stores structured supplement data for RAG retrieval.
 */

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface SupplementData {
  name: string;
  slug: string;
  summary: string;
  benefits: { category: string; description: string; evidence_grade: string }[];
  dosage: string;
  side_effects: string;
  interactions: string;
  mechanisms: string;
  url: string;
}

/**
 * Key supplements discussed in health/neuroscience podcasts and research
 */
const SUPPLEMENTS = [
  { name: "Magnesium", slug: "magnesium" },
  { name: "Magnesium L-Threonate", slug: "magnesium-l-threonate" },
  { name: "Omega-3 Fish Oil", slug: "fish-oil" },
  { name: "Vitamin D", slug: "vitamin-d" },
  { name: "Creatine", slug: "creatine" },
  { name: "Ashwagandha", slug: "ashwagandha" },
  { name: "Rhodiola Rosea", slug: "rhodiola-rosea" },
  { name: "L-Theanine", slug: "theanine" },
  { name: "Caffeine", slug: "caffeine" },
  { name: "Zinc", slug: "zinc" },
  { name: "Melatonin", slug: "melatonin" },
  { name: "Alpha-GPC", slug: "alpha-gpc" },
  { name: "Lion's Mane", slug: "lions-mane" },
  { name: "Berberine", slug: "berberine" },
  { name: "NAC (N-Acetyl Cysteine)", slug: "n-acetylcysteine" },
  { name: "Tongkat Ali", slug: "eurycoma-longifolia-jack" },
  { name: "Fadogia Agrestis", slug: "fadogia-agrestis" },
  { name: "Apigenin", slug: "apigenin" },
  { name: "Inositol", slug: "inositol" },
  { name: "Glycine", slug: "glycine" },
  { name: "Taurine", slug: "taurine" },
  { name: "Curcumin (Turmeric)", slug: "curcumin" },
  { name: "Resveratrol", slug: "resveratrol" },
  { name: "NMN (Nicotinamide Mononucleotide)", slug: "nicotinamide-mononucleotide" },
  { name: "Coenzyme Q10", slug: "coenzyme-q10" },
  { name: "Acetyl-L-Carnitine", slug: "carnitine" },
  { name: "Phosphatidylserine", slug: "phosphatidylserine" },
  { name: "Boron", slug: "boron" },
  { name: "Selenium", slug: "selenium" },
  { name: "Quercetin", slug: "quercetin" },
];

/**
 * Fetch supplement page from Examine.com and extract content
 */
async function fetchSupplementPage(slug: string): Promise<string | null> {
  const url = `https://examine.com/supplements/${slug}/`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CraftwellBot/1.0; health research)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Examine fetch error: ${response.status}`);
    }

    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Extract structured supplement data from page HTML
 */
function parseSupplementPage(
  html: string,
  name: string,
  slug: string
): SupplementData {
  // Extract meta description as summary
  const metaMatch = html.match(
    /<meta\s+name="description"\s+content="([^"]*?)"/i
  );
  const summary = metaMatch ? cleanHtml(metaMatch[1]) : "";

  // Extract main content text (strip HTML)
  const mainContentMatch = html.match(
    /<main[^>]*>([\s\S]*?)<\/main>/i
  );
  const mainText = mainContentMatch
    ? cleanHtml(mainContentMatch[1])
    : cleanHtml(html);

  // Extract dosage section
  const dosage = extractSection(html, "dosage") || extractSection(mainText, "dosage") || "";

  // Extract side effects
  const sideEffects =
    extractSection(html, "side.?effect") ||
    extractSection(html, "safety") ||
    "";

  // Extract interactions
  const interactions =
    extractSection(html, "interaction") ||
    extractSection(html, "drug.?interaction") ||
    "";

  // Extract mechanisms
  const mechanisms =
    extractSection(html, "mechanism") ||
    extractSection(html, "how.?it.?works") ||
    "";

  // Extract benefits from structured data or headings
  const benefits = extractBenefits(html);

  return {
    name,
    slug,
    summary,
    benefits,
    dosage: dosage.slice(0, 1000),
    side_effects: sideEffects.slice(0, 1000),
    interactions: interactions.slice(0, 1000),
    mechanisms: mechanisms.slice(0, 1000),
    url: `https://examine.com/supplements/${slug}/`,
  };
}

function extractSection(text: string, pattern: string): string {
  const regex = new RegExp(
    `(?:#{1,3}|<h[2-4][^>]*>)[^<]*${pattern}[^<]*(?:<\/h[2-4]>)?([\\s\\S]{0,2000}?)(?=(?:#{1,3}|<h[2-4])|$)`,
    "i"
  );
  const match = text.match(regex);
  if (!match) return "";
  return cleanHtml(match[1]).trim().slice(0, 1500);
}

function extractBenefits(
  html: string
): { category: string; description: string; evidence_grade: string }[] {
  const benefits: {
    category: string;
    description: string;
    evidence_grade: string;
  }[] = [];

  // Try to find benefit/effect entries
  const benefitRegex =
    /<(?:h[2-4]|strong)[^>]*>([^<]*(?:benefit|effect|use|support)[^<]*)<\/(?:h[2-4]|strong)>\s*([\s\S]{0,500}?)(?=<(?:h[2-4]|strong)|$)/gi;
  let match;
  while ((match = benefitRegex.exec(html)) !== null && benefits.length < 10) {
    benefits.push({
      category: cleanHtml(match[1]).trim(),
      description: cleanHtml(match[2]).trim().slice(0, 300),
      evidence_grade: "varies",
    });
  }

  return benefits;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Store supplement data as content chunks for embedding
 */
async function storeSupplementData(data: SupplementData): Promise<number> {
  const supabase = getSupabase();

  // Build rich content string for the chunk
  const sections: string[] = [
    `Supplement: ${data.name}`,
    `Source: Examine.com`,
    "",
    data.summary,
  ];

  if (data.dosage) {
    sections.push("", `Dosage: ${data.dosage}`);
  }
  if (data.mechanisms) {
    sections.push("", `How it works: ${data.mechanisms}`);
  }
  if (data.side_effects) {
    sections.push("", `Side effects: ${data.side_effects}`);
  }
  if (data.interactions) {
    sections.push("", `Drug interactions: ${data.interactions}`);
  }
  if (data.benefits.length > 0) {
    sections.push(
      "",
      "Benefits:",
      ...data.benefits.map(
        (b) => `- ${b.category}: ${b.description} (Evidence: ${b.evidence_grade})`
      )
    );
  }

  const content = sections.join("\n");

  // Store as a single chunk if short, or split if long
  if (content.length <= 1500) {
    const { error } = await supabase.from("content_chunks").insert({
      source_type: "supplement",
      source_title: `${data.name} — Examine.com`,
      source_id: `examine-${data.slug}`,
      content,
      metadata: {
        supplement_name: data.name,
        source_url: data.url,
      },
    });

    if (error && error.code !== "23505") {
      console.error(`Error storing ${data.name}:`, error);
      return 0;
    }
    return error ? 0 : 1;
  }

  // Split into multiple chunks for longer content
  let stored = 0;
  const chunkSize = 1200;
  for (let i = 0; i < content.length; i += chunkSize) {
    const chunk = content.slice(i, i + chunkSize);
    const { error } = await supabase.from("content_chunks").insert({
      source_type: "supplement",
      source_title: `${data.name} — Examine.com (${Math.floor(i / chunkSize) + 1})`,
      source_id: `examine-${data.slug}-${Math.floor(i / chunkSize)}`,
      content: chunk,
      metadata: {
        supplement_name: data.name,
        source_url: data.url,
        chunk_index: String(Math.floor(i / chunkSize)),
      },
    });

    if (error && error.code !== "23505") {
      console.error(`Error storing ${data.name} chunk:`, error);
    } else if (!error) {
      stored++;
    }
  }

  return stored;
}

/**
 * Main Examine.com scraping pipeline
 */
export async function runExamineScraper() {
  console.log("Starting Examine.com supplement scraper...");
  let totalStored = 0;

  for (const supplement of SUPPLEMENTS) {
    console.log(`Fetching: ${supplement.name}`);

    try {
      const html = await fetchSupplementPage(supplement.slug);

      if (!html) {
        console.log(`  Not found: ${supplement.name}`);
        continue;
      }

      const data = parseSupplementPage(html, supplement.name, supplement.slug);
      const stored = await storeSupplementData(data);
      totalStored += stored;

      console.log(`  Stored ${stored} chunks for ${supplement.name}`);

      // Rate limit: be respectful to Examine.com
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`  Error for ${supplement.name}:`, err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`Examine scraper complete: ${totalStored} supplement chunks stored`);
  return totalStored;
}
