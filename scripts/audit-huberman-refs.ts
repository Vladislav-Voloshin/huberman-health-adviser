/**
 * Audit Huberman references in database content
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Check protocols table
  const { data: protocols } = await supabase
    .from("protocols")
    .select("id, title, description")
    .or("title.ilike.%huberman%,description.ilike.%huberman%");

  console.log(`Protocols mentioning Huberman: ${protocols?.length || 0}`);
  protocols?.forEach((p) => console.log(`  - ${p.title}`));

  // Check protocol_tools table
  const { data: tools } = await supabase
    .from("protocol_tools")
    .select("id, title, description, instructions, notes")
    .or("title.ilike.%huberman%,description.ilike.%huberman%,instructions.ilike.%huberman%,notes.ilike.%huberman%");

  console.log(`\nProtocol tools mentioning Huberman: ${tools?.length || 0}`);
  tools?.forEach((t) => console.log(`  - ${t.title}`));

  // Check knowledge_base chunks
  const { data: chunks } = await supabase
    .from("knowledge_base")
    .select("id, title, source_type")
    .ilike("title", "%huberman%");

  console.log(`\nKnowledge base chunks with Huberman in title: ${chunks?.length || 0}`);

  // Check chat system prompt references
  const { data: allChunks, count } = await supabase
    .from("knowledge_base")
    .select("id", { count: "exact", head: true })
    .ilike("content", "%huberman%");

  console.log(`Knowledge base chunks with Huberman in content: ${count || 0}`);
}

main().catch(console.error);
