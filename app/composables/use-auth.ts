import type { ApiResponse, CookieApiResponse, RegisterPayload, SignInPayload, User } from '~/types'

interface AuthResult {
  ok: boolean
  message?: string
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    const maybeData = (error as { data?: unknown }).data
    if (maybeData && typeof maybeData === 'object') {
      const data = maybeData as ApiResponse
      if (data.error && typeof data.error.message === 'string') {
        return data.error.message
      }
    }

    const maybeMessage = (error as { message?: string }).message
    if (maybeMessage) return maybeMessage
  }

  return 'Não foi possível completar a ação. Tente novamente.'
}

export function useAuth() {
  const session = useUserSession()
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function login(payload: SignInPayload): Promise<AuthResult> {
    loading.value = true
    errorMessage.value = null

    try {
      await $fetch<CookieApiResponse>('/api/auth/signin', {
        method: 'POST',
        body: payload
      })
      await session.fetch()
      return { ok: true }
    } catch (error) {
      console.log(error, 'message')
      const message = extractErrorMessage(error)
      console.log(message, 'message')
      errorMessage.value = message
      return { ok: false, message }
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<AuthResult> {
    loading.value = true
    errorMessage.value = null

    try {
      await $fetch<CookieApiResponse>('/api/auth/register', {
        method: 'POST',
        body: payload
      })
      await session.fetch()
      return { ok: true }
    } catch (error) {
      const message = extractErrorMessage(error)
      errorMessage.value = message
      return { ok: false, message }
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    try {
      await $fetch<CookieApiResponse>('/api/auth/refresh', { method: 'POST' })
      await session.fetch()
    } catch (error) {
      errorMessage.value = extractErrorMessage(error)
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    try {
      await $fetch<User>('/api/auth/me')
      await session.fetch()
    } catch (error) {
      errorMessage.value = extractErrorMessage(error)
    }
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      await session.clear()
    } catch (error) {
      errorMessage.value = extractErrorMessage(error)
    }
  }

  return {
    session,
    loading,
    errorMessage,
    login,
    register,
    refresh,
    fetchCurrentUser,
    logout
  }
}
