export interface ChatSession {
  id: string;
  title: string;
  protocol_id?: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { type: string; title: string }[];
  created_at?: string;
}
