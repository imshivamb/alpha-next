import apiClient from '../api-client'
import {
  AIProcessRequest,
  AIResponse,
  AIUsage,
  AudienceAnalysisResult,
  AudienceSegment,
  FinalAnalysisResult,
  CopywriterSuggestion,
  SmartSuggestion,
  ContentAngleSuggestionsResponse,
  DraftContentResponse,
  EnhanceDraftResponse,
  AudienceAnalysisResponse
} from '../types/ai'

const AIService = {
  process: async (request: AIProcessRequest): Promise<AIResponse> => {
    const response = await apiClient.post('/ai/process', request)
    return response.data
  },
  
  generateContentAngles: async (
    briefId: number,
    options: Record<string, unknown> = {}
  ): Promise<ContentAngleSuggestionsResponse> => {
    const request: AIProcessRequest = {
      operation_type: 'generate_content_angles',
      context_data: {
        brief_id: briefId,
        ...options
      }
    }
    const response = await apiClient.post('/ai/process', request)
    return response.data
  },
  
  generateDraftContent: async (
    briefId: number,
    angleId?: number,
    options: Record<string, unknown> = {}
  ): Promise<DraftContentResponse> => {
    const request: AIProcessRequest = {
      operation_type: 'draft_content',
      context_data: {
        brief_id: briefId,
        angle_id: angleId,
        ...options
      }
    }
    const response = await apiClient.post('/ai/process', request)
    return response.data
  },
  
  enhanceDraft: async (
    draftContent: string,
    options: Record<string, unknown> = {}
  ): Promise<EnhanceDraftResponse> => {
    const request: AIProcessRequest = {
      operation_type: 'enhance_draft',
      context_data: {
        draft_content: draftContent,
        ...options
      }
    }
    const response = await apiClient.post('/ai/process', request)
    return response.data
  },
  
  audienceAnalysis: async (
    content: string, 
    audiences: string[]
  ): Promise<AudienceAnalysisResponse> => {
    if (!content || content.trim() === '') {
      throw new Error('Content is required for audience analysis')
    }
    
    if (!audiences || audiences.length === 0) {
      throw new Error('At least one audience is required')
    }
    
    const payload = {
      content,
      primary_audience: audiences[0],
      secondary_audience: audiences.length > 1 ? audiences[1] : undefined
    }
    
    try {
      const response = await apiClient.post('/ai/audience-analysis', payload)
      return response.data
    } catch (error) {
      console.error('Audience analysis error:', error)
      // Return a minimal fallback structure
      return {
        analyses: [
          {
            segment: audiences[0],
            score: 6,
            strengths: ['Content is generally well-structured'],
            weaknesses: ['Could be more specific to this audience'],
            suggestions: ['Consider adding targeted examples']
          }
        ]
      }
    }
  },
  
  finalAnalysis: async (
    content: string, 
    brief: Record<string, unknown>
  ): Promise<FinalAnalysisResult> => {
    if (!content || content.trim() === '') {
      throw new Error('Content is required for final analysis')
    }
    
    try {
      const response = await apiClient.post('/ai/final-analysis', {
        content,
        brief_title: brief.title || "",
        brief_description: brief.description || "",
        brief_audience: brief.audience || "",
        brief_goals: brief.goals || []
      })

      // Direct response from backend - no need to unwrap from result field
      return response.data;
    } catch (error) {
      console.error('Error getting final analysis:', error);
      // Return fallback data
      return {
        overall_score: 6,
        summary: "We couldn't perform a complete analysis at this time.",
        strengths: ["Your content has been saved and is ready for editing."],
        weaknesses: ["We couldn't analyze your content in detail."],
        suggestions: ["Try again later or contact support if the issue persists."]
      };
    }
  },
  
  copywriter: async (
    content: string, 
    feedback: string
  ): Promise<CopywriterSuggestion[]> => {
    try {
      const response = await apiClient.post('/ai/copywriter', { content, feedback })
      const data = response.data
      
      // If it's a direct raw response
      if (data && typeof data.raw_response === 'string') {
        return [{
          original: content,
          suggestion: 'Content has been updated',
          explanation: data.explanation || 'Content has been improved based on your feedback',
          raw_response: data.raw_response
        }]
      }
      
      // Return the suggestions array
      return data || []
    } catch (error) {
      console.error('Copywriter error:', error)
      // Return a fallback response
      return [{
        original: content,
        suggestion: 'Unable to generate suggestion',
        explanation: 'An error occurred while generating suggestions',
        raw_response: content
      }]
    }
  },
  
  smartSuggestions: async (
    surrounding_content: string, 
    selected_text: string
  ): Promise<SmartSuggestion[]> => {
    if (!selected_text || selected_text.trim() === '') {
      throw new Error('Selected text is required for smart suggestions')
    }
    
    try {
      const response = await apiClient.post('/ai/smart-suggestions', { 
        selected_text, 
        surrounding_content 
      })
      
      // Return the suggestions array
      return response.data.suggestions || []
    } catch (error) {
      console.error('Smart suggestions error:', error)
      return [] // Return empty array on error
    }
  },
  
  getUsage: async (): Promise<AIUsage> => {
    const response = await apiClient.get('/ai/rate-limit/usage')
    return response.data
  }
}

export default AIService 