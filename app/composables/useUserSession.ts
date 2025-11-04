import type { User, UserSession } from '~/types/auth'

const userSession = ref<UserSession>({
  user: null,
  loading: true,
  loggedIn: false
})

export const useUserSession = () => {
  const config = useRuntimeConfig()

  /**
   * Fetch do usuário autenticado via endpoint /auth/me
   */
  const fetchUser = async (): Promise<User | null> => {
    try {
      const response = await $fetch<{ success: boolean; data: User }>('/auth/me', {
        baseURL: config.public.apiBaseUrl,
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      return null
    }
  }

  /**
   * Atualiza a sessão do usuário
   */
  const setUser = (user: User | null) => {
    userSession.value = {
      user,
      loading: false,
      loggedIn: !!user
    }
  }

  /**
   * Carrega o usuário autenticado
   */
  const loadUser = async () => {
    userSession.value.loading = true
    const user = await fetchUser()
    setUser(user)
    return user
  }

  /**
   * Limpa a sessão do usuário
   */
  const clearUser = () => {
    setUser(null)
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  const hasRole = (role: string): boolean => {
    return userSession.value.user?.roles?.includes(role) ?? false
  }

  /**
   * Verifica se o usuário tem qualquer uma das roles especificadas
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  return {
    session: readonly(userSession),
    user: computed(() => userSession.value.user),
    loggedIn: computed(() => userSession.value.loggedIn),
    loading: computed(() => userSession.value.loading),
    fetchUser,
    setUser,
    loadUser,
    clearUser,
    hasRole,
    hasAnyRole
  }
}
