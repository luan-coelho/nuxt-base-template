import { and, eq } from 'drizzle-orm'
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
      // Only sync active units
      if (socUnit.UNIDADEATIVA !== '1') {
        console.log(`Skipping inactive unit ${socUnit.NOMEUNIDADE} (${socUnit.CODIGOUNIDADE})`)
        return
      }

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
        .where(and(eq(socUnits.socCode, socUnit.CODIGOUNIDADE), eq(socUnits.socCompanyCode, socUnit.CODIGOEMPRESA)))
        .limit(1)

      if (existingUnit) {
        // Update existing unit
        await db.update(socUnits).set(unitData).where(eq(socUnits.id, existingUnit.id))
        this.statistics.units.updated++
        console.log(`Updated unit ${socUnit.NOMEUNIDADE}`)
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
  private async syncSector(socSector: SocSectorResponse, hierarchyMap: Map<string, string>): Promise<void> {
    try {
      let unitId: string | null = null

      // Try to find unit from hierarchy mapping
      const unitName = hierarchyMap.get(socSector.NOMESETOR)

      if (unitName) {
        // Find the unit by name from hierarchy (only active units)
        const [unit] = await db
          .select()
          .from(socUnits)
          .where(
            and(
              eq(socUnits.name, unitName),
              eq(socUnits.socCompanyCode, socSector.CODIGOEMPRESA),
              eq(socUnits.active, true)
            )
          )
          .limit(1)

        if (unit) {
          unitId = unit.id
        } else {
          console.warn(`Unit "${unitName}" not found for sector "${socSector.NOMESETOR}"`)
        }
      }

      // Fallback: if no hierarchy mapping found, use the first active unit of the company
      if (!unitId) {
        const [firstUnit] = await db
          .select()
          .from(socUnits)
          .where(and(eq(socUnits.socCompanyCode, socSector.CODIGOEMPRESA), eq(socUnits.active, true)))
          .limit(1)

        if (!firstUnit) {
          throw new Error(`No units found for company ${socSector.CODIGOEMPRESA}`)
        }

        unitId = firstUnit.id
        console.warn(`No hierarchy mapping found for sector "${socSector.NOMESETOR}", using first unit as fallback`)
      }

      const sectorData = {
        socCode: socSector.CODIGOSETOR,
        socCompanyCode: socSector.CODIGOEMPRESA,
        name: socSector.NOMESETOR,
        unitId,
        active: socSector.SETORATIVO === '1',
        updatedAt: new Date()
      }

      // Check if sector already exists (by socCode, name, and active status)
      const [existingSector] = await db
        .select()
        .from(socSectors)
        .where(
          and(
            eq(socSectors.socCode, socSector.CODIGOSETOR),
            eq(socSectors.name, socSector.NOMESETOR),
            eq(socSectors.active, socSector.SETORATIVO === '1')
          )
        )
        .limit(1)

      if (existingSector) {
        // Update existing sector
        await db.update(socSectors).set(sectorData).where(eq(socSectors.id, existingSector.id))
        this.statistics.sectors.updated++
        console.log(`Updated sector ${socSector.CODIGOSETOR}`)
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
  private async syncJob(
    socJob: SocJobResponse,
    hierarchyMap: Map<string, { unitName: string; sectorName: string }>
  ): Promise<void> {
    try {
      let sectorId: string | null = null

      // Try to find sector from hierarchy mapping
      const hierarchyInfo = hierarchyMap.get(socJob.NOMECARGO)

      if (hierarchyInfo) {
        // Find the sector by name and unit name (only active units)
        const [unit] = await db
          .select()
          .from(socUnits)
          .where(
            and(
              eq(socUnits.name, hierarchyInfo.unitName),
              eq(socUnits.socCompanyCode, socJob.CODIGOEMPRESA),
              eq(socUnits.active, true)
            )
          )
          .limit(1)

        if (unit) {
          // Find sector by name and unit
          const [sector] = await db
            .select()
            .from(socSectors)
            .where(
              and(
                eq(socSectors.name, hierarchyInfo.sectorName),
                eq(socSectors.unitId, unit.id),
                eq(socSectors.socCompanyCode, socJob.CODIGOEMPRESA)
              )
            )
            .limit(1)

          if (sector) {
            sectorId = sector.id
          } else {
            console.warn(
              `Sector "${hierarchyInfo.sectorName}" not found in unit "${hierarchyInfo.unitName}" for job "${socJob.NOMECARGO}"`
            )
          }
        } else {
          console.warn(`Unit "${hierarchyInfo.unitName}" not found for job "${socJob.NOMECARGO}"`)
        }
      }

      // Fallback: if no hierarchy mapping found, use the first sector of the company
      if (!sectorId) {
        const [firstSector] = await db
          .select()
          .from(socSectors)
          .where(eq(socSectors.socCompanyCode, socJob.CODIGOEMPRESA))
          .limit(1)

        if (!firstSector) {
          throw new Error(`No sectors found for company ${socJob.CODIGOEMPRESA}`)
        }

        sectorId = firstSector.id
        console.warn(`No hierarchy mapping found for job "${socJob.NOMECARGO}", using first sector as fallback`)
      }

      const jobData = {
        socCode: socJob.CODIGOCARGO,
        socCompanyCode: socJob.CODIGOEMPRESA,
        name: socJob.NOMECARGO,
        detailedDescription: socJob.DESCRICAODETALHADA || undefined,
        sectorId,
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

    // Group sectors by company code to optimize hierarchy fetches
    const sectorsByCompany = new Map<string, SocSectorResponse[]>()

    for (const sector of socSectors) {
      const companyCode = sector.CODIGOEMPRESA
      if (!sectorsByCompany.has(companyCode)) {
        sectorsByCompany.set(companyCode, [])
      }
      sectorsByCompany.get(companyCode)!.push(sector)
    }

    // Process sectors grouped by company
    for (const [companyCode, companySectors] of sectorsByCompany) {
      console.log(`Processing ${companySectors.length} sectors for company ${companyCode}`)

      // Fetch hierarchy ONCE per company
      console.log(`Fetching hierarchy for company ${companyCode}...`)
      const hierarchyData = await this.apiClient.fetchHierarchy(companyCode)

      // Create a map: Sector Name -> Unit Name
      const hierarchyMap = new Map<string, string>()
      for (const record of hierarchyData) {
        hierarchyMap.set(record.NOMESETOR, record.NOMEUNIDADE)
      }
      console.log(`Found ${hierarchyMap.size} hierarchy mappings for company ${companyCode}`)

      // Process each sector with the hierarchy map
      for (const socSector of companySectors) {
        await this.syncSector(socSector, hierarchyMap)
      }
    }
  }

  /**
   * Sync all jobs
   */
  async syncJobs(): Promise<void> {
    console.log('Fetching jobs from SOC...')
    const socJobs = await this.apiClient.fetchJobs()
    console.log(`Found ${socJobs.length} jobs`)

    // Group jobs by company code to optimize hierarchy fetches
    const jobsByCompany = new Map<string, SocJobResponse[]>()

    for (const job of socJobs) {
      const companyCode = job.CODIGOEMPRESA
      if (!jobsByCompany.has(companyCode)) {
        jobsByCompany.set(companyCode, [])
      }
      jobsByCompany.get(companyCode)!.push(job)
    }

    // Process jobs grouped by company
    for (const [companyCode, companyJobs] of jobsByCompany) {
      console.log(`Processing ${companyJobs.length} jobs for company ${companyCode}`)

      // Fetch hierarchy ONCE per company
      console.log(`Fetching hierarchy for jobs in company ${companyCode}...`)
      const hierarchyData = await this.apiClient.fetchHierarchy(companyCode)

      // Create a map: Job Name -> { Unit Name, Sector Name }
      const hierarchyMap = new Map<string, { unitName: string; sectorName: string }>()
      for (const record of hierarchyData) {
        hierarchyMap.set(record.NOMECARGO, {
          unitName: record.NOMEUNIDADE,
          sectorName: record.NOMESETOR
        })
      }
      console.log(`Found ${hierarchyMap.size} job hierarchy mappings for company ${companyCode}`)

      // Process each job with the hierarchy map
      for (const socJob of companyJobs) {
        await this.syncJob(socJob, hierarchyMap)
      }
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
