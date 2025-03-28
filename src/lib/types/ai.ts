export interface AIProcessRequest {
  operation_type: string
  context_data: Record<string, unknown>
}

export interface ContentBriefFile {
  title: string
  description?: string
  audience: Record<string, string>
  goals: Record<string, string>
  content_direction?: string
  subject_matter_context?: string
  voice_tone: Record<string, string>
  content_structure: Record<string, unknown>
  example_topics?: string[]
  dos_and_donts: Record<string, string[]>
  content_format: Record<string, unknown>
  experience_notes?: string[]
}

export interface LinkedInSpecifics {
  post_type: string
  hashtags: string[]
  best_time: string
  engagement_tips: string
}

export interface CalendarSuggestion {
  title: string
  summary: string
  scheduled_date: string
  content_type: string
  content_pillar: string
  linkedin_specific: LinkedInSpecifics
}

export interface CalendarSuggestionsResponse {
  suggestions: CalendarSuggestion[]
}

export interface ContentBrief {
  title: string
  description: string
  audience: string
  goals: string[]
  key_points?: string[]
  tone?: string
  post_type?: string
  content_pillar?: string
  core_perspective?: string
  evidence_examples?: string[]
  style?: string
  structure?: Record<string, unknown>
  hook_options?: string[]
  call_to_action?: string
  hashtags?: string[]
  post_length?: string
}

export interface ContentBriefResponse {
  brief: ContentBrief
}

export interface ContentAngleSuggestion {
  post_type: string
  content_pillar: string
  hook: string
  angle: string
}

export interface ContentAngleSuggestionsResponse {
  angles: ContentAngleSuggestion[]
  source?: string
}

export interface DraftContentResponse {
  content: string
  suggested_title?: string
  feedback?: string
}

export interface EnhanceDraftRequest {
  draft: string
  options: Record<string, unknown>
  brief?: Record<string, unknown>
  angle?: Record<string, unknown>
}

export interface EnhanceDraftResponse {
  content: string
  feedback: string
}

export interface AIUsage {
  current_usage: number
  limit: number
  reset_at: string
}

export interface AudienceStrength {
  point: string;
  explanation?: string;
  impact_score?: number;
  evidence?: string;
}

export interface AudienceWeakness {
  point: string;
  explanation?: string;
  severity_score?: number;
  impact?: string;
}

export interface AudienceSuggestion {
  suggestion: string;
  explanation?: string;
  priority?: string;
  expected_impact?: string;
  example?: string;
}

export interface AudienceSegment {
  segment: string;
  score: number;
  summary?: string;
  strengths: Array<string | AudienceStrength>;
  weaknesses: Array<string | AudienceWeakness>;
  suggestions: Array<string | AudienceSuggestion>;
  key_metrics?: Record<string, number>;
  engagement_prediction?: string;
}

export interface AudienceAnalysisResult {
  analyses: AudienceSegment[];
}

export interface AudienceAnalysisResponse {
  analyses: AudienceSegment[];
}

export interface ContentStrength {
  point: string;
  category?: string;
  explanation?: string;
  impact?: string;
  example?: string;
}

export interface ContentWeakness {
  point: string;
  category?: string;
  explanation?: string;
  impact?: string;
  example?: string;
}

export interface ContentSuggestion {
  suggestion: string;
  category?: string;
  implementation?: string;
  expected_outcome?: string;
  priority_level?: string;
  example?: string;
}

export interface MetricScore {
  category: string;
  score: number;
  assessment?: string;
}

export interface FinalAnalysisResult {
  overall_score: number;
  summary?: string;
  strengths: Array<string | ContentStrength>;
  weaknesses: Array<string | ContentWeakness>;
  suggestions: Array<string | ContentSuggestion>;
  metric_scores?: MetricScore[];
  target_audience_fit?: Record<string, unknown>;
  engagement_prediction?: string;
  content_grade?: string;
  comparison?: Record<string, unknown>;
}

export interface CopywriterSuggestion {
  original: string
  suggestion: string
  explanation: string
  raw_response?: string
}

export interface SmartSuggestion {
  original: string
  alternative: string
  explanation: string
  improvement_type?: string
  word_count_change?: number
  tone_shift?: string
  key_enhancements?: string[]
  target_impact?: string
}

export interface SmartSuggestionsResponse {
  suggestions: SmartSuggestion[]
}

export interface AIResponse {
  operation_type: string
  response_data: Record<string, unknown>
}

// Request interfaces for AI endpoints
export interface AudienceAnalysisRequest {
  content: string
  audiences: string[]
}

export interface FinalAnalysisRequest {
  content: string
  brief: Record<string, unknown>
}

export interface CopywriterRequest {
  content: string
  feedback: string
}

export interface SmartSuggestionsRequest {
  surrounding_content: string
  selected_text: string
} 