/**
 * PubMed Citation Search Script
 *
 * For each protocol_tool in the database, searches PubMed by tool name/keywords
 * and proposes top 3 matching papers. Outputs a CSV for manual review before
 * any data is written back to the database.
 *
 * Usage: see README or run with env vars loaded from .env.local
 *
 * Output: scripts/output/pubmed-proposals.csv
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const PUBMED_SUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";

// Rate limit: NCBI allows 3 requests/second without API key
const RATE_LIMIT_MS = 350;

interface ProtocolTool {
  id: string;
  title: string;
  protocol_id: string;
  notes: string | null;
  protocols: { title: string; category: string } | null;
}

interface PubMedResult {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  url: string;
}

interface ProposalRow {
  tool_id: string;
  tool_title: string;
  protocol_title: string;
  protocol_category: string;
  search_query: string;
  rank: number;
  pmid: string;
  paper_title: string;
  authors: string;
  journal: string;
  year: string;
  pubmed_url: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Build a search query from the tool title, stripping common filler words. */
function buildSearchQuery(toolTitle: string, protocolCategory: string): string {
  // Remove parenthetical content and common noise
  let query = toolTitle
    .replace(/\(.*?\)/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Add category context for better results
  const categoryMap: Record<string, string> = {
    sleep: "sleep",
    exercise: "exercise physiology",
    nutrition: "nutrition",
    supplements: "dietary supplements",
    stress: "stress management",
    focus: "cognitive performance",
    hormones: "hormones",
    cold_exposure: "cold exposure therapy",
    heat_exposure: "heat therapy sauna",
    light_exposure: "light therapy circadian",
    breathing: "breathing techniques",
    mental_health: "mental health",
  };

  const categoryTerm = categoryMap[protocolCategory] || protocolCategory;

  // Combine tool title keywords with category for specificity
  return `${query} ${categoryTerm}`;
}

/** Search PubMed for papers matching a query. Returns up to maxResults PMIDs. */
async function searchPubMed(query: string, maxResults = 3): Promise<string[]> {
  const params = new URLSearchParams({
    db: "pubmed",
    term: query,
    retmax: String(maxResults),
    retmode: "json",
    sort: "relevance",
  });

  const res = await fetch(`${PUBMED_SEARCH_URL}?${params}`);
  if (!res.ok) {
    console.warn(`[PubMed Search] Error for "${query}": ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return data?.esearchresult?.idlist || [];
}

/** Fetch paper summaries for a list of PMIDs. */
async function fetchPaperSummaries(pmids: string[]): Promise<PubMedResult[]> {
  if (pmids.length === 0) return [];

  const params = new URLSearchParams({
    db: "pubmed",
    id: pmids.join(","),
    retmode: "json",
  });

  const res = await fetch(`${PUBMED_SUMMARY_URL}?${params}`);
  if (!res.ok) {
    console.warn(`[PubMed Summary] Error: ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  const results: PubMedResult[] = [];

  for (const pmid of pmids) {
    const paper = data?.result?.[pmid];
    if (!paper || paper.error) continue;

    const authors = (paper.authors || [])
      .slice(0, 3)
      .map((a: { name: string }) => a.name)
      .join(", ");

    results.push({
      pmid,
      title: paper.title || "Unknown",
      authors: authors + (paper.authors?.length > 3 ? " et al." : ""),
      journal: paper.fulljournalname || paper.source || "Unknown",
      year: paper.pubdate?.split(" ")[0] || "Unknown",
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    });
  }

  return results;
}

/** Escape a value for CSV output. */
function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

async function main() {
  console.log("Fetching all protocol tools from database...");

  const { data: tools, error } = await supabase
    .from("protocol_tools")
    .select("id, title, protocol_id, notes, protocols(title, category)")
    .order("protocol_id");

  if (error || !tools) {
    console.error("Failed to fetch tools:", error?.message);
    process.exit(1);
  }

  console.log(`Found ${tools.length} tools. Searching PubMed for each...\n`);

  const proposals: ProposalRow[] = [];
  let processed = 0;
  let withResults = 0;

  for (const tool of tools as unknown as ProtocolTool[]) {
    const protocolTitle = tool.protocols?.title || "Unknown Protocol";
    const protocolCategory = tool.protocols?.category || "health";

    const query = buildSearchQuery(tool.title, protocolCategory);

    // Search PubMed
    const pmids = await searchPubMed(query, 3);
    await sleep(RATE_LIMIT_MS);

    // Fetch summaries
    let papers: PubMedResult[] = [];
    if (pmids.length > 0) {
      papers = await fetchPaperSummaries(pmids);
      await sleep(RATE_LIMIT_MS);
      withResults++;
    }

    // Add proposals
    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i];
      proposals.push({
        tool_id: tool.id,
        tool_title: tool.title,
        protocol_title: protocolTitle,
        protocol_category: protocolCategory,
        search_query: query,
        rank: i + 1,
        pmid: paper.pmid,
        paper_title: paper.title,
        authors: paper.authors,
        journal: paper.journal,
        year: paper.year,
        pubmed_url: paper.url,
      });
    }

    processed++;
    if (processed % 20 === 0) {
      console.log(`  Processed ${processed}/${tools.length} tools (${withResults} with results)...`);
    }
  }

  // Write CSV
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const csvPath = path.join(outputDir, "pubmed-proposals.csv");
  const headers = [
    "tool_id", "tool_title", "protocol_title", "protocol_category",
    "search_query", "rank", "pmid", "paper_title", "authors",
    "journal", "year", "pubmed_url",
  ];

  const csvLines = [
    headers.join(","),
    ...proposals.map((row) =>
      headers.map((h) => csvEscape(String(row[h as keyof ProposalRow]))).join(",")
    ),
  ];

  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf-8");

  console.log(`\n✅ Done!`);
  console.log(`   Tools processed: ${processed}`);
  console.log(`   Tools with PubMed results: ${withResults}`);
  console.log(`   Total proposals: ${proposals.length}`);
  console.log(`   Output: ${csvPath}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review the CSV — pick the best match per tool (rank 1 is usually best)`);
  console.log(`  2. Run the insert script with the approved selections`);
}

main().catch(console.error);
