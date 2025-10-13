/// <reference types="nuxt-auth-utils" />
import type { AvatarProps } from '@nuxt/ui'
import type { H3Event } from 'h3'

declare module '#app' {
  interface NuxtApp {
    $api: typeof $fetch
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: typeof $fetch
  }
}

interface AuthUser {
  id: string | number
  name: string
  email: string
  roles: string[]
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

export type AuthResponse = ApiResponse<AuthSuccessData>

export type AuthErrorResponse = ApiErrorResponse

export interface CookieApiResponse {
  accessToken?: string
  refreshToken?: string
  authResponse: AuthSuccessData
}

export interface SignInPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface User {
  id: number
  name: string
  email: string
  password?: string
  roles?: string[]
  avatar?: AvatarProps
}

export type DirectoryUser = User

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar?: AvatarProps
}

declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    roles: string[]
  }

  interface UserSession {
    user: User | null
    expiresAt?: string
    remember?: boolean
  }

  function setUserSession(event: H3Event, data: Partial<UserSession>, options?: Record<string, unknown>): Promise<void>
  function clearUserSession(event: H3Event): Promise<void>
  function requireUserSession(event: H3Event): Promise<UserSession>
  function getUserSession(event: H3Event): Promise<UserSession>
}

export {}
