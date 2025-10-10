import type { AuthErrorResponse, AuthSuccessData, AuthSuccessResponse, SignInPayload } from '~/types'
import { createError, readBody } from 'h3'
import { callBackend } from '../../utils/backend'

export default defineEventHandler(async event => {
  const body = await readBody<SignInPayload>(event)
  const { data, status } = await callBackend<AuthSuccessResponse | AuthErrorResponse>(event, '/auth/signin', {
    method: 'POST',
    body
  })

  const isErrorResponse = (payload: AuthSuccessResponse | AuthErrorResponse): payload is AuthErrorResponse =>
    Boolean(payload && typeof payload === 'object' && 'success' in payload && payload.success === false)

  if (isErrorResponse(data)) {
    throw createError({
      statusCode: status >= 400 ? status : 401,
      message: data.error?.message ?? 'Não foi possível autenticar. Tente novamente.',
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
    expiresAt: authData.expiresAt,
    remember: body.remember ?? false
  })

  return {
    success: true,
    data: authData
  }
})
