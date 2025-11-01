// Plugin para estender e gerenciar sessão
export default defineNitroPlugin(() => {
  // Hook chamado quando a sessão é buscada
  sessionHooks.hook('fetch', async (session, event) => {
    if (session.user?.id) {
      // Aqui você pode estender a sessão com dados do banco de dados
      // ou validar se o usuário ainda é válido
      // Exemplo: verificar se usuário foi banido, atualizar permissões, etc.
    }
  })

  // Hook chamado quando a sessão é limpa (logout)
  sessionHooks.hook('clear', async (session, event) => {
    if (session.user?.id) {
      // Log de auditoria do logout
      console.log(`Usuário ${session.user.email} fez logout`)
    }
  })
})
