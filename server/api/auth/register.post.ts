// Endpoint de registro
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const { name, email, cpf, password, roles } = await readBody(event)

  try {
    // Faz a requisição para a API Quarkus
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/register`, {
      method: 'POST',
      body: {
        name,
        email,
        cpf,
        password,
        roles: roles || ['USER']
      }
    })

    // Extrai os dados da resposta
    const { accessToken, refreshToken, user } = response as {
      accessToken: string
      refreshToken: string
      tokenType: string
      expiresAt: string
      user: {
        id: string
        name: string
        email: string
        cpf?: string
        roles: string[]
        passwordMustChange?: boolean
      }
    }

    // Define a sessão do usuário
    await setUserSession(event, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        roles: user.roles,
        passwordMustChange: user.passwordMustChange
      },
      loggedInAt: Date.now(),
      secure: {
        accessToken,
        refreshToken
      }
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      statusMessage: error.data?.error?.message || 'Erro ao registrar usuário'
    })
  }
})
