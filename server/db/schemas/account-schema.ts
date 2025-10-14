import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './user-schema'

export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull(),
  providerId: uuid('provider_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
})
