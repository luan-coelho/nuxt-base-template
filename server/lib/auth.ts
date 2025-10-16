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
      phone: {
        type: 'string',
        input: true,
        required: false
      },
      active: {
        type: 'boolean',
        input: false,
        required: false,
        defaultValue: true
      },
      roles: {
        type: 'string[]',
        input: true,
        required: true
      },
      passwordMustChange: {
        type: 'boolean',
        input: false,
        required: false,
        defaultValue: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false
  },
  plugins: []
})
