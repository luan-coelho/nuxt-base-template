import { account } from './account-schema'
import { sessions } from './session-schema'
import { users } from './user-schema'
import { verification } from './verification-schema'

export * from './user-schema'

export const schema = {
  usersTable: users,
  accountTable: account,
  verificationTable: verification,
  sessionsTable: sessions
}
