/// <reference types="nuxt-auth-utils" />
import type { AvatarProps } from '@nuxt/ui'

interface AuthUser {
  id: string | number
  name: string
  email: string
  roles: string[]
}

export interface User {
  id: string
  name: string
  email: string
  cpf: string
  temporaryPassword: string
  mustChangePassword: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
  active: boolean
}

export interface CreateUserPayload {
  name: string
  email: string
  cpf: string
}

export interface AuthSuccessData {
  expiresAt?: string | Date
  user: AuthUser
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export type ApiSuccessResponse<T = unknown> = ApiResponse<T> & {
  success: true
  data: T
}

export type ApiErrorResponse = ApiResponse<never> & {
  success: false
  error: {
    code: string
    message: string
  }
}

export interface CookieApiResponse {
  accessToken?: string
  refreshToken?: string
  authResponse: AuthSuccessData
}

export interface User {
  id: number
  name: string
  email: string
  password?: string
  roles?: string[]
  avatar?: AvatarProps
}
