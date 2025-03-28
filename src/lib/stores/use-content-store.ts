import { create } from 'zustand'
import { 
  ContentBrief, 
  ContentAngle, 
  Draft, 
  CalendarEntry,
  ScheduledPost,
  DraftEnhanceOptions
} from '../types/content'
import ContentService from '../services/content-service'

interface ContentState {
  // Calendar
  calendarEntries: CalendarEntry[]
  calendarLoading: boolean
  calendarError: string | null
  
  // Content brief
  brief: ContentBrief | null
  briefLoading: boolean
  briefError: string | null
  isLoading: boolean
  error: string | null
  
  // Content angles
  angles: ContentAngle[]
  anglesLoading: boolean
  anglesError: string | null
  selectedAngle: ContentAngle | null
  
  // Drafts
  draft: Draft | null
  draftLoading: boolean
  draftError: string | null
  
  // Actions
  uploadBrief: (userId: number, file: File) => Promise<ContentBrief | null>
  getBrief: (userId: number) => Promise<ContentBrief | null>
  updateBrief: (userId: number, briefData: Partial<ContentBrief>) => Promise<ContentBrief | null>
  
  generateAngles: (userId: number) => Promise<ContentAngle[] | null>
  getAngles: (userId: number) => Promise<ContentAngle[] | null>
  getAngleById: (userId: number, angleId: number) => Promise<ContentAngle | null>
  selectAngle: (userId: number, angleId: number) => Promise<ContentAngle | null>
  
  createDraft: (userId: number, angleId: number) => Promise<Draft | null>
  createDraftFromBrief: (userId: number) => Promise<Draft | null>
  enhanceDraft: (userId: number, draftContent: string, options?: DraftEnhanceOptions) => Promise<Draft | null>
  resetDraft: () => void
  
  getCalendarEntries: (userId: number) => Promise<CalendarEntry[] | null>
  createCalendarEntry: (userId: number, entryData: Partial<CalendarEntry>) => Promise<CalendarEntry | null>
  updateCalendarEntry: (userId: number, entryId: number, entryData: Partial<CalendarEntry>) => Promise<CalendarEntry | null>
  deleteCalendarEntry: (userId: number, entryId: number) => Promise<boolean>
  
  schedulePost: (
    userId: number, 
    draftId: number, 
    scheduledDate: string, 
    scheduledTime: string,
    content: string,
    platform?: string
  ) => Promise<ScheduledPost | null>
  
  clearErrors: () => void
  resetState: () => void
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Calendar state
  calendarEntries: [],
  calendarLoading: false,
  calendarError: null,
  
  // Content brief state
  brief: null,
  briefLoading: false,
  briefError: null,
  isLoading: false,
  error: null,
  
  // Content angles state
  angles: [],
  anglesLoading: false,
  anglesError: null,
  selectedAngle: null,
  
  // Drafts state
  draft: null,
  draftLoading: false,
  draftError: null,
  
  // Calendar methods
  getCalendarEntries: async (userId: number) => {
    try {
      set({ calendarLoading: true, calendarError: null })
      const entries = await ContentService.getCalendarEntries(userId)
      set({ calendarEntries: entries, calendarLoading: false })
      return entries
    } catch (error) {
      console.error('Failed to fetch calendar entries:', error)
      set({ 
        calendarLoading: false, 
        calendarError: 'Failed to load calendar entries' 
      })
      return null
    }
  },
  
  createCalendarEntry: async (userId: number, entryData: Partial<CalendarEntry>) => {
    try {
      set({ calendarLoading: true, calendarError: null })
      
      const newEntry = await ContentService.createCalendarEntry(userId, entryData)
      
      // Update the entries list
      const currentEntries = get().calendarEntries
      set({ 
        calendarEntries: [...currentEntries, newEntry],
        calendarLoading: false 
      })
      
      return newEntry
    } catch (error) {
      console.error('Failed to create calendar entry:', error)
      set({ 
        calendarLoading: false, 
        calendarError: 'Failed to create calendar entry' 
      })
      return null
    }
  },
  
  updateCalendarEntry: async (userId: number, entryId: number, entryData: Partial<CalendarEntry>) => {
    try {
      set({ calendarLoading: true, calendarError: null })
      const updatedEntry = await ContentService.updateCalendarEntry(userId, entryId, entryData)
      
      // Update the entry in the local state
      const currentEntries = get().calendarEntries
      const updatedEntries = currentEntries.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
      
      set({ 
        calendarEntries: updatedEntries,
        calendarLoading: false 
      })
      
      return updatedEntry
    } catch (error) {
      console.error('Failed to update calendar entry:', error)
      set({ 
        calendarLoading: false, 
        calendarError: 'Failed to update calendar entry' 
      })
      return null
    }
  },
  
