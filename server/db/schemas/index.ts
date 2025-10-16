import { accounts } from './account-schema'
import { jobs } from './cargo-schema'
import { companies } from './empresa-schema'
import { hierarchies } from './hierarquia-schema'
import { sessions } from './session-schema'
import { sectors } from './setor-schema'
import { units } from './unidade-schema'
import { users } from './user-schema'
import { verifications } from './verification-schema'

export * from './user-schema'
export * from './account-schema'
export * from './session-schema'
export * from './verification-schema'
export * from './empresa-schema'
export * from './unidade-schema'
export * from './setor-schema'
export * from './cargo-schema'
export * from './hierarquia-schema'

// Schema para o Better Auth (nome das chaves deve corresponder aos nomes das tabelas)
export const schema = {
  users,
  accounts,
  verifications,
  sessions,
  companies,
  units,
  sectors,
  jobs,
  hierarchies
}
