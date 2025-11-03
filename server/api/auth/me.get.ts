export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  try {
    // Obter sessão do usuário (lança erro 401 se não autenticado)
    const session = await requireUserSession(event)

    if (!session.user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    // Verificar se o token está próximo de expirar (menos de 5 minutos)
    const now = Date.now()
    const expiresAt = typeof session.expiresAt === 'number' ? session.expiresAt : 0
    const shouldRefresh = expiresAt > 0 && now >= expiresAt - 5 * 60 * 1000

    if (shouldRefresh) {
      // Tentar renovar o token automaticamente
      try {
        const response = await $fetch<any>(`${config.apiBaseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          onResponse({ response }) {
            const setCookieHeader = response.headers.get('set-cookie')
            if (setCookieHeader) {
              setResponseHeaders(event, {
                'set-cookie': setCookieHeader
              })
            }
          }
        })

        // Atualizar sessão
        await setUserSession(event, {
          user: {
            id: response.id,
            name: response.name,
            email: response.email,
            cpf: response.cpf,
            phone: response.phone,
            roles: response.roles,
            active: true
          },
          loggedInAt: session.loggedInAt,
          expiresAt: Date.now() + 60 * 60 * 1000
        })

        return {
          success: true,
          data: response
        }
      } catch (refreshError) {
        console.error('Erro ao renovar token automaticamente:', refreshError)
        // Continuar retornando os dados atuais
      }
    }

    // Fazer requisição ao backend para obter dados atualizados do usuário
    try {
      const userData = await $fetch<any>(`${config.apiBaseUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include'
      })

      return {
        success: true,
        data: userData.data
      }
    } catch (error) {
      // Se falhar ao buscar do backend, retornar dados da sessão
      return {
        success: true,
        data: session.user
      }
    }
  } catch (error: any) {
    console.error('Erro ao obter usuário:', error)

    throw createError({
      statusCode: error.statusCode || 401,
      message: error.message || 'Não autenticado'
    })
  }
})
