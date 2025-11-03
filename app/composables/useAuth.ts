import type { z } from 'zod'

// Schema para validação de login
const signinSchema = {
  email: '',
  password: ''
} as const

type SigninCredentials = {
  email: string
  password: string
}

/**
 * Composable para gerenciar autenticação com nuxt-auth-utils
 * Integra com backend Java que gerencia tokens via cookies HTTP-only
 */
export function useAuth() {
  const router = useRouter()
  const toast = useToast()

  // Usar o composable nativo do nuxt-auth-utils
  const { loggedIn, user, session, fetch: fetchSession, clear: clearSession } = useUserSession()

  // Estados de loading
  const isLoggingIn = ref(false)
  const isLoggingOut = ref(false)
  const isRefreshing = ref(false)

  /**
   * Realizar login no sistema
   */
  async function signin(credentials: SigninCredentials) {
    isLoggingIn.value = true

    try {
      // Chamar API local que se comunica com backend Java
      const response = await $fetch('/api/auth/signin', {
        method: 'POST',
        body: credentials
      })

      // Buscar sessão atualizada
      await fetchSession()

      toast.add({
        title: 'Login realizado com sucesso!',
        color: 'success'
      })

      return response
    } catch (error: any) {
      console.error('Erro no login:', error)

      const message = error.data?.message || error.message || 'Erro ao fazer login'

      toast.add({
        title: 'Erro no login',
        description: message,
        color: 'error'
      })

      throw error
    } finally {
      isLoggingIn.value = false
    }
  }

  /**
   * Realizar logout do sistema
   */
  async function logout() {
    isLoggingOut.value = true

    try {
      // Chamar API local que se comunica com backend Java
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      // Limpar sessão local
      await clearSession()

      toast.add({
        title: 'Logout realizado com sucesso',
        color: 'success'
      })

      // Redirecionar para login
      await router.push('/auth/signin')
    } catch (error: any) {
      console.error('Erro no logout:', error)

      // Mesmo com erro, limpar sessão e redirecionar
      await clearSession()
      await router.push('/auth/signin')
    } finally {
      isLoggingOut.value = false
    }
  }

  /**
   * Renovar token de acesso
   */
  async function refreshToken() {
    isRefreshing.value = true

    try {
      const response = await $fetch('/api/auth/refresh', {
        method: 'POST'
      })

      // Atualizar sessão
      await fetchSession()

      return response
    } catch (error: any) {
      console.error('Erro ao renovar token:', error)

      // Se falhar, fazer logout
      await clearSession()
      await router.push('/auth/signin')

      throw error
    } finally {
      isRefreshing.value = false
    }
  }

  /**
   * Obter dados atualizados do usuário
   */
  async function fetchUser() {
    try {
      const response = await $fetch<{ success: boolean; data: any }>('/api/auth/me')
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error)

      // Se não autenticado, redirecionar para login
      if (error.statusCode === 401) {
        await clearSession()
        await router.push('/auth/signin')
      }

      throw error
    }
  }

  /**
   * Verificar se usuário tem uma role específica
   */
  function hasRole(role: string): boolean {
    if (!user.value?.roles) return false
    return user.value.roles.includes(role)
  }

  /**
   * Verificar se usuário tem qualquer uma das roles
   */
  function hasAnyRole(roles: string[]): boolean {
    if (!user.value?.roles) return false
    return roles.some(role => user.value?.roles.includes(role))
  }

  /**
   * Verificar se usuário tem todas as roles
   */
  function hasAllRoles(roles: string[]): boolean {
    if (!user.value?.roles) return false
    return roles.every(role => user.value?.roles.includes(role))
  }

  /**
   * Verificar se é admin
   */
  const isAdmin = computed(() => hasRole('ADMIN'))

  /**
   * Verificar se é manager
   */
  const isManager = computed(() => hasRole('MANAGER'))

  return {
    // Estado
    loggedIn,
    user,
    session,
    isLoggingIn: readonly(isLoggingIn),
    isLoggingOut: readonly(isLoggingOut),
    isRefreshing: readonly(isRefreshing),

    // Computed
    isAdmin,
    isManager,

    // Métodos
    signin,
    logout,
    refreshToken,
    fetchUser,
    fetchSession,
    hasRole,
    hasAnyRole,
    hasAllRoles
  }
}
