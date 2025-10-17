import { accounts } from './account-schema'
import { companies } from './company-schema'
import { hierarchies } from './hierarchy-schema'
import { jobs } from './job-schema'
import { sectors } from './sector-schema'
import { sessions } from './session-schema'
import { units } from './unit-schema'
import { users } from './user-schema'
import { verifications } from './verification-schema'

export * from './user-schema'
export * from './account-schema'
export * from './session-schema'
export * from './verification-schema'
export * from './company-schema'
export * from './unit-schema'
export * from './sector-schema'
export * from './job-schema'
export * from './hierarchy-schema'

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
