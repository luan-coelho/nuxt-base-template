import type { AuthResponse } from '~/types'
import { callBackend } from '../../utils/backend'

export default defineEventHandler(async event => {
  const { data } = await callBackend<AuthResponse>(event, '/auth/logout', {
    method: 'POST'
  })

  await clearUserSession(event)

  return data
})
