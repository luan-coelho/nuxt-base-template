// Endpoint de refresh token
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  // Obtém a sessão atual
  const session = await getUserSession(event)

  if (!session.secure?.refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token não encontrado'
    })
  }

  try {
    // Faz a requisição para a API Quarkus
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      body: {
        refreshToken: session.secure.refreshToken
      }
    })

    // Extrai os novos tokens
    const { accessToken, refreshToken } = response as {
      accessToken: string
      refreshToken: string
      tokenType: string
      expiresAt: string
    }

    // Atualiza a sessão com os novos tokens
    await setUserSession(event, {
      ...session,
      secure: {
        accessToken,
        refreshToken
      }
    })

    return {
      success: true,
      message: 'Token renovado com sucesso'
    }
  } catch (error: any) {
    // Se o refresh falhar, limpa a sessão
    await clearUserSession(event)

    throw createError({
      statusCode: error.statusCode || 401,
      statusMessage: error.data?.error?.message || 'Falha ao renovar token'
    })
  }
})
