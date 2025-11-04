import type { UserSchema as User } from '~/types/user'

/**
 * Composable para gerenciar o estado da sessão do usuário
 * Utiliza useState para manter o estado entre servidor e cliente
 * compatível com SSR (Server-Side Rendering)
 */
export const useUserSession = () => {
  // Estado reativo compartilhado e SSR-friendly
  const user = useState<User | null>('user', () => null)

  // Computed para verificar se o usuário está autenticado
  const isAuthenticated = computed(() => !!user.value)

  // Computed para verificar se o usuário é admin
  const isAdmin = computed(() => user.value?.roles?.includes('ADMIN') ?? false)

  // Função para definir o usuário
  const setUser = (userData: User | null) => {
    user.value = userData
  }

  // Função para limpar a sessão
  const clear = () => {
    user.value = null
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isAdmin,
    setUser,
    clear
  }
}