  deleteCalendarEntry: async (userId: number, entryId: number) => {
    try {
      set({ calendarLoading: true, calendarError: null })
      await ContentService.deleteCalendarEntry(userId, entryId)
      
      // Remove the entry from local state
      const currentEntries = get().calendarEntries
      set({ 
        calendarEntries: currentEntries.filter(entry => entry.id !== entryId),
        calendarLoading: false 
      })
      
      return true
    } catch (error) {
      console.error('Failed to delete calendar entry:', error)
      set({ 
        calendarLoading: false, 
        calendarError: 'Failed to delete calendar entry' 
      })
      return false
    }
  },
  
  // Content brief methods
  uploadBrief: async (userId: number, file: File) => {
    try {
      set({ briefLoading: true, briefError: null, isLoading: true, error: null })
      const brief = await ContentService.uploadContentBrief(userId, file)
      set({ brief, briefLoading: false, isLoading: false })
      return brief
    } catch (error) {
      console.error('Failed to upload content brief:', error)
      const errorMessage = 'Failed to upload content brief'
      set({ 
        briefLoading: false, 
        briefError: errorMessage,
        isLoading: false,
        error: errorMessage
      })
      return null
    }
  },
  
  getBrief: async (userId: number) => {
    try {
      set({ briefLoading: true, briefError: null, isLoading: true, error: null })
      const brief = await ContentService.getContentBrief(userId)
      set({ brief, briefLoading: false, isLoading: false })
      return brief
    } catch (error) {
      console.error('Failed to get content brief:', error)
      const errorMessage = 'Failed to load content brief'
      set({ 
        briefLoading: false, 
        briefError: errorMessage,
        isLoading: false,
        error: errorMessage
      })
      return null
    }
  },
  
  updateBrief: async (userId: number, briefData: Partial<ContentBrief>) => {
    try {
      set({ briefLoading: true, briefError: null })
      const updatedBrief = await ContentService.updateBrief(userId, briefData)
      set({ brief: updatedBrief, briefLoading: false })
      return updatedBrief
    } catch (error) {
      console.error('Failed to update content brief:', error)
      set({ 
        briefLoading: false, 
        briefError: 'Failed to update content brief' 
      })
      return null
    }
  },
  
  // Content angle methods
  generateAngles: async (userId: number) => {
    try {
      set({ anglesLoading: true, anglesError: null })
      const angles = await ContentService.generateAngles(userId)
      set({ angles, anglesLoading: false })
      return angles
    } catch (error) {
      console.error('Failed to generate content angles:', error)
      set({ 
        anglesLoading: false, 
        anglesError: 'Failed to generate content angles' 
      })
      return null
    }
  },
  
  getAngles: async (userId: number) => {
    try {
      set({ anglesLoading: true, anglesError: null })
      const angles = await ContentService.getAngles(userId)
      set({ angles, anglesLoading: false })
      return angles
    } catch (error) {
      console.error('Failed to get content angles:', error)
      set({ 
        anglesLoading: false, 
        anglesError: 'Failed to load content angles' 
      })
      return null
    }
  },
  
  getAngleById: async (userId: number, angleId: number) => {
    try {
      set({ anglesLoading: true, anglesError: null })
      
      // First get all angles if we don't have them already
      let angles = get().angles
      if (!angles.length) {
        angles = await ContentService.getAngles(userId)
        set({ angles })
      }
      
      // Find the specific angle by ID
      const angle = angles.find(a => a.id === angleId)
      
      if (angle) {
        // Update selected angle
        set({ selectedAngle: angle, anglesLoading: false })
        return angle
      } else {
        // If not found, might need to refetch angles
        const refreshedAngles = await ContentService.getAngles(userId)
        const refreshedAngle = refreshedAngles.find(a => a.id === angleId)
        
        set({ 
          angles: refreshedAngles,
          selectedAngle: refreshedAngle || null,
          anglesLoading: false
        })
        
        return refreshedAngle || null
      }
    } catch (error) {
      console.error('Failed to get angle by ID:', error)
      set({ 
        anglesLoading: false, 
        anglesError: 'Failed to load angle' 
      })
      return null
    }
  },
  
