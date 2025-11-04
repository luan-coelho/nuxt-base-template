/**
 * Middleware global de autenticação
 * Protege rotas privadas e gerencia redirecionamentos baseados no estado de autenticação
 */

// Rotas que não requerem autenticação
const publicRoutes = ['/login', '/register', '/']

export default defineNuxtRouteMiddleware(async to => {
  const { session, loading, loadUser } = useUserSession()

  // Se está carregando, aguarda (importante para SSR)
  if (loading.value) {
    await loadUser()
  }

  const isPublicRoute = publicRoutes.includes(to.path)
  const isAuthenticated = session.value.loggedIn

  // Se está tentando acessar uma rota privada sem estar autenticado
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo('/login')
  }

  // Se está autenticado e tentando acessar login/register, redireciona para dashboard
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})
