export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  try {
    // Verificar se há uma sessão atual
    const session = await getUserSession(event)

    // Se não há sessão ou o token expirou, renovar
    const now = Date.now()
    const expiresAt = typeof session.expiresAt === 'number' ? session.expiresAt : 0
    const shouldRefresh = !session.user || (expiresAt > 0 && now >= expiresAt)

    if (!shouldRefresh) {
      // Sessão ainda válida
      return session.user
    }

    // Fazer requisição para o backend Java para renovar tokens
    const response = await $fetch<any>(`${config.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Incluir refresh token via cookie
      onResponse({ response }) {
        // Copiar novos cookies do backend
        const setCookieHeader = response.headers.get('set-cookie')
        if (setCookieHeader) {
          setResponseHeaders(event, {
            'set-cookie': setCookieHeader
          })
        }
      }
    })

    // Atualizar sessão com novos dados
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
      loggedInAt: session.loggedInAt || Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hora
    })

    return response
  } catch (error: any) {
    console.error('Erro ao renovar token:', error)

    // Limpar sessão em caso de erro
    await clearUserSession(event)

    throw createError({
      statusCode: 401,
      message: 'Sessão expirada. Faça login novamente.'
    })
  }
})
