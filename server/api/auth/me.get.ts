import type { ApiResponse, AuthSuccessData, CookieApiResponse, User } from '~/types'
import { createError } from 'h3'
import { callBackend, isApiErrorResponse, normalizeCookieAuthResponse } from '../../utils/backend'

export default defineEventHandler(async event => {
  const { data, status } = await callBackend<CookieApiResponse | ApiResponse<AuthSuccessData> | AuthSuccessData>(
    event,
    '/auth/me'
  )

  if (isApiErrorResponse<AuthSuccessData>(data)) {
    await clearUserSession(event)
    throw createError({
      statusCode: status,
      message: data.error?.message ?? 'Não foi possível recuperar o usuário atual.',
      data
    })
  }

  const authData = normalizeCookieAuthResponse(data)

  if (!authData?.authResponse?.user) {
    await clearUserSession(event)
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

  return authData.authResponse.user as User
})
