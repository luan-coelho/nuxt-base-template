/**
 * Plugin Nitro para estender a funcionalidade de sessão
 *
 * Este plugin intercepta a busca de sessão para verificar se o token
 * está expirando e renová-lo automaticamente antes que expire.
 */
export default defineNitroPlugin(() => {
  // Hook chamado quando a sessão é buscada durante SSR
  // ou quando useUserSession().fetch() é chamado
  sessionHooks.hook('fetch', async (session, event) => {
    // Se não há usuário na sessão, não fazer nada
    if (!session.user) {
      return
    }

    // Verificar se o token está próximo de expirar (menos de 5 minutos)
    const now = Date.now()
    const expiresAt = typeof session.expiresAt === 'number' ? session.expiresAt : 0
    const shouldRefresh = expiresAt > 0 && now >= expiresAt - 5 * 60 * 1000

    if (shouldRefresh) {
      try {
        const config = useRuntimeConfig()

        console.log('[Auth] Token próximo de expirar, renovando automaticamente...')

        // Fazer requisição para renovar o token
        const response = await $fetch<any>(`${config.apiBaseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            cookie: event.headers.get('cookie') || ''
          },
          onResponse({ response }) {
            // Propagar os novos cookies
            const setCookieHeader = response.headers.get('set-cookie')
            if (setCookieHeader) {
              setResponseHeaders(event, {
                'set-cookie': setCookieHeader
              })
            }
          }
        })

        // Atualizar os dados da sessão
        session.user = {
          id: response.id,
          name: response.name,
          email: response.email,
          cpf: response.cpf,
          phone: response.phone,
          roles: response.roles,
          active: true
        }
        session.expiresAt = Date.now() + 60 * 60 * 1000 // 1 hora

        console.log('[Auth] Token renovado com sucesso')
      } catch (error: any) {
        console.error('[Auth] Erro ao renovar token automaticamente:', error)

        // Se falhar ao renovar, invalidar a sessão
        throw createError({
          statusCode: 401,
          message: 'Sessão expirada. Faça login novamente.'
        })
      }
    }
  })

  // Hook chamado quando a sessão é limpa
  sessionHooks.hook('clear', async (session, event) => {
    const user = session.user as any
    if (user?.id) {
      console.log(`[Auth] Usuário ${user.email} fez logout`)

      // Aqui você pode adicionar lógica adicional, como:
      // - Registrar logout em um banco de dados de auditoria
      // - Invalidar tokens no backend
      // - Enviar notificações
    }
  })
})
