import axios, { 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig 
} from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.kiwiq.ai'

// Track failed auth requests to prevent API spam
let failedAuthRequests = 0;
let lastFailedAuthRequestTime = 0;
const MAX_FAILED_AUTH_REQUESTS = 5;
const FAILED_AUTH_RESET_TIME = 60000; // 1 minute

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if we've had too many failed auth requests recently
    const now = Date.now();
    if (config.url?.includes('/auth/me') && 
        failedAuthRequests >= MAX_FAILED_AUTH_REQUESTS &&
        now - lastFailedAuthRequestTime < FAILED_AUTH_RESET_TIME) {
      // Return dummy failed request to prevent API spam
      return Promise.reject(new AxiosError('Too many authentication attempts', '429'));
    }
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor to handle common errors and store token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Reset failed auth counter on successful responses
    if (response.config.url?.includes('/auth/me')) {
      failedAuthRequests = 0;
    }
    
    // Store token if present in response data
    if (response.data && response.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token)
    }
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    
    // Track failed auth requests to prevent infinite loops
    if (error.config?.url?.includes('/auth/me')) {
      failedAuthRequests++;
      lastFailedAuthRequestTime = Date.now();
    }
    
    if (status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient 