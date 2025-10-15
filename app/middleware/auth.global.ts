import { authClient } from '~/lib/auth-client'

const publicRoutes = ['/auth/signin', '/auth/register', '/auth/forgot-password']

export default defineNuxtRouteMiddleware(async to => {
  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.includes(to.path)

  const { data: session } = await authClient.useSession(useFetch)

  // Se não há sessão e a rota não é pública, redireciona para login
  if (!session.value && !isPublicRoute) {
    return navigateTo('/auth/signin')
  }

  // Se há sessão e o usuário está tentando acessar a página de login, redireciona para home
  // Mas apenas se a navegação não vem de uma ação de logout
  if (session.value && isPublicRoute && !to.query.fromLogout) {
    return navigateTo('/')
  }
})
