import { useEventListener } from '@vueuse/core'

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  const router = useRouter()
  const session = useUserSession()

  const shouldProtectRoute = () => {
    const route = router.currentRoute.value

    if (route.path.startsWith('/auth')) return false

    const middleware = route.meta.middleware
    if (!middleware) return false

    if (Array.isArray(middleware)) {
      return middleware.includes('authenticated')
    }

    return middleware === 'authenticated'
  }

  let verifying = false
  const ensureSessionGuard = async () => {
    if (verifying) return
    if (!shouldProtectRoute()) return

    verifying = true
    try {
      if (session.loggedIn.value) return

      if (session.ready.value === false) {
        await session.fetch()
      }

      if (session.loggedIn.value) return

      const redirect = `/auth/signin?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`
      await router.replace(redirect)
    } finally {
      verifying = false
    }
  }

  router.afterEach(() => {
    ensureSessionGuard()
  })

  useEventListener(window, 'pageshow', event => {
    if ((event as PageTransitionEvent).persisted) {
      ensureSessionGuard()
    }
  })

  ensureSessionGuard()
})
