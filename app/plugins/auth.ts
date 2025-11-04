/**
 * Plugin de inicialização da autenticação
 * Tenta restaurar a sessão do usuário ao carregar a aplicação
 * usando o cookie existente no navegador
 */
export default defineNuxtPlugin(async () => {
  const { isAuthenticated, setAuthLoading } = useUserSession()
  const { fetchUser } = useAuth()

  // Define loading como true no início
  setAuthLoading(true)

  // Apenas tenta restaurar a sessão se não estiver autenticado
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

  // Define loading como false após validação
  setAuthLoading(false)
})
