import { z } from 'zod'

// Schema de validação para login
const signinSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  try {
    // Validar corpo da requisição
    const body = await readValidatedBody(event, signinSchema.parse)

    // Fazer requisição para o backend Java
    const response = await $fetch<{ user: any }>(`${config.apiBaseUrl}/auth/signin`, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password
      },
      // IMPORTANTE: Incluir credentials para receber e enviar cookies
      credentials: 'include',
      // Capturar os cookies da resposta
      onResponse({ response }) {
        // Copiar todos os cookies do backend para o cliente
        const setCookieHeader = response.headers.get('set-cookie')
        if (setCookieHeader) {
          setResponseHeaders(event, {
            'set-cookie': setCookieHeader
          })
        }
      }
    })

    // Definir sessão do usuário com nuxt-auth-utils
    await setUserSession(event, {
      user: {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        cpf: response.user.cpf,
        phone: response.user.phone,
        roles: response.user.roles,
        active: true
      },
      loggedInAt: Date.now(),
      // Access token expira em 1 hora (3600 segundos)
      expiresAt: Date.now() + 60 * 60 * 1000
    })

    // Retornar dados do usuário (sem tokens)
    return {
      success: true,
      user: response.user
    }
  } catch (error: any) {
    console.error('Erro no login:', error)

    // Tratar erros do backend
    if (error.statusCode === 401) {
      throw createError({
        statusCode: 401,
        message: 'E-mail ou senha inválidos'
      })
    }

    if (error.statusCode === 403) {
      throw createError({
        statusCode: 403,
        message: 'Usuário inativo'
      })
    }

    // Erro genérico
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao fazer login'
    })
  }
})
