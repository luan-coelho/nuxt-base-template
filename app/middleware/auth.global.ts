import { authClient } from '~/lib/auth-client'

const publicRoutes = ['/auth/signin', '/auth/register', '/auth/forgot-password']
const changePasswordRoute = '/auth/change-password'

export default defineNuxtRouteMiddleware(async to => {
  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.includes(to.path)

  const { data: session } = await authClient.useSession(useFetch)

  // Se não há sessão e a rota não é pública, redireciona para login
  if (!session.value && !isPublicRoute && to.path !== changePasswordRoute) {
    return navigateTo('/auth/signin')
  }

  // Se há sessão, verifica se o usuário precisa alterar a senha
  if (session.value && session.value.user) {
    const user = session.value.user as { passwordMustChange?: boolean }

    // Se o usuário precisa alterar a senha e não está na página de troca de senha
    if (user.passwordMustChange && to.path !== changePasswordRoute) {
      return navigateTo(changePasswordRoute)
    }

    // Se o usuário não precisa alterar a senha e está na página de troca de senha forçada
    if (!user.passwordMustChange && to.path === changePasswordRoute) {
      return navigateTo('/')
    }
  }

  // Se há sessão e o usuário está tentando acessar a página de login, redireciona para home
  // Mas apenas se a navegação não vem de uma ação de logout
  if (session.value && isPublicRoute && !to.query.fromLogout) {
    return navigateTo('/')
  }
})
