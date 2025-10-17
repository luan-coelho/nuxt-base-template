/* eslint-disable @stylistic/quote-props */
/**
 * Types for SOC (Sistema Ocupacional) API Integration
 */

// SOC API Configuration
export interface SocApiConfig {
  empresa: string // Company code in SOC system
  baseUrl?: string
}

export interface SocApiParams {
  empresa: string
  codigo: string // Endpoint code
  chave: string // API key/hash
  tipoSaida: 'json' | 'xml'
  ativo?: '' | '0' | '1' // Optional filter for active records
}

// Company (Empresa) from SOC
export interface SocCompanyResponse {
  CODIGO: string
  NOMEABREVIADO: string
  RAZAOSOCIALINICIAL: string
  RAZAOSOCIAL: string
  ENDERECO: string
  NUMEROENDERECO: string
  COMPLEMENTOENDERECO: string
  BAIRRO: string
  CIDADE: string
  CEP: string
  UF: string
  CNPJ: string
  INSCRICAOESTADUAL: string
  INSCRICAOMUNICIPAL: string
  ATIVO: '0' | '1'
  CODIGOCLIENTEINTEGRACAO: string
  'COD. CLIENTE (INT.)': string
}

// Unit (Unidade) from SOC
export interface SocUnitResponse {
  CODIGOEMPRESA: string
  NOMEEMPRESA: string
  CODIGOUNIDADE: string
  NOMEUNIDADE: string
  CODIGORHUNIDADE: string
  GRAUDERISCOUNIDADE: string
  UNIDADEATIVA: '0' | '1'
  CNPJUNIDADE: string
  INSCRICAOESTADUALUNIDADE: string
  CODIGOCLIENTEINTEGRACAO: string
  ENDERECO: string
  NUMEROENDERECO: string
  COMPLEMENTO: string
  BAIRRO: string
  CIDADE: string
  UF: string
  CEP: string
  CPFUNIDADE: string
  RAZAOSOCIAL: string
}

// Sector (Setor) from SOC
export interface SocSectorResponse {
  CODIGOEMPRESA: string
  NOMEEMPRESA: string
  CODIGOSETOR: string
  NOMESETOR: string
  CODIGORHSETOR: string
  SETORATIVO: '0' | '1'
}

// Job (Cargo) from SOC
export interface SocJobResponse {
  CODIGOEMPRESA: string
  NOMEEMPRESA: string
  CODIGOCARGO: string
  NOMECARGO: string
  CODIGORHCARGO: string
  CARGOATIVO: '0' | '1'
  FUNCAO: string
  GFIP: string
  DESCRICAODETALHADA: string
  CBO: string
}

// Hierarchy (Hierarquia) from SOC - relates Unit -> Sector -> Job
export interface SocHierarchyResponse {
  NOMEUNIDADE: string
  NOMESETOR: string
  NOMECARGO: string
  LOCALSETORCARGO: string
  DESCRICAOSETORCARGODETALHADA: string
  FUNCAO: string
  CBO: string
  REQUISITOSFUNCAO: string
  DESCRICAODETALHADAPPRAPCMSO: string
  USARDESCRICAOREQUISITOSDOCARGO: string
}

// Sync Statistics
export interface SyncStatistics {
  companies: {
    created: number
    updated: number
    failed: number
  }
  units: {
    created: number
    updated: number
    failed: number
  }
  sectors: {
    created: number
    updated: number
    failed: number
  }
  jobs: {
    created: number
    updated: number
    failed: number
  }
  startedAt: Date
  completedAt?: Date
  errors: Array<{
    entity: 'company' | 'unit' | 'sector' | 'job'
    code: string
    message: string
  }>
}

// SOC Endpoint Codes
export const SOC_ENDPOINT_CODES = {
  COMPANIES: '200267',
  UNITS: '200266',
  SECTORS: '200268',
  JOBS: '200265',
  HIERARCHY: '198531'
} as const
