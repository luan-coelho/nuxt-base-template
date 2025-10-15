import type { PaginatedResponse, PaginationMeta } from '~/types/pagination'
import type { UseFetchOptions } from 'nuxt/app'

/**
 * Interface para opções do composable
 */
export interface UsePaginatedFetchOptions<T> extends Omit<UseFetchOptions<PaginatedResponse<T>>, 'query' | 'watch'> {
  initialPage?: number
  initialLimit?: number
  initialSearch?: string
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
  additionalParams?: Record<string, unknown>
  debounceSearch?: number
}

/**
 * Composable para fetch paginado e reutilizável
 *
 * @template T - Tipo dos dados retornados pela API
 * @param url - URL da API para fazer o fetch
 * @param options - Opções de configuração
 * @returns Objeto com dados, paginação e funções de controle
 *
 * @example
 * ```typescript
 * const {
 *   data: users,
 *   pagination,
 *   page,
 *   limit,
 *   search,
 *   sortBy,
 *   sortOrder,
 *   status,
 *   refresh
 * } = await usePaginatedFetch<User>('/api/users', {
 *   initialLimit: 20,
 *   initialSortBy: 'createdAt',
 *   debounceSearch: 500
 * })
 * ```
 */
export function usePaginatedFetch<T>(url: string | (() => string), options: UsePaginatedFetchOptions<T> = {}) {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = '',
    initialSortBy = 'createdAt',
    initialSortOrder = 'desc',
    additionalParams = {},
    debounceSearch = 500,
    ...fetchOptions
  } = options

  // Estados reativos para parâmetros de paginação
  const page = ref(initialPage)
  const limit = ref(initialLimit)
  const searchInput = ref(initialSearch)
  const search = ref(initialSearch)
  const sortBy = ref(initialSortBy)
  const sortOrder = ref<'asc' | 'desc'>(initialSortOrder)

  // Parâmetros adicionais customizados
  const customParams = ref(additionalParams)

  // Debounce para o campo de busca
  let searchTimeout: NodeJS.Timeout
  watch(searchInput, newValue => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      search.value = newValue
      page.value = 1 // Reset para a primeira página ao buscar
    }, debounceSearch)
  })

  // Reset para a primeira página ao mudar a ordenação
  watch([sortBy, sortOrder], () => {
    page.value = 1
  })

  // Combina todos os parâmetros de query
  const queryParams = computed(() => ({
    page: page.value,
    limit: limit.value,
    search: search.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    ...customParams.value
  }))

  // Fetch paginado com parâmetros reativos
  const {
    data: response,
    status,
    error,
    refresh,
    clear
  } = useFetch<PaginatedResponse<T>>(url, {
    ...fetchOptions,
    query: queryParams,
    watch: [page, limit, search, sortBy, sortOrder, customParams]
  })

  // Dados extraídos
  const data = computed<T[]>(() => response.value?.data ?? [])

  // Metadados de paginação
  const pagination = computed<PaginationMeta>(
    () =>
      response.value?.pagination ?? {
        page: initialPage,
        limit: initialLimit,
        total: 0,
        totalPages: 0
      }
  )

  /**
   * Reseta todos os filtros e volta para a primeira página
   */
  const resetFilters = () => {
    page.value = initialPage
    limit.value = initialLimit
    searchInput.value = initialSearch
    search.value = initialSearch
    sortBy.value = initialSortBy
    sortOrder.value = initialSortOrder
    customParams.value = additionalParams
  }

  /**
   * Atualiza parâmetros customizados
   */
  const updateCustomParams = (params: Record<string, unknown>) => {
    customParams.value = { ...customParams.value, ...params }
    page.value = 1 // Reset para a primeira página
  }

  /**
   * Alterna a ordenação de uma coluna
   */
  const toggleSort = (column: string) => {
    if (sortBy.value === column) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = column
      sortOrder.value = 'asc'
    }
  }

  return {
    // Dados
    data,
    pagination,

    // Parâmetros reativos
    page,
    limit,
    searchInput,
    search,
    sortBy,
    sortOrder,
    customParams,

    // Estado da requisição
    status,
    error,

    // Funções
    refresh,
    clear,
    resetFilters,
    updateCustomParams,
    toggleSort
  }
}
