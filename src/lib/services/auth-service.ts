import apiClient from '../api-client'
import { LoginCredentials, User, AuthResponse } from '../types/auth'

const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
  
  switchUser: async (userId: number): Promise<AuthResponse> => {
    const response = await apiClient.post(`/auth/switch/${userId}`)
    return response.data
  },
  
  me: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
  
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/auth/users/')
    return response.data
  },
  
  createUserAdmin: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    const response = await apiClient.post('/auth/users/', userData)
    return response.data
  },
  
  register: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    const response = await apiClient.post('/auth/users/register', userData)
    return response.data
  },
  
  getUserById: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/auth/users/${userId}`)
    return response.data
  },
  
  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/auth/users/${userId}`, userData)
    return response.data
  },
  
  loginWithGoogle: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/google', { token })
    return response.data
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
  
  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/auth/users/me', userData)
    return response.data
  },
  
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/users/me/password', {
      old_password: oldPassword,
      new_password: newPassword
    })
  }
}

export default AuthService 