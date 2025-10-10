export default defineNuxtRouteMiddleware(async to => {
  const session = useUserSession()

  if (session.loggedIn.value) return

  if (session.ready.value === false) await session.fetch()

  if (!session.loggedIn.value) {
    const redirectTo = to.path.startsWith('/auth')
      ? '/auth/signin'
      : `/auth/signin?redirect=${encodeURIComponent(to.fullPath)}`
    return navigateTo(redirectTo)
  }
})
