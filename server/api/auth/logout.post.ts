export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  try {
    // Fazer requisição para o backend Java para limpar cookies
    await $fetch(`${config.apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Incluir cookies na requisição
      onResponse({ response }) {
        // Copiar os cookies de remoção do backend para o cliente
        const setCookieHeader = response.headers.get('set-cookie')
        if (setCookieHeader) {
          setResponseHeaders(event, {
            'set-cookie': setCookieHeader
          })
        }
      }
    })

    // Limpar sessão do Nuxt
    await clearUserSession(event)

    return {
      success: true,
      message: 'Logout realizado com sucesso'
    }
  } catch (error: any) {
    console.error('Erro no logout:', error)

    // Mesmo com erro, limpar a sessão local
    await clearUserSession(event)

    return {
      success: true,
      message: 'Logout realizado'
    }
  }
})
