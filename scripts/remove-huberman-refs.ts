/**
 * Remove Huberman references from protocol_tools
 * Replaces with generic "research-based" language
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function deHuberman(text: string): string {
  return text
    .replace(/Dr\.?\s*Huberman('s)?/gi, "research")
    .replace(/Andrew\s*Huberman('s)?/gi, "research")
    .replace(/Huberman\s*Lab('s)?/gi, "research")
    .replace(/Huberman('s)?/gi, "research")
    .replace(/research research/gi, "research")
    .replace(/research\s+protocol/gi, "evidence-based protocol")
    .replace(/research\s+recommends/gi, "evidence suggests");
}

async function main() {
  const { data: tools, error } = await supabase
    .from("protocol_tools")
    .select("id, title, description, instructions, notes")
    .or("title.ilike.%huberman%,description.ilike.%huberman%,instructions.ilike.%huberman%,notes.ilike.%huberman%");

  if (error) { console.error(error); process.exit(1); }

  console.log(`Found ${tools.length} tools with Huberman references\n`);

  for (const tool of tools) {
    const updates: Record<string, string> = {};
    for (const field of ["title", "description", "instructions", "notes"] as const) {
      if (tool[field] && /huberman/i.test(tool[field])) {
        updates[field] = deHuberman(tool[field]);
        console.log(`  ${tool.title} [${field}]: "${tool[field].substring(0, 80)}..." → "${updates[field].substring(0, 80)}..."`);
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("protocol_tools")
        .update(updates)
        .eq("id", tool.id);
      if (updateError) console.error(`  Error:`, updateError.message);
      else console.log(`  Updated "${tool.title}"\n`);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
