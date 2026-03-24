import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { queryVectors } from "@/lib/pinecone/client";
import { getEmbedding, getAnthropicClient } from "@/lib/pinecone/embeddings";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, session_id, protocol_id } = await request.json();

  // Create or get session
  let currentSessionId = session_id;
  if (!currentSessionId) {
    const { data: session } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        title: message.slice(0, 50),
        protocol_id: protocol_id || null,
      })
      .select("id")
      .single();
    currentSessionId = session?.id;
  }

  // Save user message
  await supabase.from("chat_messages").insert({
    session_id: currentSessionId,
    role: "user",
    content: message,
  });

  // Get relevant context via RAG
  let contextText = "";
  let sources: { type: string; title: string; chunk_id: string }[] = [];

  try {
    const embedding = await getEmbedding(message);
    const matches = await queryVectors(embedding, 5);

    sources = matches.map((m) => ({
      type: (m.metadata?.source_type as string) || "unknown",
      title: (m.metadata?.source_title as string) || "Unknown source",
      chunk_id: m.id,
    }));

    contextText = matches
      .map((m) => m.metadata?.content || "")
      .filter(Boolean)
      .join("\n\n---\n\n");
  } catch {
    // RAG not available yet, proceed without context
  }

  // Build system prompt
  let systemPrompt = `You are a health adviser powered by the Huberman Lab podcast and related research.
You provide evidence-based, practical health advice drawn from neuroscience and peer-reviewed research discussed by Dr. Andrew Huberman.

Key guidelines:
- Be practical and actionable — give specific tools and protocols
- Rank recommendations from most effective to least effective when possible
- Keep references subtle — mention "research shows" or "evidence suggests" rather than specific episode numbers
- Always include safety disclaimers for supplements, exercise, or medical topics
- If asked about something outside your knowledge, say so honestly
- Be concise but thorough`;

  if (contextText) {
    systemPrompt += `\n\nRelevant context from the knowledge base:\n${contextText}`;
  }

  // Get protocol context if starting from a protocol
  if (protocol_id) {
    const { data: protocol } = await supabase
      .from("protocols")
      .select("title, description")
      .eq("id", protocol_id)
      .single();

    if (protocol) {
      systemPrompt += `\n\nThe user is asking about the "${protocol.title}" protocol: ${protocol.description}`;
    }
  }

  // Call Claude
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  });

  const assistantContent =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Save assistant message
  await supabase.from("chat_messages").insert({
    session_id: currentSessionId,
    role: "assistant",
    content: assistantContent,
    sources,
  });

  return NextResponse.json({
    response: assistantContent,
    sources,
    session_id: currentSessionId,
  });
}
