// Endpoint de login
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const { email, password } = await readBody(event)

  try {
    // Faz a requisição para a API Quarkus
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/signin`, {
      method: 'POST',
      body: {
        email,
        password
      }
    })

    // Extrai os dados da resposta conforme a documentação da API
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

    // Define a sessão do usuário com dados públicos
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
      // Dados sensíveis (tokens) vão em 'secure'
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
        roles: user.roles,
        passwordMustChange: user.passwordMustChange
      }
    }
  } catch (error: any) {
    console.log(error)

    throw createError({
      statusCode: error.statusCode || 401,
      statusMessage: error.data?.error?.message || 'Credenciais inválidas'
    })
  }
})
