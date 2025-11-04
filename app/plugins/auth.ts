/**
 * Plugin de inicialização da autenticação
 * Tenta restaurar a sessão do usuário ao carregar a aplicação
 * usando o cookie existente no navegador
 */
export default defineNuxtPlugin(async () => {
  const { isAuthenticated } = useUserSession()
  const { fetchUser } = useAuth()

  // Apenas tenta restaurar a sessão se não estiver autenticado
  // e se estiver no servidor (SSR) ou no cliente após hidratação
  if (!isAuthenticated.value) {
    try {
      // Tenta buscar o usuário usando o cookie existente
      await fetchUser()
    } catch (error) {
      // Falha silenciosa - o usuário não está autenticado
      // O middleware vai cuidar dos redirecionamentos necessários
      console.debug('Nenhuma sessão ativa encontrada')
    }
  }
})
