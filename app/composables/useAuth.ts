import type { SignInRequest, SignUpRequest, AuthResponse, User } from '~/types/auth'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { setUser, clearUser, loadUser } = useUserSession()

  const isLoggingIn = ref(false)
  const isLoggingOut = ref(false)
  const isRegistering = ref(false)

  /**
   * Realiza o login do usuário
   * O backend retorna os cookies HTTP-only automaticamente
   */
  const signIn = async (credentials: SignInRequest) => {
    isLoggingIn.value = true

    try {
      const response = await $fetch<AuthResponse>('/auth/signin', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: credentials
      })

      if (response.user) {
        setUser(response.user)
        await router.push('/dashboard')
        return response
      }

      throw new Error('Resposta inválida do servidor')
    } catch (error: any) {
      clearUser()

      // Tratar erros específicos
      if (error.status === 401) {
        throw new Error('E-mail ou senha inválidos')
      } else if (error.status === 403) {
        throw new Error('Usuário inativo')
      } else if (error.data?.error?.message) {
        throw new Error(error.data.error.message)
      }

      throw new Error('Erro ao fazer login. Tente novamente.')
    } finally {
      isLoggingIn.value = false
    }
  }

  /**
   * Realiza o registro de um novo usuário
   * O backend retorna os cookies HTTP-only automaticamente
   */
  const signUp = async (userData: SignUpRequest) => {
    isRegistering.value = true

    try {
      const response = await $fetch<AuthResponse>('/auth/register', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: userData
      })

      if (response.user) {
        setUser(response.user)
        await router.push('/dashboard')
        return response
      }

      throw new Error('Resposta inválida do servidor')
    } catch (error: any) {
      clearUser()

      // Tratar erros específicos
      if (error.status === 400) {
        const message = error.data?.error?.message || 'Dados inválidos'
        throw new Error(message)
      } else if (error.data?.error?.message) {
        throw new Error(error.data.error.message)
      }

      throw new Error('Erro ao criar conta. Tente novamente.')
    } finally {
      isRegistering.value = false
    }
  }

  /**
   * Realiza o logout do usuário
   * Remove os cookies HTTP-only no backend
   */
  const logout = async () => {
    isLoggingOut.value = true

    try {
      await $fetch('/auth/logout', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error)
      // Continuar mesmo com erro, pois vamos limpar o estado local
    } finally {
      clearUser()
      isLoggingOut.value = false
      await router.push('/login')
    }
  }

  /**
   * Renova o access token usando o refresh token
   * Os cookies são atualizados automaticamente pelo backend
   */
  const refreshToken = async (): Promise<User | null> => {
    try {
      const user = await $fetch<User>('/auth/refresh', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include'
      })

      if (user) {
        setUser(user)
        return user
      }

      return null
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      clearUser()
      return null
    }
  }

  /**
   * Verifica a autenticação carregando os dados do usuário
   */
  const checkAuth = async (): Promise<User | null> => {
    try {
      return await loadUser()
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      return null
    }
  }

  return {
    // Estado
    isLoggingIn: readonly(isLoggingIn),
    isLoggingOut: readonly(isLoggingOut),
    isRegistering: readonly(isRegistering),

    // Métodos
    signIn,
    signUp,
    logout,
    refreshToken,
    checkAuth
  }
}
