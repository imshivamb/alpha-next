import {
  Draft,
  ContentBrief,
  ContentAngle,
  CalendarEntry,
  ScheduledPost
} from '../types/content'
import apiClient from '../api-client'

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
  
  enhanceDraft: async (
    contentId: number,
    draft: string,
    options: Record<string, unknown>
  ) => {
    try {
      const response = await apiClient.post(`/content/${contentId}/enhance`, {
        draft,
        options
      });

      // Ensure the response has the expected structure
      if (!response.data || !response.data.content) {
        throw new Error('Invalid response format from enhance API');
      }
      
      return {
        content: response.data.content,
        feedback: response.data.feedback || 'Content has been enhanced successfully.'
      };
    } catch (error: unknown) {
      // Log detailed error info if available
      const typedError = error as { response?: { data?: unknown } };
      console.error('Error enhancing draft:', typedError.response?.data || error);
      
      // Return the original content in case of error
      return {
        content: draft,
        feedback: 'There was an error enhancing your content. The original draft has been preserved.'
      };
    }
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
    platform?: string,
    content: string  // Add content parameter
  }): Promise<ScheduledPost> => {
    // Combine date and time into a single datetime
    const scheduledDateTime = new Date(`${postData.scheduled_date}T${postData.scheduled_time}`);
    
    // Create the payload with the required fields
    const payload = {
      scheduled_date: scheduledDateTime.toISOString(),
      content: postData.content,  // Pass the content
      platform: postData.platform || 'LinkedIn',
      draft_id: postData.draft_id
    };
    
    const response = await apiClient.post(`/content/${userId}/schedule`, payload);
    return response.data;
  }
}

export default ContentService 