import apiClient from '../api-client'
import {
  AIProcessRequest,
  AIResponse,
  AIUsage,
  AudienceAnalysisResult,
  FinalAnalysisResult,
  CopywriterSuggestion,
  SmartSuggestion,
  ContentAngleSuggestionsResponse,
  DraftContentResponse,
  EnhanceDraftResponse
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
  ): Promise<Record<string, AudienceAnalysisResult>> => {
    const response = await apiClient.post('/ai/audience-analysis', { content, audiences })
    return response.data
  },
  
  finalAnalysis: async (
    content: string, 
    brief: Record<string, unknown>
  ): Promise<FinalAnalysisResult> => {
    const response = await apiClient.post('/ai/final-analysis', { content, brief })
    return response.data
  },
  
  copywriter: async (
    content: string, 
    feedback: string
  ): Promise<CopywriterSuggestion[]> => {
    const response = await apiClient.post('/ai/copywriter', { content, feedback })
    return response.data
  },
  
  smartSuggestions: async (
    content: string, 
    selection: string
  ): Promise<SmartSuggestion[]> => {
    const response = await apiClient.post('/ai/smart-suggestions', { content, selection })
    return response.data
  },
  
  getUsage: async (): Promise<AIUsage> => {
    const response = await apiClient.get('/ai/rate-limit/usage')
    return response.data
  }
}

export default AIService 