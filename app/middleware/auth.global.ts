/**
 * Middleware global de autenticação
 * Executa em todas as navegações de rota
 * Valida a sessão do usuário e protege rotas privadas
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated } = useUserSession()
  const { fetchUser } = useAuth()

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/auth/signin', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(to.path)

  // Se estiver no servidor (SSR), valida o cookie com o backend
  if (import.meta.server && !isAuthenticated.value) {
    try {
      // Tenta buscar o usuário usando o cookie
      await fetchUser()
    } catch (error) {
      // Se falhar e a rota não for pública, aguarda para redirecionar no cliente
      console.error('Erro ao validar sessão no servidor:', error)
    }
  }

  // Se estiver no cliente e não autenticado, tenta buscar o usuário
  if (import.meta.client && !isAuthenticated.value && !isPublicRoute) {
    try {
      await fetchUser()
    } catch (error) {
      console.error('Erro ao validar sessão no cliente:', error)
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
