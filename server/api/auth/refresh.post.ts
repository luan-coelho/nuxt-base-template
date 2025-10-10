import type { AuthErrorResponse, AuthSuccessData, AuthSuccessResponse } from '~/types'
import { createError } from 'h3'
import { callBackend } from '../../utils/backend'

export default defineEventHandler(async event => {
  const { data, status } = await callBackend<AuthSuccessResponse | AuthErrorResponse>(event, '/auth/refresh', {
    method: 'POST'
  })

  const isErrorResponse = (payload: AuthSuccessResponse | AuthErrorResponse): payload is AuthErrorResponse =>
    Boolean(payload && typeof payload === 'object' && 'success' in payload && payload.success === false)

  if (isErrorResponse(data)) {
    throw createError({
      statusCode: status,
      message: data.error?.message ?? 'Não foi possível renovar a sessão.',
      data
    })
  }

  const authData: AuthSuccessData = 'data' in data && data.data ? data.data : (data as unknown as AuthSuccessData)

  if (!authData?.user) {
    throw createError({
      statusCode: 502,
      message: 'Resposta inválida do serviço de autenticação.',
      data
    })
  }

  await setUserSession(event, {
    user: authData.user,
    expiresAt: authData.expiresAt
  })

  return {
    success: true,
    data: authData
  }
})
