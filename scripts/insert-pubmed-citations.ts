/**
 * PubMed Citation Insert Script
 *
 * Reads the proposals CSV, filters for relevance, and inserts
 * rank-1 citations into protocol_tools.notes as markdown links.
 *
 * Relevance filter: at least one significant keyword from the tool title
 * must appear in the paper title (case-insensitive).
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Words too generic to count as a keyword match
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "with",
  "by", "from", "at", "is", "it", "as", "be", "are", "was", "were",
  "has", "have", "had", "do", "does", "did", "will", "would", "can",
  "could", "should", "may", "might", "must", "shall", "not", "no",
  "but", "if", "then", "than", "so", "up", "out", "about", "into",
  "through", "during", "before", "after", "above", "below", "between",
  "same", "each", "every", "all", "both", "few", "more", "most",
  "other", "some", "such", "only", "own", "too", "very", "just",
  "how", "what", "when", "where", "which", "who", "why",
  "use", "using", "based", "via", "per", "vs", "level", "levels",
  "high", "low", "daily", "optimal", "optimize", "protocol", "routine",
  "morning", "evening", "night", "time", "timing", "minute", "minutes",
  "hour", "hours", "day", "week", "practice", "technique", "method",
  "support", "enhance", "boost", "improve", "increase", "reduce",
  "management", "control", "strategy", "strategic",
]);

interface CsvRow {
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

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split("\n");
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted CSV fields
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current);

    if (fields.length >= 12) {
      rows.push({
        tool_id: fields[0],
        tool_title: fields[1],
        protocol_title: fields[2],
        protocol_category: fields[3],
        search_query: fields[4],
        rank: parseInt(fields[5]),
        pmid: fields[6],
        paper_title: fields[7],
        authors: fields[8],
        journal: fields[9],
        year: fields[10],
        pubmed_url: fields[11],
      });
    }
  }

  return rows;
}

/** Extract significant keywords from a tool title. */
function getKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** Check if the paper title contains at least one significant keyword from the tool title. */
function isRelevant(toolTitle: string, paperTitle: string): boolean {
  const keywords = getKeywords(toolTitle);
  const paperLower = paperTitle.toLowerCase();

  let matches = 0;
  for (const kw of keywords) {
    if (paperLower.includes(kw)) {
      matches++;
    }
  }

  // Require at least 1 keyword match, or if tool has very few keywords, require 1
  return matches >= 1;
}

async function main() {
  const csvPath = path.join(__dirname, "output", "pubmed-proposals.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found. Run search-pubmed-citations.ts first.");
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const allRows = parseCsv(content);

  // Filter to rank-1 only
  const rank1 = allRows.filter((r) => r.rank === 1);
  console.log(`Total rank-1 proposals: ${rank1.length}`);

  // Apply relevance filter
  const relevant: CsvRow[] = [];
  const rejected: CsvRow[] = [];

  for (const row of rank1) {
    if (isRelevant(row.tool_title, row.paper_title)) {
      relevant.push(row);
    } else {
      rejected.push(row);
    }
  }

  console.log(`Relevant (will insert): ${relevant.length}`);
  console.log(`Rejected (no keyword match): ${rejected.length}`);

  if (rejected.length > 0) {
    console.log("\nRejected citations:");
    for (const r of rejected.slice(0, 10)) {
      console.log(`  ❌ "${r.tool_title}" → "${r.paper_title}"`);
    }
    if (rejected.length > 10) {
      console.log(`  ... and ${rejected.length - 10} more`);
    }
  }

  // Insert citations into protocol_tools.notes
  let inserted = 0;
  let errors = 0;

  for (const row of relevant) {
    // Fetch current notes
    const { data: tool, error: fetchErr } = await supabase
      .from("protocol_tools")
      .select("notes")
      .eq("id", row.tool_id)
      .single();

    if (fetchErr || !tool) {
      console.warn(`  ⚠️ Could not fetch tool ${row.tool_id}: ${fetchErr?.message}`);
      errors++;
      continue;
    }

    const currentNotes = tool.notes || "";

    // Don't add if already has a PubMed link
    if (currentNotes.includes("pubmed.ncbi.nlm.nih.gov")) {
      continue;
    }

    // Build citation markdown
    const shortAuthors = row.authors.length > 40
      ? row.authors.slice(0, 37) + "..."
      : row.authors;
    const citation = `\n\n**Reference:** [${shortAuthors} (${row.year}). ${row.paper_title}](${row.pubmed_url})`;

    const updatedNotes = currentNotes.trimEnd() + citation;

    const { error: updateErr } = await supabase
      .from("protocol_tools")
      .update({ notes: updatedNotes })
      .eq("id", row.tool_id);

    if (updateErr) {
      console.warn(`  ⚠️ Failed to update tool ${row.tool_id}: ${updateErr.message}`);
      errors++;
    } else {
      inserted++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Citations inserted: ${inserted}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Rejected (irrelevant): ${rejected.length}`);

  // Save rejected list for manual review
  const rejectedPath = path.join(__dirname, "output", "pubmed-rejected.csv");
  const rejectedCsv = [
    "tool_id,tool_title,paper_title,pubmed_url",
    ...rejected.map(
      (r) =>
        `${r.tool_id},"${r.tool_title.replace(/"/g, '""')}","${r.paper_title.replace(/"/g, '""')}",${r.pubmed_url}`
    ),
  ].join("\n");
  fs.writeFileSync(rejectedPath, rejectedCsv, "utf-8");
  console.log(`   Rejected saved to: ${rejectedPath}`);
}

main().catch(console.error);
