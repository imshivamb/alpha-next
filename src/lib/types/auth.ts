export interface LoginCredentials {
  username: string
  password: string
}

export interface User {
  id: number
  email: string
  name: string
  is_admin: boolean
  profile_image?: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface TokenPayload {
  sub?: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ErrorResponse {
  detail: string
  status_code?: number
} 