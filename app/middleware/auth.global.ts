import { authClient } from '~/lib/auth-client'

const publicRoutes = ['/auth/signin', '/auth/register', '/auth/forgot-password']

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { data: session } = await authClient.useSession(useFetch)

  // Se não há sessão e a rota não é pública, redireciona para login
  if (!session.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/auth/signin')
  }

  // Se há sessão e o usuário está tentando acessar a página de login, redireciona para home
  if (session.value && to.path === '/auth/signin') {
    return navigateTo('/')
  }
})
