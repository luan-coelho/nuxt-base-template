import type { LoginCredentials, AuthResponse, RegisterRequest } from '~/types/auth'
import type { UserSchema as User } from '~/types/user'

/**
 * Composable para operações de autenticação
 * Integra com o backend Java que utiliza cookies HTTP-only
 * Todas as requisições usam credentials: 'include' para enviar cookies automaticamente
 */
export const useAuth = () => {
  const { setUser, clear: clearSession } = useUserSession()
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:8080'

  /**
   * Realiza o login do usuário
   * O backend retorna os cookies accessToken e refreshToken automaticamente
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await $fetch<AuthResponse>(`${apiBaseUrl}/auth/signin`, {
        method: 'POST',
        body: credentials,
        credentials: 'include' // Importante: envia e recebe cookies
      })

      // Armazena o usuário no estado global
      setUser(response.user)

      return { success: true, user: response.user }
    } catch (error: any) {
      console.error('Erro no login:', error)

      // Trata erros da API
      const errorMessage = error?.data?.error?.message || 'Erro ao realizar login'

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Realiza o registro de um novo usuário
   * O backend retorna os cookies automaticamente após registro bem-sucedido
   */
  const register = async (userData: RegisterRequest) => {
    try {
      const response = await $fetch<AuthResponse>(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        body: userData,
        credentials: 'include'
      })

      setUser(response.user)

      return { success: true, user: response.user }
    } catch (error: any) {
      console.error('Erro no registro:', error)

      const errorMessage = error?.data?.error?.message || 'Erro ao realizar registro'

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Renova os tokens utilizando o refreshToken armazenado nos cookies
   * Retorna os dados do usuário atualizados
   */
  const refresh = async () => {
    try {
      const user = await $fetch<User>(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })

      setUser(user)

      return { success: true, user }
    } catch (error: any) {
      console.error('Erro ao renovar token:', error)

      // Se o refresh falhar, limpa a sessão
      clearSession()

      return {
        success: false,
        error: 'Sessão expirada'
      }
    }
  }

  /**
   * Busca os dados do usuário autenticado
   * Valida se o cookie de acesso ainda é válido
   */
  const fetchUser = async () => {
    try {
      const response = await $fetch<{ data: User }>(`${apiBaseUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include'
      })

      setUser(response.data)

      return { success: true, user: response.data }
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error)

      // Se falhar, tenta renovar o token
      if (error?.status === 401) {
        return await refresh()
      }

      clearSession()

      return {
        success: false,
        error: 'Não autenticado'
      }
    }
  }

  /**
   * Realiza o logout do usuário
   * Remove os cookies no backend e limpa o estado no frontend
   */
  const logout = async () => {
    try {
      await $fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      // Sempre limpa a sessão local, mesmo se a requisição falhar
      clearSession()
    }
  }

  return {
    login,
    register,
    refresh,
    fetchUser,
    logout
  }
}
