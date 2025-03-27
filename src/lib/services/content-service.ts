import apiClient from '../api-client'
import {
  ContentBrief,
  ContentAngle,
  Draft,
  CalendarEntry,
  ScheduledPost,
  DraftEnhanceOptions,
  EnhanceDraftRequest
} from '../types/content'

const ContentService = {
  // Content Brief APIs
  uploadContentBrief: async (userId: number, file: File): Promise<ContentBrief> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post(
      `/content/${userId}/brief`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response.data
  },
  
  getContentBrief: async (userId: number): Promise<ContentBrief> => {
    const response = await apiClient.get(`/content/${userId}/brief`)
    return response.data
  },
  
  updateBrief: async (userId: number, briefData: Partial<ContentBrief>): Promise<ContentBrief> => {
    const response = await apiClient.put(`/content/${userId}/brief`, briefData)
    return response.data
  },
  
  // Content Angle APIs
  generateAngles: async (userId: number): Promise<ContentAngle[]> => {
    const response = await apiClient.post(`/content/${userId}/angles/generate`)
    return response.data
  },
  
  getAngles: async (userId: number): Promise<ContentAngle[]> => {
    const response = await apiClient.get(`/content/${userId}/angles`)
    return response.data
  },
  
  selectAngle: async (userId: number, angleId: number): Promise<ContentAngle> => {
    const response = await apiClient.post(`/content/${userId}/angle/${angleId}/select`)
    return response.data
  },
  
  // Draft APIs
  createDraft: async (userId: number, angleId: number): Promise<Draft> => {
    const response = await apiClient.post(`/content/${userId}/angle/${angleId}/draft`)
    return response.data
  },
  
  createDraftFromBrief: async (userId: number): Promise<Draft> => {
    const response = await apiClient.post(`/content/${userId}/draft`)
    return response.data
  },
  
  enhanceDraft: async (userId: number, draftContent: string, options?: DraftEnhanceOptions): Promise<Draft> => {
    const enhanceRequest: EnhanceDraftRequest = {
      draft_content: draftContent,
      ...(options || {})
    }
    const response = await apiClient.post(`/content/${userId}/enhance`, enhanceRequest)
    return response.data
  },
  
  // Calendar APIs
  getCalendarEntries: async (userId: number): Promise<CalendarEntry[]> => {
    const response = await apiClient.get(`/content/${userId}/calendar`)
    return response.data
  },
  
  createCalendarEntry: async (userId: number, entryData: Partial<CalendarEntry>): Promise<CalendarEntry> => {
    const data = {
      ...entryData,
      user_id: userId
    }
    const response = await apiClient.post(`/content/${userId}/calendar`, data)
    return response.data
  },
  
  updateCalendarEntry: async (userId: number, entryId: number, entryData: Partial<CalendarEntry>): Promise<CalendarEntry> => {
    const response = await apiClient.put(`/content/${userId}/calendar/${entryId}`, entryData)
    return response.data
  },
  
  deleteCalendarEntry: async (userId: number, entryId: number): Promise<void> => {
    await apiClient.delete(`/content/${userId}/calendar/${entryId}`)
  },
  
  // Scheduled Post APIs
  schedulePost: async (userId: number, postData: { 
    draft_id: number,
    scheduled_date: string,
    scheduled_time: string,
    platform?: string 
  }): Promise<ScheduledPost> => {
    const response = await apiClient.post(`/content/${userId}/schedule`, postData)
    return response.data
  }
}

export default ContentService 