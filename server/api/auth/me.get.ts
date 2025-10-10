import type { AuthResponse } from '~/types'
import { createError } from 'h3'
import { callBackend } from '../../utils/backend'

export default defineEventHandler(async event => {
  const { data, status } = await callBackend<AuthResponse>(event, '/auth/me')

  if (!data.success) {
    await clearUserSession(event)
    throw createError({
      statusCode: status,
      message: data.error.message,
      data
    })
  }

  await setUserSession(event, {
    user: data.data.user,
    expiresAt: data.data.expiresAt
  })

  return data
})
