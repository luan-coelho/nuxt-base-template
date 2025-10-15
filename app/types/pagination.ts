/**
 * Interface para parâmetros de paginação
 */
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

/**
 * Interface para metadados de paginação retornados pela API
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Interface para resposta paginada da API
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
