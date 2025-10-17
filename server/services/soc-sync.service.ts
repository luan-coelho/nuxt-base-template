import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db'
import { socCompanies, socJobs, socSectors, socUnits } from '../db/schemas'
import { createSocApiClient } from '../lib/soc-api-client'
import type {
  SocCompanyResponse,
  SocJobResponse,
  SocSectorResponse,
  SocUnitResponse,
  SyncStatistics
} from '../types/soc'

/**
 * SOC Sync Service
 * Synchronizes data from SOC system to local database
 */
export class SocSyncService {
  private apiClient: ReturnType<typeof createSocApiClient>
  private statistics: SyncStatistics

  constructor() {
    this.apiClient = createSocApiClient()
    this.statistics = this.initializeStatistics()
  }

  private initializeStatistics(): SyncStatistics {
    return {
      companies: { created: 0, updated: 0, failed: 0 },
      units: { created: 0, updated: 0, failed: 0 },
      sectors: { created: 0, updated: 0, failed: 0 },
      jobs: { created: 0, updated: 0, failed: 0 },
      startedAt: new Date(),
      errors: []
    }
  }

  /**
   * Sync a single company
   */
  private async syncCompany(socCompany: SocCompanyResponse): Promise<void> {
    try {
      const companyData = {
        socCode: socCompany.CODIGO,
        name: socCompany.NOMEABREVIADO,
        companyName: socCompany.RAZAOSOCIAL,
        cnpj: socCompany.CNPJ || undefined,
        cpf: undefined, // Not provided in SOC API for companies
        caepf: undefined, // Not provided in SOC API for companies
        address: socCompany.ENDERECO || undefined,
        cnae: undefined, // Not provided in SOC API
        riskDegree: undefined, // Not provided in SOC API for companies
        active: socCompany.ATIVO === '1',
        updatedAt: new Date()
      }

      // Check if company already exists by SOC code
      const [existingCompany] = await db
        .select()
        .from(socCompanies)
        .where(eq(socCompanies.socCode, socCompany.CODIGO))
        .limit(1)

      if (existingCompany) {
        // Update existing company
        await db.update(socCompanies).set(companyData).where(eq(socCompanies.id, existingCompany.id))
        this.statistics.companies.updated++
      } else {
        // Create new company
        await db.insert(socCompanies).values({
          id: nanoid(),
          ...companyData
        })
        this.statistics.companies.created++
      }
    } catch (error) {
      this.statistics.companies.failed++
      this.statistics.errors.push({
        entity: 'company',
        code: socCompany.CODIGO,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      console.error(`Failed to sync company ${socCompany.CODIGO}:`, error)
    }
  }

  /**
   * Sync a single unit
   */
  private async syncUnit(socUnit: SocUnitResponse): Promise<void> {
    try {
      // Find the parent company by SOC code
      const [company] = await db
        .select()
        .from(socCompanies)
        .where(eq(socCompanies.socCode, socUnit.CODIGOEMPRESA))
        .limit(1)

      if (!company) {
        throw new Error(`Company with SOC code ${socUnit.CODIGOEMPRESA} not found`)
      }

      const unitData = {
        socCode: socUnit.CODIGOUNIDADE,
        socCompanyCode: socUnit.CODIGOEMPRESA,
        name: socUnit.NOMEUNIDADE,
        companyName: socUnit.RAZAOSOCIAL,
        cnpj: socUnit.CNPJUNIDADE || undefined,
        cpf: socUnit.CPFUNIDADE || undefined,
        caepf: undefined, // Not provided in SOC API
        address: socUnit.ENDERECO || undefined,
        cnae: undefined, // Not provided in SOC API
        riskDegree: socUnit.GRAUDERISCOUNIDADE || undefined,
        companyId: company.id,
        active: socUnit.UNIDADEATIVA === '1',
        updatedAt: new Date()
      }

      // Check if unit already exists by SOC code and company code
      const [existingUnit] = await db
        .select()
        .from(socUnits)
        .where(eq(socUnits.socCode, socUnit.CODIGOUNIDADE))
        .limit(1)

      if (existingUnit) {
        // Update existing unit
        await db.update(socUnits).set(unitData).where(eq(socUnits.id, existingUnit.id))
        this.statistics.units.updated++
      } else {
        // Create new unit
        await db.insert(socUnits).values({
          id: nanoid(),
          ...unitData
        })
        this.statistics.units.created++
      }
    } catch (error) {
      this.statistics.units.failed++
      this.statistics.errors.push({
        entity: 'unit',
        code: socUnit.CODIGOUNIDADE,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      console.error(`Failed to sync unit ${socUnit.CODIGOUNIDADE}:`, error)
    }
  }

  /**
   * Sync a single sector
   */
  private async syncSector(socSector: SocSectorResponse): Promise<void> {
    try {
      // Find all units for this company
      const companyUnits = await db.select().from(socUnits).where(eq(socUnits.socCompanyCode, socSector.CODIGOEMPRESA))

      if (companyUnits.length === 0) {
        throw new Error(`No units found for company ${socSector.CODIGOEMPRESA}`)
      }

      // For now, assign to the first unit. In a real scenario, you might need
      // additional logic to determine which unit the sector belongs to
      const unit = companyUnits[0]

      if (!unit) {
        throw new Error(`No valid unit found for company ${socSector.CODIGOEMPRESA}`)
      }

      const sectorData = {
        socCode: socSector.CODIGOSETOR,
        socCompanyCode: socSector.CODIGOEMPRESA,
        name: socSector.NOMESETOR,
        unitId: unit.id,
        active: socSector.SETORATIVO === '1',
        updatedAt: new Date()
      }

      // Check if sector already exists
      const [existingSector] = await db
        .select()
        .from(socSectors)
        .where(eq(socSectors.socCode, socSector.CODIGOSETOR))
        .limit(1)

      if (existingSector) {
        // Update existing sector
        await db.update(socSectors).set(sectorData).where(eq(socSectors.id, existingSector.id))
        this.statistics.sectors.updated++
      } else {
        // Create new sector
        await db.insert(socSectors).values({
          id: nanoid(),
          ...sectorData
        })
        this.statistics.sectors.created++
      }
    } catch (error) {
      this.statistics.sectors.failed++
      this.statistics.errors.push({
        entity: 'sector',
        code: socSector.CODIGOSETOR,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      console.error(`Failed to sync sector ${socSector.CODIGOSETOR}:`, error)
    }
  }

  /**
   * Sync a single job
   */
  private async syncJob(socJob: SocJobResponse): Promise<void> {
    try {
      // Find all sectors for this company
      const companySectors = await db
        .select()
        .from(socSectors)
        .where(eq(socSectors.socCompanyCode, socJob.CODIGOEMPRESA))

      if (companySectors.length === 0) {
        throw new Error(`No sectors found for company ${socJob.CODIGOEMPRESA}`)
      }

      // For now, assign to the first sector. In a real scenario, you might need
      // additional logic to determine which sector the job belongs to
      const sector = companySectors[0]

      if (!sector) {
        throw new Error(`No valid sector found for company ${socJob.CODIGOEMPRESA}`)
      }

      const jobData = {
        socCode: socJob.CODIGOCARGO,
        socCompanyCode: socJob.CODIGOEMPRESA,
        name: socJob.NOMECARGO,
        detailedDescription: socJob.DESCRICAODETALHADA || undefined,
        sectorId: sector.id,
        active: socJob.CARGOATIVO === '1',
        updatedAt: new Date()
      }

      // Check if job already exists
      const [existingJob] = await db.select().from(socJobs).where(eq(socJobs.socCode, socJob.CODIGOCARGO)).limit(1)

      if (existingJob) {
        // Update existing job
        await db.update(socJobs).set(jobData).where(eq(socJobs.id, existingJob.id))
        this.statistics.jobs.updated++
      } else {
        // Create new job
        await db.insert(socJobs).values({
          id: nanoid(),
          ...jobData
        })
        this.statistics.jobs.created++
      }
    } catch (error) {
      this.statistics.jobs.failed++
      this.statistics.errors.push({
        entity: 'job',
        code: socJob.CODIGOCARGO,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      console.error(`Failed to sync job ${socJob.CODIGOCARGO}:`, error)
    }
  }

  /**
   * Sync all companies
   */
  async syncCompanies(): Promise<void> {
    console.log('Fetching companies from SOC...')
    const socCompanies = await this.apiClient.fetchCompanies()
    console.log(`Found ${socCompanies.length} companies`)

    for (const socCompany of socCompanies) {
      await this.syncCompany(socCompany)
    }
  }

  /**
   * Sync all units
   */
  async syncUnits(): Promise<void> {
    console.log('Fetching units from SOC...')
    const socUnits = await this.apiClient.fetchUnits()
    console.log(`Found ${socUnits.length} units`)

    for (const socUnit of socUnits) {
      await this.syncUnit(socUnit)
    }
  }

  /**
   * Sync all sectors
   */
  async syncSectors(): Promise<void> {
    console.log('Fetching sectors from SOC...')
    const socSectors = await this.apiClient.fetchSectors()
    console.log(`Found ${socSectors.length} sectors`)

    for (const socSector of socSectors) {
      await this.syncSector(socSector)
    }
  }

  /**
   * Sync all jobs
   */
  async syncJobs(): Promise<void> {
    console.log('Fetching jobs from SOC...')
    const socJobs = await this.apiClient.fetchJobs()
    console.log(`Found ${socJobs.length} jobs`)

    for (const socJob of socJobs) {
      await this.syncJob(socJob)
    }
  }

  /**
   * Sync all data from SOC (full synchronization)
   * Order matters: Companies -> Units -> Sectors -> Jobs
   */
  async syncAll(): Promise<SyncStatistics> {
    console.log('Starting full SOC synchronization...')
    this.statistics = this.initializeStatistics()

    try {
      // Sync in order due to foreign key dependencies
      await this.syncCompanies()
      await this.syncUnits()
      await this.syncSectors()
      await this.syncJobs()

      this.statistics.completedAt = new Date()
      console.log('SOC synchronization completed successfully')
    } catch (error) {
      console.error('SOC synchronization failed:', error)
      throw error
    }

    return this.statistics
  }

  /**
   * Get current statistics
   */
  getStatistics(): SyncStatistics {
    return this.statistics
  }
}
