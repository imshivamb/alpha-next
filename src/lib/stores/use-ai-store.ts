import { create } from 'zustand'
import AIService from '../services/ai-service'
import { 
  AIProcessRequest, 
  AIResponse,
  AIUsage, 
  AudienceAnalysisResponse, 
  FinalAnalysisResult, 
  CopywriterSuggestion, 
  SmartSuggestion
} from '../types/ai'

interface AIState {
  audienceAnalysisResult: AudienceAnalysisResponse | null
  finalAnalysisResult: FinalAnalysisResult | null
  copywriterSuggestions: CopywriterSuggestion[] | null
  smartSuggestions: SmartSuggestion[] | null
  aiUsage: AIUsage | null
  isLoading: boolean
  error: string | null
  
  process: (request: AIProcessRequest) => Promise<AIResponse | null>
  
  getAudienceAnalysis: (content: string, audiences: string[]) => Promise<AudienceAnalysisResponse | null>
  getFinalAnalysis: (content: string, brief: Record<string, unknown>) => Promise<FinalAnalysisResult | null>
  getCopywriterSuggestions: (content: string, feedback: string) => Promise<CopywriterSuggestion[] | null>
  getSmartSuggestions: (surrounding_content: string, selected_text: string) => Promise<SmartSuggestion[] | null>
  getUsage: () => Promise<AIUsage | null>
  resetResults: () => void
}

export const useAIStore = create<AIState>((set) => ({
  audienceAnalysisResult: null,
  finalAnalysisResult: null,
  copywriterSuggestions: null,
  smartSuggestions: null,
  aiUsage: null,
  isLoading: false,
  error: null,
  
  process: async (request: AIProcessRequest) => {
    try {
      set({ isLoading: true, error: null })
      const result = await AIService.process(request)
      set({ isLoading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'AI processing failed'
      
      set({ 
        isLoading: false, 
        error: errorMessage
      })
      return null
    }
  },
  
  getAudienceAnalysis: async (content: string, audiences: string[]) => {
    try {
      set({ isLoading: true, error: null })
      const result = await AIService.audienceAnalysis(content, audiences)
      set({ audienceAnalysisResult: result, isLoading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Audience analysis failed'
      
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  getFinalAnalysis: async (content: string, brief: Record<string, unknown>) => {
    try {
      set({ isLoading: true, error: null })
      const result = await AIService.finalAnalysis(content, brief)
      set({ finalAnalysisResult: result, isLoading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Final analysis failed'
      
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  getCopywriterSuggestions: async (content: string, feedback: string) => {
    try {
      set({ isLoading: true, error: null })
      const suggestions = await AIService.copywriter(content, feedback)
      set({ copywriterSuggestions: suggestions, isLoading: false })
      return suggestions
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Copywriter suggestions failed'
      
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  getSmartSuggestions: async (surrounding_content: string, selected_text: string) => {
    try {
      set({ isLoading: true, error: null })
      const suggestions = await AIService.smartSuggestions(surrounding_content, selected_text)
      set({ smartSuggestions: suggestions, isLoading: false })
      return suggestions
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Smart suggestions failed'
      
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  getUsage: async () => {
    try {
      set({ isLoading: true, error: null })
      const usage = await AIService.getUsage()
      set({ aiUsage: usage, isLoading: false })
      return usage
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to retrieve AI usage information'
      
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  resetResults: () => {
    set({
      audienceAnalysisResult: null,
      finalAnalysisResult: null,
      copywriterSuggestions: null,
      smartSuggestions: null
    })
  }
})) 