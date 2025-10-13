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

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface AuthUser {
  id: string
  email: string
  name: string
  roles: string[]
}

export interface AuthSuccessData {
  message?: string
  expiresAt?: string
  user: AuthUser
}

export interface AuthSuccessResponse {
  success: true
  data: AuthSuccessData
}

export interface AuthErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse

export interface SignInPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload extends SignInPayload {
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  password?: string
  roles?: string[]
  avatar?: AvatarProps
  status?: UserStatus
  location?: string
}

export interface DirectoryUser {
  id: string
  name: string
  email: string
  roles: string[]
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
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
