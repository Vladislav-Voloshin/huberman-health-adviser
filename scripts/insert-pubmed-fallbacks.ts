/**
 * PubMed Fallback Insert Script
 *
 * For tools that were rejected at rank-1, check if rank-2 or rank-3
 * results are more relevant, and insert those instead.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { fields.push(current); current = ""; }
      else { current += char; }
    }
    fields.push(current);
    if (fields.length >= 12) {
      rows.push({
        tool_id: fields[0], tool_title: fields[1], rank: parseInt(fields[5]),
        pmid: fields[6], paper_title: fields[7], authors: fields[8],
        journal: fields[9], year: fields[10], pubmed_url: fields[11],
      });
    }
  }
  return rows;
}

function getKeywords(title: string): string[] {
  return title.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function isRelevant(toolTitle: string, paperTitle: string): boolean {
  const keywords = getKeywords(toolTitle);
  const paperLower = paperTitle.toLowerCase();
  return keywords.some((kw) => paperLower.includes(kw));
}

async function main() {
  // Read rejected tool IDs
  const rejectedPath = path.join(__dirname, "output", "pubmed-rejected.csv");
  const rejectedContent = fs.readFileSync(rejectedPath, "utf-8");
  const rejectedToolIds = new Set(
    rejectedContent.trim().split("\n").slice(1).map((line) => {
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === "," && !inQuotes) { fields.push(current); current = ""; }
        else { current += char; }
      }
      fields.push(current);
      return fields[0];
    })
  );

  // Read full proposals
  const csvPath = path.join(__dirname, "output", "pubmed-proposals.csv");
  const allRows = parseCsv(fs.readFileSync(csvPath, "utf-8"));

  // For each rejected tool, try rank 2 then rank 3
  let inserted = 0;
  let stillRejected = 0;

  for (const toolId of rejectedToolIds) {
    const candidates = allRows
      .filter((r) => r.tool_id === toolId && r.rank > 1)
      .sort((a, b) => a.rank - b.rank);

    let found = false;
    for (const row of candidates) {
      if (isRelevant(row.tool_title, row.paper_title)) {
        // Check current notes
        const { data: tool } = await supabase
          .from("protocol_tools")
          .select("notes")
          .eq("id", row.tool_id)
          .single();

        if (!tool || (tool.notes || "").includes("pubmed.ncbi.nlm.nih.gov")) {
          found = true;
          break;
        }

        const shortAuthors = row.authors.length > 40
          ? row.authors.slice(0, 37) + "..." : row.authors;
        const citation = `\n\n**Reference:** [${shortAuthors} (${row.year}). ${row.paper_title}](${row.pubmed_url})`;

        const { error } = await supabase
          .from("protocol_tools")
          .update({ notes: (tool.notes || "").trimEnd() + citation })
          .eq("id", row.tool_id);

        if (!error) {
          inserted++;
          console.log(`  ✅ "${row.tool_title}" → rank ${row.rank}: "${row.paper_title}"`);
        }
        found = true;
        break;
      }
    }

    if (!found) stillRejected++;
  }

  console.log(`\n✅ Fallback done!`);
  console.log(`   Additional citations inserted: ${inserted}`);
  console.log(`   Still without citation: ${stillRejected}`);
}

main().catch(console.error);
