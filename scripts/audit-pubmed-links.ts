/**
 * PubMed Link Auditor
 *
 * Extracts all PubMed URLs from protocol_tools.notes,
 * verifies each one exists via the PubMed API,
 * and generates a SQL script to remove invalid links.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ToolWithLinks {
  id: string;
  title: string;
  notes: string;
  protocol_id: string;
}

interface LinkInfo {
  toolId: string;
  toolTitle: string;
  label: string;
  url: string;
  pmid: string;
}

function extractPubMedLinks(notes: string): { label: string; url: string; pmid: string }[] {
  const links: { label: string; url: string; pmid: string }[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?)\)/g;
  let match;
  while ((match = regex.exec(notes)) !== null) {
    links.push({ label: match[1], url: match[2], pmid: match[3] });
  }
  return links;
}

async function verifyPmid(pmid: string): Promise<{ valid: boolean; title?: string }> {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
    const res = await fetch(url);
    if (!res.ok) return { valid: false };

    const data = await res.json();
    const result = data?.result?.[pmid];
    if (!result || result.error) return { valid: false };

    return { valid: true, title: result.title };
  } catch {
    return { valid: false };
  }
}

function removeLinkFromNotes(notes: string, url: string): string {
  // Remove the markdown link line containing this URL
  const lines = notes.split("\n");
  const filtered = lines.filter((line) => !line.includes(url));
  let result = filtered.join("\n");
  // Clean up empty evidence section if no links remain
  if (!result.includes("pubmed.ncbi.nlm.nih.gov") && !result.includes("examine.com")) {
    result = result.replace(/\*\*Evidence:\*\*\s*\n?/g, "").trim();
  }
  return result;
}

async function main() {
  console.log("Fetching all protocol tools with notes...\n");

  const { data: tools, error } = await supabase
    .from("protocol_tools")
    .select("id, title, notes, protocol_id")
    .not("notes", "is", null);

  if (error) {
    console.error("Error fetching tools:", error);
    process.exit(1);
  }

  // Extract all PubMed links
  const allLinks: LinkInfo[] = [];
  for (const tool of tools as ToolWithLinks[]) {
    if (!tool.notes) continue;
    const links = extractPubMedLinks(tool.notes);
    for (const link of links) {
      allLinks.push({
        toolId: tool.id,
        toolTitle: tool.title,
        ...link,
      });
    }
  }

  console.log(`Found ${allLinks.length} PubMed links across ${tools.length} tools\n`);

  // Verify each link (with rate limiting — PubMed allows 3 req/sec without API key)
  const invalid: LinkInfo[] = [];
  const valid: (LinkInfo & { actualTitle: string })[] = [];
  const mismatched: (LinkInfo & { actualTitle: string })[] = [];

  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i];
    process.stdout.write(`[${i + 1}/${allLinks.length}] Checking PMID ${link.pmid}... `);

    const result = await verifyPmid(link.pmid);

    if (!result.valid) {
      console.log("INVALID");
      invalid.push(link);
    } else {
      console.log(`OK — "${result.title?.substring(0, 60)}..."`);
      valid.push({ ...link, actualTitle: result.title || "" });
    }

    // Rate limit: 3 requests per second
    if ((i + 1) % 3 === 0) {
      await new Promise((r) => setTimeout(r, 1100));
    }
  }

  // Summary
  console.log("\n=== AUDIT SUMMARY ===");
  console.log(`Total PubMed links: ${allLinks.length}`);
  console.log(`Valid: ${valid.length}`);
  console.log(`Invalid (404/not found): ${invalid.length}`);

  if (invalid.length > 0) {
    console.log("\n=== INVALID LINKS ===");
    for (const link of invalid) {
      console.log(`  Tool: "${link.toolTitle}"`);
      console.log(`  Label: ${link.label}`);
      console.log(`  URL: ${link.url}`);
      console.log(`  PMID: ${link.pmid}`);
      console.log();
    }

    // Generate SQL to clean up invalid links
    console.log("\n=== SQL CLEANUP SCRIPT ===");
    console.log("-- Run this in Supabase SQL editor to remove invalid PubMed links\n");

    // Group by tool to update each tool's notes once
    const toolUpdates = new Map<string, { toolId: string; notes: string }>();
    for (const link of invalid) {
      const tool = (tools as ToolWithLinks[]).find((t) => t.id === link.toolId)!;
      const existing = toolUpdates.get(link.toolId);
      const currentNotes = existing ? existing.notes : tool.notes;
      const updatedNotes = removeLinkFromNotes(currentNotes, link.url);
      toolUpdates.set(link.toolId, { toolId: link.toolId, notes: updatedNotes });
    }

    for (const [toolId, update] of toolUpdates) {
      const escapedNotes = update.notes.replace(/'/g, "''");
      console.log(`UPDATE protocol_tools SET notes = '${escapedNotes}' WHERE id = '${toolId}';`);
    }
  }

  if (invalid.length === 0) {
    console.log("\nAll PubMed links are valid!");
  }
}

main().catch(console.error);
