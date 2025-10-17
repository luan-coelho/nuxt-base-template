import { accounts } from './account-schema'
import { sessions } from './session-schema'
import { socCompanies } from './soc-company-schema'
import { socJobs } from './soc-job-schema'
import { socSectors } from './soc-sector-schema'
import { socUnits } from './soc-unit-schema'
import { users } from './user-schema'
import { verifications } from './verification-schema'

export * from './user-schema'
export * from './account-schema'
export * from './session-schema'
export * from './verification-schema'
export * from './soc-company-schema'
export * from './soc-unit-schema'
export * from './soc-sector-schema'
export * from './soc-job-schema'

// Schema para o Better Auth (nome das chaves deve corresponder aos nomes das tabelas)
export const schema = {
  users,
  accounts,
  verifications,
  sessions,
  socCompanies,
  socUnits,
  socSectors,
  socJobs
}
