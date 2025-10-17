import type {
  SocApiParams,
  SocCompanyResponse,
  SocHierarchyResponse,
  SocJobResponse,
  SocSectorResponse,
  SocUnitResponse
} from '../types/soc'
import { SOC_ENDPOINT_CODES } from '../types/soc'

/**
 * SOC API Client
 * Handles HTTP requests to the SOC (Sistema Ocupacional) web service
 */
export class SocApiClient {
  private readonly baseUrl: string
  private readonly empresa: string
  private apiKeys: {
    companies: string
    units: string
    sectors: string
    jobs: string
    hierarchy: string
  }

  constructor(config: {
    baseUrl: string
    empresa: string
    apiKeys: {
      companies: string
      units: string
      sectors: string
      jobs: string
      hierarchy: string
    }
  }) {
    this.baseUrl = config.baseUrl
    this.empresa = config.empresa
    this.apiKeys = config.apiKeys
  }

  /**
   * Build SOC API URL with parameters
   */
  private buildUrl(params: SocApiParams): string {
    const paramString = JSON.stringify(params)
    return `${this.baseUrl}?parametro=${encodeURIComponent(paramString)}`
  }

  /**
   * Generic fetch method for SOC API
   */
  private async fetch<T>(params: SocApiParams): Promise<T[]> {
    const url = this.buildUrl(params)
    console.log('SOC API Request URL:', url)

    try {
      // SOC API retorna JSON com Content-Type text/plain; charset=ISO-8859-1
      // Precisamos buscar como ArrayBuffer para lidar com o encoding corretamente
      const response = await $fetch(url, {
        method: 'GET',
        responseType: 'arrayBuffer'
      })

      // Decodificar de ISO-8859-1 (Latin-1) para string UTF-8
      const decoder = new TextDecoder('iso-8859-1')
      const text = decoder.decode(response as ArrayBuffer)

      // Parse manual do JSON
      const parsed = JSON.parse(text) as T[]
      return parsed
    } catch (error) {
      console.error('SOC API Error:', error)
      throw new Error(`Failed to fetch data from SOC API: ${error}`)
    }
  }

  /**
   * Fetch all companies from SOC
   */
  async fetchCompanies(): Promise<SocCompanyResponse[]> {
    return this.fetch<SocCompanyResponse>({
      empresa: this.empresa,
      codigo: SOC_ENDPOINT_CODES.COMPANIES,
      chave: this.apiKeys.companies,
      tipoSaida: 'json'
    })
  }

  /**
   * Fetch all units from SOC
   */
  async fetchUnits(activeOnly?: boolean): Promise<SocUnitResponse[]> {
    return this.fetch<SocUnitResponse>({
      empresa: this.empresa,
      codigo: SOC_ENDPOINT_CODES.UNITS,
      chave: this.apiKeys.units,
      tipoSaida: 'json',
      ativo: activeOnly ? '1' : ''
    })
  }

  /**
   * Fetch all sectors from SOC
   */
  async fetchSectors(): Promise<SocSectorResponse[]> {
    return this.fetch<SocSectorResponse>({
      empresa: this.empresa,
      codigo: SOC_ENDPOINT_CODES.SECTORS,
      chave: this.apiKeys.sectors,
      tipoSaida: 'json'
    })
  }

  /**
   * Fetch all jobs from SOC
   */
  async fetchJobs(): Promise<SocJobResponse[]> {
    return this.fetch<SocJobResponse>({
      empresa: this.empresa,
      codigo: SOC_ENDPOINT_CODES.JOBS,
      chave: this.apiKeys.jobs,
      tipoSaida: 'json'
    })
  }

  /**
   * Fetch hierarchy (relationships between Unit -> Sector -> Job) for a specific company
   * @param companyCode - The company code to fetch hierarchy for
   */
  async fetchHierarchy(companyCode: string): Promise<SocHierarchyResponse[]> {
    return this.fetch<SocHierarchyResponse>({
      empresa: companyCode,
      codigo: SOC_ENDPOINT_CODES.HIERARCHY,
      chave: this.apiKeys.hierarchy,
      tipoSaida: 'json'
    })
  }
}

/**
 * Create SOC API client instance from environment variables
 */
export function createSocApiClient(): SocApiClient {
  const config = useRuntimeConfig()

  return new SocApiClient({
    empresa: config.socEmpresa,
    baseUrl: config.socBaseUrl,
    apiKeys: {
      companies: config.socApiKeyCompanies,
      units: config.socApiKeyUnits,
      sectors: config.socApiKeySectors,
      jobs: config.socApiKeyJobs,
      hierarchy: config.socApiKeyHierarchy
    }
  })
}
