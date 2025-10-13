import type { ApiResponse } from '~/types'
import { createError } from 'h3'
import { callBackend, isApiErrorResponse } from '../../utils/backend'

export default defineEventHandler(async event => {
  const { data, status } = await callBackend<ApiResponse<null>>(event, '/auth/logout', {
    method: 'POST'
  })

  if (isApiErrorResponse<null>(data)) {
    throw createError({
      statusCode: status,
      message: data.error?.message ?? 'Não foi possível encerrar a sessão.',
      data
    })
  }

  await clearUserSession(event)

  return {
    success: true
  }
})
