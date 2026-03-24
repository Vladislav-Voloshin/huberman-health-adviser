export interface User {
  id: string;
  email: string;
  phone?: string;
  display_name?: string;
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
