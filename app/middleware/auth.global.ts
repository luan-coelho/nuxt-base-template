/**
 * Middleware global de autenticação
 * Executa em todas as navegações de rota
 * Valida a sessão do usuário e protege rotas privadas
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isAuthLoading } = useUserSession()
  const { fetchUser } = useAuth()

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/auth/signin', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(to.path)

  // No servidor, sempre tenta validar a sessão
  if (import.meta.server && !isAuthenticated.value) {
    try {
      await fetchUser()
    } catch (error) {
      console.debug('Erro ao validar sessão no servidor:', error)
    }
  }

  // No cliente, aguarda o loading inicial terminar antes de redirecionar
  if (import.meta.client) {
    // Se ainda está carregando a autenticação inicial, aguarda
    if (isAuthLoading.value) {
      return
    }

    // Se não está autenticado e não é rota pública, tenta buscar usuário
    if (!isAuthenticated.value && !isPublicRoute) {
      try {
        await fetchUser()
      } catch (error) {
        console.debug('Erro ao validar sessão no cliente:', error)
      }
    }
  }

  // Redireciona para login se não estiver autenticado e tentar acessar rota privada
  if (!isAuthenticated.value && !isPublicRoute) {
    return navigateTo('/auth/signin')
  }

  // Redireciona para home se estiver autenticado e tentar acessar rotas de auth
  if (isAuthenticated.value && isPublicRoute) {
    return navigateTo('/')
  }
})
