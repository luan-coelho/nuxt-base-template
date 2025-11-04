import type { UserSchema as User } from './user'

export interface SignInRequest {
  email: string
  password: string
}

export interface RegisterRequest {
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
