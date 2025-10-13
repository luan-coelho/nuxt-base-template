import { useRuntimeConfig } from '#imports'
import type { ApiResponse, AuthSuccessData, CookieApiResponse } from '~/types'
import { appendResponseHeader, createError, getRequestHeader, type H3Event } from 'h3'
import { $fetch, FetchError, type FetchOptions } from 'ofetch'

export interface BackendResponse<T> {
  data: T
  status: number
}

type BackendFetchOptions = Omit<FetchOptions<'json'>, 'baseURL'>

function extractSetCookies(headers: Headers): string[] {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
  if (typeof getSetCookie === 'function') {
    return getSetCookie.call(headers) ?? []
  }

  const header = headers.get('set-cookie')
  if (!header) return []

  // Split cookies while respecting attributes that may contain commas
  return header.split(/,(?=[^;]+=[^;]+)/g)
}

export async function callBackend<T = unknown>(
  event: H3Event,
  path: string,
  options: BackendFetchOptions = {}
): Promise<BackendResponse<T>> {
  const config = useRuntimeConfig(event)

  const headers = new Headers(options.headers as HeadersInit | undefined)
  const forwardedCookie = getRequestHeader(event, 'cookie')
  if (forwardedCookie && !headers.has('cookie')) headers.set('cookie', forwardedCookie)

  try {
    const response = await $fetch.raw<T>(path, {
      ...options,
      headers,
      baseURL: config.public.apiBase,
      credentials: 'include'
    })

    for (const cookie of extractSetCookies(response.headers)) {
      appendResponseHeader(event, 'set-cookie', cookie)
    }

    return {
      data: response._data as T,
      status: response.status
    }
  } catch (error) {
    if (error instanceof FetchError) {
      const statusCode = error.response?.status ?? 500
      const errorData = error.data ?? error.response?._data

      throw createError({
        statusCode,
        message: errorData?.error?.message ?? errorData?.message ?? error.message,
        data: errorData ?? {
          success: false,
          error: {
            code: 'UNKNOWN_BACKEND_ERROR',
            message: error.message
          }
        }
      })
    }

    throw error
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return isRecord(payload) && 'success' in payload && typeof (payload as { success: unknown }).success === 'boolean'
}

export function isApiErrorResponse<T>(payload: unknown): payload is ApiResponse<T> & { success: false } {
  return isApiResponse<T>(payload) && payload.success === false
}

export function isApiSuccessResponse<T>(payload: unknown): payload is ApiResponse<T> & { success: true; data: T } {
  return isApiResponse<T>(payload) && payload.success === true && 'data' in payload
}

export function extractApiData<T>(payload: ApiResponse<T> | T | undefined): T | undefined {
  if (!payload) return undefined
  if (isApiSuccessResponse<T>(payload)) return payload.data
  if (!isApiResponse<T>(payload)) return payload as T
  return undefined
}

export function isAuthSuccessData(payload: unknown): payload is AuthSuccessData {
  if (!isRecord(payload) || !('user' in payload)) return false
  const maybeUser = (payload as Record<string, unknown>).user
  if (!isRecord(maybeUser)) return false
  const { id, name, email } = maybeUser as Record<string, unknown>
  const hasId = typeof id === 'string' || typeof id === 'number'
  return hasId && typeof name === 'string' && typeof email === 'string'
}

export function isCookieApiResponse(payload: unknown): payload is CookieApiResponse {
  if (!isRecord(payload)) return false
  const { accessToken, refreshToken, authResponse } = payload as Record<string, unknown>
  return (
    (typeof accessToken === 'undefined' || typeof accessToken === 'string') &&
    (typeof refreshToken === 'undefined' || typeof refreshToken === 'string') &&
    isAuthSuccessData(authResponse)
  )
}

export function normalizeCookieAuthResponse(payload: unknown): CookieApiResponse | null {
  if (isCookieApiResponse(payload)) return payload
  if (isApiSuccessResponse<AuthSuccessData>(payload)) {
    return {
      authResponse: payload.data
    }
  }
  if (isAuthSuccessData(payload)) {
    return {
      authResponse: payload
    }
  }
  return null
}
