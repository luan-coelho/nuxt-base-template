/**
 * Composable para fazer requisições autenticadas à API Quarkus
 *
 * Este composable fornece uma função fetch configurada para incluir automaticamente
 * o token de autenticação do nuxt-auth-utils e lidar com refresh automático de tokens.
 *
 * Uso com TanStack Query:
 *
 * @example
 * ```ts
 * const { fetchAPI } = useFetchAPI()
 *
 * const { data, error, isLoading } = useQuery({
 *   queryKey: ['users'],
 *   queryFn: () => fetchAPI('/users')
 * })
 * ```
 */
export const useFetchAPI = () => {
  const { session, clear: clearSession } = useUserSession()
  const router = useRouter()
  const config = useRuntimeConfig()

  /**
   * Função auxiliar para refresh do token
   */
  const attemptTokenRefresh = async (): Promise<boolean> => {
    try {
      await $fetch('/api/auth/refresh', {
        method: 'POST'
      })
      return true
    } catch {
      // Se falhar o refresh, limpa a sessão e redireciona
      await clearSession()
      await router.push('/auth/signin?sessionExpired=true')
      return false
    }
  }

  /**
   * Faz uma requisição autenticada para a API Quarkus
   *
   * @param endpoint - O endpoint da API (ex: '/users', '/companies/123')
   * @param options - Opções do fetch ($fetch)
   * @returns Promise com os dados da resposta
   *
   * @throws Error se não houver token de acesso ou se a requisição falhar
   *
   * @example
   * ```ts
   * // GET
   * const users = await fetchAPI<User[]>('/users')
   *
   * // POST
   * const newUser = await fetchAPI<User>('/users', {
   *   method: 'POST',
   *   body: { name: 'João', email: 'joao@example.com' }
   * })
   *
   * // PUT
   * const updated = await fetchAPI<User>(`/users/${id}`, {
   *   method: 'PUT',
   *   body: { name: 'João Silva' }
   * })
   *
   * // DELETE
   * await fetchAPI(`/users/${id}`, { method: 'DELETE' })
   * ```
   */
  const fetchAPI = async <T = any>(
    endpoint: string,
    options?: RequestInit & {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: any
      query?: Record<string, any>
      headers?: Record<string, string>
    }
  ): Promise<T> => {
    // Obtém o token de acesso da sessão
    console.log(session.value)

    const accessToken = session.value?.secure?.accessToken

    if (!accessToken) {
      throw new Error('Token de acesso não encontrado. Usuário não está autenticado.')
    }

    // Monta a URL completa
    const baseUrl = config.public.apiBaseUrl
    const url = `${baseUrl}${endpoint}`
    console.log(url)

    try {
      return await $fetch<T>(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options?.headers
        }
      })
    } catch (error: any) {
      // Se receber 401 (Unauthorized), tenta fazer refresh do token
      if (error?.response?.status === 401 || error?.statusCode === 401) {
        const refreshSuccess = await attemptTokenRefresh()

        if (refreshSuccess) {
          // Tenta novamente com o novo token
          const newAccessToken = session.value?.secure?.accessToken

          if (!newAccessToken) {
            throw new Error('Falha ao obter novo token após refresh')
          }

          return await $fetch<T>(url, {
            ...options,
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json',
              ...options?.headers
            }
          })
        }
      }

      // Re-throw o erro para que o TanStack Query possa tratá-lo
      throw error
    }
  }

  /**
   * Versão do fetchAPI que não lança erro em caso de falha
   * Útil para cenários onde você quer tratar o erro manualmente
   */
  const fetchAPISafe = async <T = any>(
    endpoint: string,
    options?: Parameters<typeof fetchAPI>[1]
  ): Promise<{ data: T | null; error: any | null }> => {
    try {
      const data = await fetchAPI<T>(endpoint, options)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    fetchAPI,
    fetchAPISafe
  }
}
