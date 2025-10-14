import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, schema } from '../db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: schema
  }),
  user: {
    additionalFields: {
      cpf: {
        type: 'string',
        input: true,
        required: true
      },
      roles: {
        type: 'string[]',
        input: true,
        required: true
      }
    }
  },
  emailAndPassword: {
    enabled: true
  },
  plugins: []
})
