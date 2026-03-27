import { NextRequest } from "next/server";
import { requireAuth, apiError, handleApiError } from "@/lib/api/helpers";
import { queryVectors } from "@/lib/pinecone/client";
import { getEmbedding, getAnthropicClient } from "@/lib/pinecone/embeddings";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getRequestId } from "@/lib/api/request-id";
import logger from "@/lib/logger";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_TURNS = 20;

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = logger.child({ requestId, route: "POST /api/chat" });

  try {
    const { user, supabase } = await requireAuth();
    log.info({ userId: user.id }, "Chat request received");

    const rateLimited = await checkRateLimit(user.id, supabase);
    if (rateLimited) return rateLimited;

    const { message, session_id, protocol_id } = await request.json();

    // Input validation
    if (typeof message !== "string" || !message.trim()) {
      return apiError("Message is required", 400);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return apiError(`Message must be under ${MAX_MESSAGE_LENGTH} characters`, 400);
    }
    const trimmedMessage = message.trim();

    // Create or get session
    let currentSessionId = session_id;
    if (!currentSessionId) {
      const { data: session, error: sessionErr } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: trimmedMessage.slice(0, 50),
          protocol_id: protocol_id || null,
        })
        .select("id")
        .single();

      if (sessionErr || !session) {
        return apiError("Failed to create chat session", 500);
      }
      currentSessionId = session.id;
    }

    // Save user message
    const { error: insertErr } = await supabase.from("chat_messages").insert({
      session_id: currentSessionId,
      role: "user",
      content: trimmedMessage,
    });
    if (insertErr) {
      log.error({ err: insertErr }, "Failed to save user message");
    }

    // Fetch conversation history for multi-turn context
    const history = await fetchConversationHistory(supabase, currentSessionId);

    // Get relevant context via RAG
    const { contextText, sources } = await fetchRAGContext(trimmedMessage, log);

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

    // Build messages array with history + current message
    const messages: { role: "user" | "assistant"; content: string }[] = [
      ...history,
      { role: "user", content: trimmedMessage },
    ];

    // Stream response using SSE
    const anthropic = getAnthropicClient();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        let streamFailed = false;

        try {
          const response = anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages,
          });

          // Send meta (session_id + sources) only after stream starts successfully
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "meta", session_id: currentSessionId, sources })}\n\n`
            )
          );

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
          streamFailed = true;
          log.error({ err }, "Stream error");
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: "Failed to generate response" })}\n\n`
            )
          );
        }

        // Only save assistant message if we got actual content
        if (fullContent) {
          const { error: saveErr } = await supabase.from("chat_messages").insert({
            session_id: currentSessionId,
            role: "assistant",
            content: fullContent,
            sources: streamFailed ? undefined : sources,
          });
          if (saveErr) {
            log.error({ err: saveErr }, "Failed to save assistant message");
          }
        }

        // Always update session timestamp
        const { error: updateErr } = await supabase
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", currentSessionId);
        if (updateErr) {
          log.error({ err: updateErr }, "Failed to update session timestamp");
        }

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
    return handleApiError(err, requestId);
  }
}

/** Fetch prior messages in this session to provide multi-turn context. */
async function fetchConversationHistory(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  sessionId: string
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY_TURNS * 2);

  if (error || !data) return [];

  return data
    .filter((m) => m.content && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

/** Fetch RAG context from Pinecone for the given query. */
async function fetchRAGContext(query: string, log: Pick<typeof logger, "warn">) {
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
    log.warn({ err }, "RAG unavailable");
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
