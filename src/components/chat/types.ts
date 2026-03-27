import type { ChatSession as DbChatSession, ChatSource } from "@/types/database";

export type ChatSession = Pick<DbChatSession, "id" | "title" | "protocol_id" | "created_at">;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Pick<ChatSource, "type" | "title">[];
  created_at?: string;
}
