import type { ApiResponse, AuthSuccessData, CookieApiResponse, SignInPayload } from '~/types'
import { createError, readBody } from 'h3'
import { callBackend, isApiErrorResponse, normalizeCookieAuthResponse } from '../../utils/backend'

export default defineEventHandler(async event => {
  const body = await readBody<SignInPayload>(event)
  const { data, status } = await callBackend<CookieApiResponse | ApiResponse<AuthSuccessData> | AuthSuccessData>(
    event,
    '/auth/signin',
    {
      method: 'POST',
      body
    }
  )

  if (isApiErrorResponse<AuthSuccessData>(data)) {
    throw createError({
      statusCode: status >= 400 ? status : 401,
      message: data.error?.message ?? 'Não foi possível autenticar. Tente novamente.',
      data
    })
  }

  const authData = normalizeCookieAuthResponse(data)

  if (!authData?.authResponse?.user) {
    throw createError({
      statusCode: 502,
      message: 'Resposta inválida do serviço de autenticação.',
      data
    })
  }

  await setUserSession(event, {
    user: {
      ...authData.authResponse.user,
      id: String(authData.authResponse.user.id)
    },
    expiresAt: authData.authResponse.expiresAt as string | undefined
  })

  return authData
})
