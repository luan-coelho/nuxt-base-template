const publicRoutes = ['/auth/signin', '/auth/register', '/auth/forgot-password']
const changePasswordRoute = '/auth/change-password'

export default defineNuxtRouteMiddleware(async to => {
  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.includes(to.path)

  // Obtém a sessão do usuário
  const { loggedIn, user } = useUserSession()

  // Se não há sessão e a rota não é pública, redireciona para login
  if (!loggedIn.value && !isPublicRoute && to.path !== changePasswordRoute) {
    return navigateTo('/auth/signin')
  }

  // Se há sessão, verifica se o usuário precisa alterar a senha
  if (loggedIn.value && user.value) {
    // Se o usuário precisa alterar a senha e não está na página de troca de senha
    if (user.value.passwordMustChange && to.path !== changePasswordRoute) {
      return navigateTo(changePasswordRoute)
    }

    // Se o usuário não precisa alterar a senha e está na página de troca de senha forçada
    if (!user.value.passwordMustChange && to.path === changePasswordRoute) {
      return navigateTo('/')
    }
  }

  // Se há sessão e o usuário está tentando acessar a página de login, redireciona para home
  // Mas apenas se a navegação não vem de uma ação de logout
  if (loggedIn.value && isPublicRoute && !to.query.fromLogout) {
    return navigateTo('/')
  }
})
