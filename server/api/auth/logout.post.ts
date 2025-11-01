// Endpoint de logout
export default defineEventHandler(async event => {
  // Limpa a sessão do usuário
  await clearUserSession(event)

  return {
    success: true,
    message: 'Logout realizado com sucesso'
  }
})
