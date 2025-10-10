export default defineNuxtRouteMiddleware(async () => {
  const session = useUserSession()

  if (!session.loggedIn.value) {
    if (session.ready.value === false) await session.fetch()
  }

  if (session.loggedIn.value) return navigateTo('/')
})
