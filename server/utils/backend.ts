import { useRuntimeConfig } from '#imports'
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
