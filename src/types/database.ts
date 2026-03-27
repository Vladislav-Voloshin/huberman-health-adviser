export interface User {
  id: string;
  email: string;
  phone?: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  user_id: string;
  health_goals: string[];
  sleep_quality: number;
  exercise_frequency: string;
  stress_level: number;
  supplement_experience: string;
  focus_areas: string[];
  created_at: string;
}

export interface Protocol {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  effectiveness_rank: number;
  difficulty: 'easy' | 'moderate' | 'advanced';
  time_commitment: string;
  tools: ProtocolTool[];
  source_episodes: string[];
  source_type: 'podcast' | 'newsletter' | 'book' | 'research';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProtocolTool {
  id: string;
  protocol_id: string;
  title: string;
  description: string;
  instructions: string;
  effectiveness_rank: number;
  timing?: string;
  duration?: string;
  frequency?: string;
  notes?: string;
}

export interface ProtocolCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  protocol_count: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  protocol_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  created_at: string;
}

export interface ChatSource {
  type: 'podcast' | 'newsletter' | 'book' | 'research';
  title: string;
  chunk_id: string;
}

export interface ContentChunk {
  id: string;
  source_type: 'podcast' | 'newsletter' | 'book' | 'research';
  source_title: string;
  source_id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, string>;
  created_at: string;
}

export interface PodcastEpisode {
  id: string;
  episode_number: number;
  title: string;
  description: string;
  publish_date: string;
  duration_seconds: number;
  transcript?: string;
  guests: string[];
  topics: string[];
  url: string;
  ingested: boolean;
  created_at: string;
}

export interface Newsletter {
  id: string;
  title: string;
  publish_date: string;
  content: string;
  topics: string[];
  url?: string;
  ingested: boolean;
  created_at: string;
}

export interface UserProtocol {
  id: string;
  user_id: string;
  protocol_id: string;
  started_at: string;
  is_active: boolean;
}

export interface ProtocolCompletion {
  id: string;
  user_id: string;
  protocol_id: string;
  tool_id: string;
  completed_date: string;
  created_at: string;
}

export interface StreakData {
  streak: number;
  longest_streak: number;
  total_days: number;
}

// --- API Response Types ---

export interface SearchResponse {
  protocols: Protocol[];
  knowledge: KnowledgeResult[];
}

export interface KnowledgeResult {
  score: number;
  source_type: string;
  source_title: string;
  content: string;
}

export interface CompletionsResponse {
  completed_tool_ids: string[];
  date: string;
}

export interface CompletionToggleResponse {
  status: "completed" | "uncompleted";
}

export type StreakResponse = StreakData;

export interface ProfileResponse {
  profile: User | null;
  survey: SurveyResponse | null;
}

export interface ProfileUpdateRequest {
  profile?: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    age?: number | null;
  };
  survey?: {
    health_goals: string[];
    sleep_quality: number;
    exercise_frequency: string;
    stress_level: number;
    supplement_experience: string;
    focus_areas: string[];
  };
}

export interface UserProtocolAction {
  protocol_id: string;
  action: "activate" | "deactivate" | "remove";
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  protocol_id?: string;
}

export type ChatStreamEventType = "meta" | "text" | "error" | "done";
