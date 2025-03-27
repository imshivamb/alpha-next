import { create } from 'zustand'
import AuthService from '../services/auth-service'
import { User, ErrorResponse, LoginCredentials } from '../types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  
  // User actions
  login: (credentials: LoginCredentials) => Promise<User | null>
  logout: () => Promise<void>
  switchUser: (userId: number) => Promise<User | null>
  me: () => Promise<User | null>
  
  // User management
  getUsers: () => Promise<User[] | null>
  createUserAdmin: (userData: { name: string; email: string; password: string }) => Promise<User | null>
  register: (userData: { name: string; email: string; password: string }) => Promise<User | null>
  getUserById: (userId: number) => Promise<User | null>
  updateUser: (userId: number, userData: Partial<User>) => Promise<User | null>
  
  checkAuth: () => Promise<boolean>
  resetError: () => void
}

// Helper function to get error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: ErrorResponse } }
    return axiosError.response?.data?.detail || defaultMessage
  }
  
  return defaultMessage
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  
  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null })
      const response = await AuthService.login(credentials)
      
      // Store the token
      const token = response.access_token
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }
      
      // Set token and try to fetch user data
      set({ token, isLoading: true })
      
      try {
        const user = await AuthService.me()
        set({ 
          user,
          isAuthenticated: true, 
          isLoading: false 
        })
        return user
      } catch (userError) {
        console.error('Failed to fetch user after login:', userError)
        set({ 
          isAuthenticated: true, 
          isLoading: false,
          error: getErrorMessage(userError, 'Failed to fetch user profile after login.')
        })
        return null
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Login failed. Please check your credentials.')
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true })
      await AuthService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // Always clear token and user state on client side regardless of server response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      })
    }
  },
  
  switchUser: async (userId) => {
    try {
      set({ isLoading: true, error: null })
      const response = await AuthService.switchUser(userId)
      
      // Store the token
      const token = response.access_token
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }
      
      // Set token and fetch user data
      set({ token, isLoading: true })
      
      try {
        const user = await AuthService.me()
        set({ 
          user,
          isAuthenticated: true, 
          isLoading: false 
        })
        return user
      } catch (userError) {
        console.error('Failed to fetch user after switching:', userError)
        set({ 
          isAuthenticated: false, 
          isLoading: false,
          error: getErrorMessage(userError, 'Failed to fetch user profile after switching accounts.')
        })
        return null
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to switch user.')
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  me: async () => {
    const { token } = get()
    if (!token) return null

    try {
      set({ isLoading: true, error: null })
      const user = await AuthService.me()
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
      return user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Don't clear token here - let checkAuth handle token invalidation
      set({ 
        isLoading: false, 
        error: getErrorMessage(error, 'Failed to load user profile.') 
      })
      return null
    }
  },
  
  getUsers: async () => {
    try {
      set({ isLoading: true, error: null })
      const users = await AuthService.getUsers()
      set({ isLoading: false })
      return users
    } catch (error) {
      console.error('Failed to fetch users:', error)
      set({ 
        isLoading: false, 
        error: getErrorMessage(error, 'Failed to fetch users.') 
      })
      return null
    }
  },
  
  createUserAdmin: async (userData) => {
    try {
      set({ isLoading: true, error: null })
      const user = await AuthService.createUserAdmin(userData)
      set({ isLoading: false })
      return user
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to create user.')
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },
  
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null })
      const user = await AuthService.register(userData)
      set({ isLoading: false })
      return user
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Registration failed. Please try again.')
      set({ isLoading: false, error: errorMessage })
      throw error; // Rethrow for the registration component to handle
    }
  },
  
  getUserById: async (userId) => {
    try {
      set({ isLoading: true, error: null })
      const user = await AuthService.getUserById(userId)
      set({ isLoading: false })
      return user
    } catch (error) {
      console.error('Failed to fetch user by ID:', error)
      set({ 
        isLoading: false, 
        error: getErrorMessage(error, 'Failed to fetch user information.') 
      })
      return null
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
      set({ isLoading: true, error: null })
      const updatedUser = await AuthService.updateUser(userId, userData)
      
      // If updating the current user, update the state
      const currentUser = get().user
      if (currentUser && currentUser.id === userId) {
        set({ user: updatedUser })
      }
      
      set({ isLoading: false })
      return updatedUser
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update user.')
      set({ isLoading: false, error: errorMessage })
      return null
    }
  },

  checkAuth: async () => {
    // Prevent multiple simultaneous auth checks
    if (get().isLoading) return false;
    
    // Check if token exists in localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    if (!storedToken) {
      set({ user: null, token: null, isAuthenticated: false });
      return false;
    }
    
    if (storedToken && !get().token) {
      set({ token: storedToken });
    }
    
    try {
      set({ isLoading: true, error: null });
      const user = await AuthService.me();
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear token if auth check fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: getErrorMessage(error, 'Your session has expired. Please login again.')
      });
      return false;
    }
  },
  
  resetError: () => set({ error: null })
})) 