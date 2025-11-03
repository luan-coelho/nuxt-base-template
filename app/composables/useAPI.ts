import type { UseFetchOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'

/**
 * Estrutura padrão de resposta de sucesso da API
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

/**
 * Estrutura padrão de resposta de erro da API
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

/**
 * Tipo de erro customizado para a API
 */
export type ApiError = FetchError<ApiErrorResponse>

/**
 * Composable para fazer requisições à API backend usando useFetch
 * com a instância $api customizada.
 *
 * Este composable:
 * - Usa a instância $api configurada no plugin
 * - Suporta todas as opções do useFetch nativo
 * - Fornece tipagem forte para dados e erros
 * - Funciona perfeitamente com SSR
 *
 * @example
 * // GET request
 * const { data, error, pending, refresh } = await useAPI<User[]>('/users')
 *
 * @example
 * // POST request
 * const { data, error } = await useAPI('/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * })
 *
 * @example
 * // Com tipagem de erro customizada
 * const { data, error } = await useAPI<User>('/users/123')
 * if (error.value) {
 *   console.log(error.value.data?.error.message)
 * }
 */
export function useAPI<T = any>(url: string | (() => string), options?: UseFetchOptions<T>) {
  const { $api } = useNuxtApp()

  return useFetch<T>(url, {
    ...(options as any),
    // Usar a instância $api customizada
    $fetch: $api
  } as any)
}

/**
 * Versão lazy do useAPI - não bloqueia a navegação
 *
 * @example
 * const { data, pending } = useLazyAPI<Post[]>('/posts')
 */
export function useLazyAPI<T = any>(url: string | (() => string), options?: UseFetchOptions<T>) {
  return useAPI<T>(url, {
    ...options,
    lazy: true
  })
}

/**
 * Composable para fazer requisições assíncronas mais complexas
 * usando useAsyncData com a instância $api
 *
 * @example
 * const { data, error } = await useAsyncAPI('users-list', async () => {
 *   const { $api } = useNuxtApp()
 *   const [users, stats] = await Promise.all([
 *     $api('/users'),
 *     $api('/stats')
 *   ])
 *   return { users, stats }
 * })
 */
export function useAsyncAPI<T = any>(key: string, handler: () => Promise<T>, options?: any) {
  return useAsyncData<T>(key, handler, options)
}

/**
 * Versão lazy do useAsyncAPI
 */
export function useLazyAsyncAPI<T = any>(key: string, handler: () => Promise<T>, options?: any) {
  return useAsyncData<T>(key, handler, {
    ...options,
    lazy: true
  })
}
