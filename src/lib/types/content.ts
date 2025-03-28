export interface ContentBrief {
  id: number
  user_id: number
  title: string
  content: string
  parsed_data: ParsedBriefData
  filename?: string
  file_type?: string
  created_at: string
  updated_at: string
}

export interface ParsedBriefData {
  title?: string
  description?: string
  audience?: Record<string, string>
  goals?: Record<string, string>
  content_direction?: string
  subject_matter_context?: string
  voice_tone?: Record<string, string>
  content_structure?: Record<string, string | object>
  example_topics?: string[]
  dos_and_donts?: {
    dos?: string[]
    donts?: string[]
    [key: string]: string[] | undefined
  }
  content_format?: Record<string, string | object>
  [key: string]: unknown
}

export interface ContentAngle {
  id: number
  user_id: number
  brief_id: number
  post_type: string
  content_pillar: string
  hook: string
  angle_description: string
  is_selected: boolean
  created_at: string
}

export interface Draft {
  id: number
  user_id: number
  brief_id: number
  angle_id?: number
  content: string
  version: number
  ai_feedback?: string
  created_at: string
  updated_at: string
}

export interface CalendarEntry {
  id: number
  user_id: number
  title: string
  date: string
  time: string
  status: string
  brief_id?: number
  angle_id?: number
  entry_metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: number
  draft_id: number
  scheduled_date: string
  scheduled_time: string
  platform: string
  status: string
  created_at: string
  updated_at: string
}

export interface ContentError {
  message: string
  code?: string
}

export interface DraftEnhanceOptions {
  tone?: string
  length?: string
  improve_hook?: boolean
  suggested_changes?: string[]
}

export interface EnhanceDraftRequest {
  draft_content: string
  tone?: string
  length?: string
  improve_hook?: boolean
  suggested_changes?: string[]
} 