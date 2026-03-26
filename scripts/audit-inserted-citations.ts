/**
 * Audit and remove poorly-matched PubMed citations.
 *
 * Checks each inserted citation for topic relevance using stricter
 * multi-keyword matching. Removes citations where the paper topic
 * clearly doesn't match the tool topic.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Known bad matches identified by manual review
const BAD_CITATION_PATTERNS = [
  // Topic mismatch - paper is about completely different subject
  { toolPattern: /magnesium.*stress/i, paperPattern: /marine algal|sea to relief/i },
  { toolPattern: /caffeine.*abstinence/i, paperPattern: /hypotension/i },
  { toolPattern: /tryptophan/i, paperPattern: /knockout mice/i },
  { toolPattern: /specific action step/i, paperPattern: /fibromyalgia|suicidal/i },
  { toolPattern: /incremental learning/i, paperPattern: /firefighter|physical fatigue/i },
  { toolPattern: /limit alcohol.*caffeine/i, paperPattern: /prenatal|adolescents/i },
  { toolPattern: /priority goal/i, paperPattern: /healthy aging/i },
  { toolPattern: /embrace learning errors/i, paperPattern: /change of mind/i },
  { toolPattern: /cold air exposure/i, paperPattern: /weather-related mortality/i },
  { toolPattern: /body posture/i, paperPattern: /vibrotactile/i },
  { toolPattern: /visual target focus/i, paperPattern: /food-related.*obesity/i },
  { toolPattern: /5-minute.*stress/i, paperPattern: /prazosin.*craving.*alcohol/i },
  { toolPattern: /incremental learning blocks/i, paperPattern: /many-layered/i },
  { toolPattern: /brain cooling/i, paperPattern: /exercise-induced hyperthermia/i },
  { toolPattern: /baseline dopamine/i, paperPattern: /memantine/i },
  { toolPattern: /cognitive warm-up/i, paperPattern: /soccer/i },
  { toolPattern: /social connection/i, paperPattern: /peer-to-peer.*social media/i },
  { toolPattern: /avoid alcohol during stress/i, paperPattern: /university students/i },
  { toolPattern: /consistent early bedtime/i, paperPattern: /early brain development/i },
  { toolPattern: /cool bedroom temperature/i, paperPattern: /heated breathing tube/i },
  { toolPattern: /dora sleep/i, paperPattern: /delirium/i },
  { toolPattern: /enhanced cooling/i, paperPattern: /game day priming/i },
  { toolPattern: /vitamin d3/i, paperPattern: /asthma/i },
  { toolPattern: /red light device/i, paperPattern: /color vision/i },
  { toolPattern: /protein-rich morning/i, paperPattern: /consumeer/i },
  { toolPattern: /hormone replacement.*consultation/i, paperPattern: /breast cancer/i },
  { toolPattern: /emdr/i, paperPattern: /met.*t.*a protocol/i },
  { toolPattern: /cool sleep environment/i, paperPattern: /military personnel|bed socks/i },
  { toolPattern: /hot bath protocol/i, paperPattern: /rate of force/i },
  { toolPattern: /resveratrol/i, paperPattern: /bone mineral density/i },
];

interface ToolWithCitation {
  id: string;
  title: string;
  notes: string;
}

async function main() {
  const { data: tools } = await supabase
    .from("protocol_tools")
    .select("id, title, notes")
    .like("notes", "%pubmed.ncbi.nlm.nih.gov%");

  if (!tools) {
    console.error("Failed to fetch tools");
    return;
  }

  console.log(`Tools with PubMed citations: ${tools.length}`);

  let removed = 0;
  let kept = 0;

  for (const tool of tools as ToolWithCitation[]) {
    const citationMatch = tool.notes.match(
      /\n\n\*\*Reference:\*\* \[(.+?)\]\(https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/\)/
    );

    if (!citationMatch) {
      kept++;
      continue;
    }

    const paperText = citationMatch[1];
    let isBad = false;

    for (const pattern of BAD_CITATION_PATTERNS) {
      if (pattern.toolPattern.test(tool.title) && pattern.paperPattern.test(paperText)) {
        isBad = true;
        break;
      }
    }

    if (isBad) {
      // Remove the citation from notes
      const cleanNotes = tool.notes
        .replace(/\n\n\*\*Reference:\*\* \[.+?\]\(https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/\)/, "")
        .trimEnd();

      const { error } = await supabase
        .from("protocol_tools")
        .update({ notes: cleanNotes })
        .eq("id", tool.id);

      if (!error) {
        console.log(`  ❌ Removed: "${tool.title}" ← "${paperText.slice(0, 80)}..."`);
        removed++;
      }
    } else {
      kept++;
    }
  }

  console.log(`\n✅ Audit complete!`);
  console.log(`   Kept: ${kept}`);
  console.log(`   Removed (bad match): ${removed}`);
  console.log(`   Remaining citations: ${kept}`);
}

main().catch(console.error);
