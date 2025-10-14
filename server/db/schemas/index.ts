import { accounts } from './account-schema'
import { sessions } from './session-schema'
import { users } from './user-schema'
import { verifications } from './verification-schema'

export * from './user-schema'
export * from './account-schema'
export * from './session-schema'
export * from './verification-schema'

// Schema para o Better Auth (nome das chaves deve corresponder aos nomes das tabelas)
export const schema = {
  users,
  accounts,
  verifications,
  sessions
}
