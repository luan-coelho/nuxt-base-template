import { authClient } from '~/lib/auth-client'
import { ref } from 'vue'

export const useAuth = () => {
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  // Usa o hook de sessão do Better Auth
  const session = authClient.useSession()

  const login = async (credentials: { email: string; password: string; remember?: boolean }) => {
    loading.value = true
    errorMessage.value = null

    try {
      await authClient.signIn.email(
        {
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.remember
        },
        {
          onRequest: () => {
            loading.value = true
          },
          onSuccess: () => {
            loading.value = false
            errorMessage.value = null
          },
          onError: ctx => {
            loading.value = false
            errorMessage.value = ctx.error.message || 'Erro ao fazer login'
          }
        }
      )

      return { ok: true, message: null }
    } catch (error: unknown) {
      loading.value = false
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      errorMessage.value = message
      return { ok: false, message }
    }
  }

  const logout = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            loading.value = true
          },
          onSuccess: () => {
            loading.value = false
          },
          onError: ctx => {
            loading.value = false
            errorMessage.value = ctx.error.message || 'Erro ao fazer logout'
          }
        }
      })

      return { ok: true, message: null }
    } catch (error: unknown) {
      loading.value = false
      const message = error instanceof Error ? error.message : 'Erro ao fazer logout'
      errorMessage.value = message
      return { ok: false, message }
    }
  }

  return {
    session,
    login,
    logout,
    loading,
    errorMessage
  }
}
