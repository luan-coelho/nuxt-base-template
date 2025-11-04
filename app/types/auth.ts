export interface User {
  id: string
  name: string
  email: string
  cpf?: string
  phone?: string
  roles: string[]
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  name: string
  email: string
  cpf?: string
  phone?: string
  password: string
  roles?: string[]
}

export interface AuthResponse {
  user: User
}

export interface MeResponse {
  success: boolean
  data: User
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

export interface UserSession {
  user: User | null
  loading: boolean
  loggedIn: boolean
}
