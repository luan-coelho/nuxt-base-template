/**
 * Plugin client-side para inicializar a sessão do usuário
 * Carrega os dados do usuário autenticado ao iniciar a aplicação
 */
export default defineNuxtPlugin(async () => {
  const { loadUser } = useUserSession()

  // Tenta carregar o usuário autenticado ao iniciar a aplicação
  // Isso verifica se existe um cookie de autenticação válido
  try {
    await loadUser()
  } catch (error) {
    // Silenciosamente falha se não houver autenticação
    // O middleware vai cuidar dos redirecionamentos necessários
    console.debug('Nenhuma sessão ativa encontrada')
  }
})
