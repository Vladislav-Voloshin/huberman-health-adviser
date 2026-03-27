import { NextRequest } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/helpers";
import { queryVectors } from "@/lib/pinecone/client";
import { getEmbedding, getAnthropicClient } from "@/lib/pinecone/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    const { message, session_id, protocol_id } = await request.json();

    // Create or get session
    let currentSessionId = session_id;
    if (!currentSessionId) {
      const { data: session, error: sessionErr } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: message.slice(0, 50),
          protocol_id: protocol_id || null,
        })
        .select("id")
        .single();

      if (sessionErr || !session) {
        return new Response(JSON.stringify({ error: "Failed to create chat session" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      currentSessionId = session.id;
    }

    // Save user message
    await supabase.from("chat_messages").insert({
      session_id: currentSessionId,
      role: "user",
      content: message,
    });

    // Get relevant context via RAG
    const { contextText, sources } = await fetchRAGContext(message);

    // Build system prompt
    let systemPrompt = buildSystemPrompt(contextText);

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

    // Stream response using SSE
    const anthropic = getAnthropicClient();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "meta", session_id: currentSessionId, sources })}\n\n`
          )
        );

        let fullContent = "";

        try {
          const response = anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: message }],
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullContent += text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", text })}\n\n`
                )
              );
            }
          }
        } catch (err) {
          console.error("[Chat] Stream error:", err instanceof Error ? err.message : err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: "Failed to generate response" })}\n\n`
            )
          );
        }

        // Save assistant message and update session timestamp for recency sorting
        await Promise.all([
          supabase.from("chat_messages").insert({
            session_id: currentSessionId,
            role: "assistant",
            content: fullContent,
            sources,
          }),
          supabase
            .from("chat_sessions")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", currentSessionId),
        ]);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/** Fetch RAG context from Pinecone for the given query. */
async function fetchRAGContext(query: string) {
  let contextText = "";
  let sources: { type: string; title: string; chunk_id: string }[] = [];

  try {
    const embedding = await getEmbedding(query);
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
  } catch (err) {
    console.warn("[Chat] RAG unavailable:", err instanceof Error ? err.message : err);
  }

  return { contextText, sources };
}

/** Build the system prompt with optional RAG context. */
function buildSystemPrompt(contextText: string): string {
  let prompt = `You are Craftwell, a science-based health adviser.
You provide evidence-based, practical health advice drawn from neuroscience and peer-reviewed research.

Key guidelines:
- Be practical and actionable — give specific tools and protocols
- Rank recommendations from most effective to least effective when possible
- Keep references subtle — mention "research shows" or "evidence suggests" rather than specific episode numbers
- Always include safety disclaimers for supplements, exercise, or medical topics
- If asked about something outside your knowledge, say so honestly
- Be concise but thorough`;

  if (contextText) {
    prompt += `\n\nRelevant context from the knowledge base:\n${contextText}`;
  }

  return prompt;
}
