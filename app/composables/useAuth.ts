import type { Role } from '~/types/user'

// Composable para facilitar o uso da autenticação
export const useAuth = () => {
  const { loggedIn, user, session, fetch: fetchSession, clear: clearSession } = useUserSession()
  const router = useRouter()
  const config = useRuntimeConfig()

  /**
   * Realiza login do usuário
   */
  const signin = async (email: string, password: string) => {
    try {
      await $fetch('/api/auth/signin', {
        method: 'POST',
        body: { email, password }
      })

      // Atualiza a sessão
      await fetchSession()

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Erro ao fazer login'
      }
    }
  }

  /**
   * Registra novo usuário
   */
  const register = async (data: { name: string; email: string; cpf?: string; password: string; roles?: string[] }) => {
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: data
      })

      // Atualiza a sessão
      await fetchSession()

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Erro ao registrar usuário'
      }
    }
  }

  /**
   * Realiza logout do usuário
   */
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      // Limpa a sessão local
      await clearSession()

      // Redireciona para login
      await router.push('/auth/signin?fromLogout=true')

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Erro ao fazer logout'
      }
    }
  }

  /**
   * Renova o token de autenticação
   */
  const refreshToken = async () => {
    try {
      await $fetch('/api/auth/refresh', {
        method: 'POST'
      })

      // Atualiza a sessão
      await fetchSession()

      return { success: true }
    } catch (error: any) {
      // Se o refresh falhar, faz logout
      await clearSession()
      await router.push('/auth/signin')

      return {
        success: false,
        error: error.data?.message || error.message || 'Erro ao renovar token'
      }
    }
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  const hasRole = (role: Role): boolean => {
    return user.value?.roles?.includes(role) ?? false
  }

  /**
   * Verifica se o usuário tem qualquer uma das roles especificadas
   */
  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  /**
   * Verifica se o usuário tem todas as roles especificadas
   */
  const hasAllRoles = (roles: Role[]): boolean => {
    return roles.every(role => hasRole(role))
  }

  /**
   * Faz uma requisição autenticada para a API backend
   */
  const fetchAPI = async <T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: any
      query?: Record<string, any>
    } = {}
  ): Promise<T> => {
    // Obtém o token de acesso da sessão
    const accessToken = session.value?.secure?.accessToken

    if (!accessToken) {
      throw new Error('Token de acesso não encontrado')
    }

    try {
      return await $fetch<T>(`${config.public.apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error: any) {
      // Se o token expirou, tenta renovar
      if (error.statusCode === 401) {
        const refreshResult = await refreshToken()

        if (refreshResult.success) {
          // Tenta novamente com o novo token
          const newAccessToken = session.value?.secure?.accessToken

          return await $fetch<T>(`${config.public.apiBaseUrl}${endpoint}`, {
            ...options,
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json'
            }
          })
        }
      }

      throw error
    }
  }

  return {
    // Estado
    loggedIn,
    user,
    session,

    // Métodos de autenticação
    signin,
    register,
    logout,
    refreshToken,
    fetchSession,

    // Verificação de roles
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Requisições autenticadas
    fetchAPI
  }
}