  selectAngle: async (userId: number, angleId: number) => {
    try {
      set({ anglesLoading: true, anglesError: null })
      const angle = await ContentService.selectAngle(userId, angleId)
      
      // Update the selected angle in state
      set({ 
        selectedAngle: angle,
        angles: get().angles.map(a => 
          a.id === angle.id 
            ? { ...a, is_selected: true } 
            : { ...a, is_selected: false }
        ),
        anglesLoading: false 
      })
      
      return angle
    } catch (error) {
      console.error('Failed to select content angle:', error)
      set({ 
        anglesLoading: false, 
        anglesError: 'Failed to select content angle' 
      })
      return null
    }
  },
  
  // Draft methods
  createDraft: async (userId: number, angleId: number) => {
    try {
      // First check if we already have a draft with a matching angle ID
      const existingDraft = get().draft;
      
      // More thorough check for existing draft with the same angle ID
      if (existingDraft && 
          existingDraft.angle_id === angleId && 
          existingDraft.content && 
          existingDraft.content.trim().length > 0) {
        console.log('Using existing draft with matching angle ID:', angleId);
        return existingDraft;
      }

      set({ draftLoading: true, draftError: null });
      console.log('Creating new draft for angle ID:', angleId);
      const draft = await ContentService.createDraft(userId, angleId);
      set({ 
        draft,
        draftLoading: false 
      });
      return draft;
    } catch (error) {
      console.error('Failed to create draft:', error);
      set({ 
        draftLoading: false, 
        draftError: 'Failed to create draft' 
      });
      return null;
    }
  },
  
  createDraftFromBrief: async (userId: number) => {
    try {
      // Check if we already have a draft without an angle ID
      const existingDraft = get().draft;
      
      // More thorough check for existing direct-from-brief draft
      if (existingDraft && 
          !existingDraft.angle_id && 
          existingDraft.content && 
          existingDraft.content.trim().length > 0) {
        console.log('Using existing draft created directly from brief');
        return existingDraft;
      }

      set({ draftLoading: true, draftError: null });
      console.log('Creating new draft directly from brief');
      const draft = await ContentService.createDraftFromBrief(userId);
      set({ 
        draft,
        draftLoading: false 
      });
      return draft;
    } catch (error) {
      console.error('Failed to create draft from brief:', error);
      set({ 
        draftLoading: false, 
        draftError: 'Failed to create draft from content brief' 
      });
      return null;
    }
  },
  
  enhanceDraft: async (userId: number, draftContent: string, options?: DraftEnhanceOptions) => {
    try {
      set({ draftLoading: true, draftError: null })
      
      // Get the current draft
      const currentDraft = get().draft
      if (!currentDraft) {
        throw new Error('No draft found to enhance')
      }

      // Call the service with proper options type casting
      const enhancedContent = await ContentService.enhanceDraft(
        userId, 
        draftContent, 
        options as Record<string, unknown>
      )
      
      // Ensure we have a proper Draft object
      const enhancedDraft: Draft = {
        id: currentDraft.id,
        user_id: currentDraft.user_id,
        brief_id: currentDraft.brief_id,
        angle_id: currentDraft.angle_id,
        content: enhancedContent.content,
        version: currentDraft.version + 1,
        ai_feedback: enhancedContent.feedback,
        created_at: currentDraft.created_at,
        updated_at: new Date().toISOString()
      }
      
      set({ draft: enhancedDraft, draftLoading: false })
      return enhancedDraft
    } catch (error) {
      console.error('Failed to enhance draft:', error)
      set({ 
        draftLoading: false, 
        draftError: 'Failed to enhance draft' 
      })
      return null
    }
  },
  
  resetDraft: () => {
    set({ draft: null })
  },
  
  schedulePost: async (
    userId: number,
    draftId: number,
    scheduledDate: string,
    scheduledTime: string,
    content: string,
    platform?: string
  ) => {
    try {
      set({ draftLoading: true, draftError: null });
      
      const postData = {
        draft_id: draftId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        content: content,
        platform: platform || 'LinkedIn'
      };
      
      const scheduledPost = await ContentService.schedulePost(userId, postData);
      set({ draftLoading: false });
      return scheduledPost;
    } catch (error) {
      console.error('Failed to schedule post:', error);
      set({ 
        draftLoading: false, 
        draftError: 'Failed to schedule post' 
      });
      return null;
    }
  },
  
  // Utility methods
  clearErrors: () => {
    set({
      calendarError: null,
      briefError: null,
      anglesError: null,
      draftError: null,
      error: null
    })
  },
  
  resetState: () => {
    set({
      calendarEntries: [],
      brief: null,
      angles: [],
      selectedAngle: null,
      draft: null,
      calendarLoading: false,
      briefLoading: false,
      anglesLoading: false,
      draftLoading: false,
      isLoading: false,
      calendarError: null,
      briefError: null,
      anglesError: null,
      draftError: null,
      error: null
    })
  }
}))