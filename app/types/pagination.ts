/**
 * Interface para os parâmetros de paginação
 */
export interface PaginationParams {
  page?: number
  limit?: number
  [key: string]: any
}

/**
 * Interface para a resposta paginada da API
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Interface para o retorno do composable usePagination
 */
export interface UsePaginationReturn<T> {
  /** Dados da página atual */
  data: Ref<T[] | null>
  /** Página atual (reativa) */
  page: Ref<number>
  /** Total de itens */
  total: Ref<number>
  /** Itens por página */
  limit: Ref<number>
  /** Total de páginas */
  totalPages: Ref<number>
  /** Estado de carregamento */
  pending: Ref<boolean>
  /** Erro, se houver */
  error: Ref<any>
  /** Função para atualizar os dados */
  refresh: () => Promise<void>
  /** Ir para a próxima página */
  nextPage: () => void
  /** Ir para a página anterior */
  prevPage: () => void
  /** Ir para uma página específica */
  goToPage: (pageNumber: number) => void
  /** Verifica se há próxima página */
  hasNext: Ref<boolean>
  /** Verifica se há página anterior */
  hasPrev: Ref<boolean>
}
