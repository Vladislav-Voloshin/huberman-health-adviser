/**
 * Remove All PubMed Links from protocol_tools.notes
 *
 * Since the AI-generated PubMed links point to real but unrelated papers,
 * we strip all PubMed markdown links from notes. Examine.com links are kept
 * as they tend to be more generic/correct.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanNotes(notes: string): string {
  const lines = notes.split("\n");
  const cleaned = lines.filter((line) => {
    // Remove lines that are PubMed markdown links
    if (line.match(/\[.*\]\(https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+/)) {
      return false;
    }
    return true;
  });

  let result = cleaned.join("\n").trim();

  // Remove empty evidence section header if no links remain
  if (!result.includes("examine.com") && !result.includes("Examine.com")) {
    result = result.replace(/\*\*Evidence:\*\*\s*/g, "").trim();
  }

  // Clean up trailing newlines
  result = result.replace(/\n{3,}/g, "\n\n").trim();

  return result;
}

async function main() {
  console.log("Fetching all protocol tools with notes containing PubMed links...\n");

  const { data: tools, error } = await supabase
    .from("protocol_tools")
    .select("id, title, notes")
    .not("notes", "is", null)
    .like("notes", "%pubmed.ncbi.nlm.nih.gov%");

  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }

  console.log(`Found ${tools.length} tools with PubMed links\n`);

  let updated = 0;
  for (const tool of tools) {
    const cleaned = cleanNotes(tool.notes);
    if (cleaned !== tool.notes) {
      const { error: updateError } = await supabase
        .from("protocol_tools")
        .update({ notes: cleaned || null })
        .eq("id", tool.id);

      if (updateError) {
        console.error(`  Error updating "${tool.title}":`, updateError.message);
      } else {
        updated++;
        console.log(`  Updated: "${tool.title}"`);
      }
    }
  }

  console.log(`\nDone. Updated ${updated}/${tools.length} tools.`);
  console.log("All fake PubMed links have been removed.");
}

main().catch(console.error);
