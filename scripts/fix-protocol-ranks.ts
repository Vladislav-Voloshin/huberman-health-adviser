/**
 * Fix protocol effectiveness_rank — assign unique ranks per category
 * Run: npx tsx scripts/fix-protocol-ranks.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all protocols grouped by category
  const { data: protocols, error } = await supabase
    .from("protocols")
    .select("id, title, category, effectiveness_rank")
    .order("category")
    .order("created_at");

  if (error || !protocols) {
    console.error("Error fetching protocols:", error);
    return;
  }

  console.log(`Found ${protocols.length} protocols\n`);

  // Group by category and assign sequential ranks
  const byCategory: Record<string, typeof protocols> = {};
  for (const p of protocols) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  let updated = 0;
  for (const [category, categoryProtocols] of Object.entries(byCategory)) {
    console.log(`${category}: ${categoryProtocols.length} protocols`);

    for (let i = 0; i < categoryProtocols.length; i++) {
      const rank = i + 1;
      const p = categoryProtocols[i];

      if (p.effectiveness_rank !== rank) {
        const { error: updateError } = await supabase
          .from("protocols")
          .update({ effectiveness_rank: rank })
          .eq("id", p.id);

        if (updateError) {
          console.error(`  Error updating "${p.title}":`, updateError.message);
        } else {
          console.log(`  #${rank} ${p.title}`);
          updated++;
        }
      } else {
        console.log(`  #${rank} ${p.title} (unchanged)`);
      }
    }
  }

  console.log(`\nDone! Updated ${updated} protocol ranks.`);
}

main().catch(console.error);
