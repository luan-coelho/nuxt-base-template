/**
 * Plugin Nuxt para criar uma instância customizada de $fetch
 * que será usada para todas as chamadas à API backend.
 *
 * Esta instância:
 * - Adiciona automaticamente a baseURL configurada
 * - Inclui cookies para autenticação
 * - Adiciona headers de autorização quando disponíveis
 * - Trata erros de forma consistente
 * - Redireciona para login em caso de 401
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { loggedIn, clear } = useUserSession()

  // Criar instância customizada de $fetch
  const api = $fetch.create({
    // URL base da API backend
    baseURL: config.public.apiBaseUrl,

    // Incluir cookies automaticamente
    credentials: 'include',

    // Interceptor de requisição
    onRequest({ options }) {
      // Adicionar headers customizados
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }

      // Se houver sessão, os cookies serão enviados automaticamente
      // devido a credentials: 'include'

      // Definir headers
      options.headers = {
        ...headers,
        ...options.headers
      }
    },

    // Interceptor de erro de requisição
    onRequestError({ error }) {
      console.error('[API] Request Error:', error)
    },

    // Interceptor de resposta bem-sucedida
    onResponse({ response }) {
      // Propagar cookies do backend para o cliente
      const setCookieHeader = response.headers.get('set-cookie')
      if (setCookieHeader && import.meta.server) {
        // No servidor, propagar os cookies para o cliente
        const event = useRequestEvent()
        if (event) {
          setResponseHeaders(event, {
            'set-cookie': setCookieHeader
          })
        }
      }
    },

    // Interceptor de erro de resposta
    async onResponseError({ response }) {
      const status = response.status
      const error = response._data?.error || response._data

      // Log do erro
      console.error(`[API] Response Error ${status}:`, error)

      // Tratar erros específicos
      if (status === 401) {
        // Token expirado ou inválido
        console.warn('[API] Unauthorized - clearing session')

        // Limpar sessão
        await clear()

        // Redirecionar para login (apenas no client)
        if (import.meta.client) {
          await navigateTo('/auth/signin')
        }
      } else if (status === 403) {
        console.warn('[API] Forbidden - insufficient permissions')
      } else if (status === 404) {
        console.warn('[API] Resource not found')
      } else if (status >= 500) {
        console.error('[API] Server error')
      }
    }
  })

  // Expor a instância globalmente
  return {
    provide: {
      api
    }
  }
})
