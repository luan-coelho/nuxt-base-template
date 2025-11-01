import type { PaginatedResponse, PaginationMeta } from '~/types/pagination'
import { useQuery } from '@tanstack/vue-query'
import type { UseQueryOptions } from '@tanstack/vue-query'

/**
 * Interface para opções do composable
 */
export interface UsePaginatedFetchOptions<T> {
  initialPage?: number
  initialLimit?: number
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
  additionalParams?: Record<string, unknown>
  queryOptions?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
}

/**
 * Composable para fetch paginado e reutilizável com TanStack Query
 *
 * Este composable realiza chamadas autenticadas para a API externa (Quarkus)
 * através do useFetchAPI, adicionando automaticamente o token de autenticação.
 *
 * @template T - Tipo dos dados retornados pela API
 * @param url - Endpoint da API externa (ex: '/users', '/companies') - NÃO use /api
 * @param options - Opções de configuração
 * @returns Objeto com dados, paginação e funções de controle
 *
 * @example
 * ```typescript
 * // Faz chamada autenticada para http://localhost:8080/users
 * const {
 *   data: users,
 *   pagination,
 *   page,
 *   limit,
 *   sortBy,
 *   sortOrder,
 *   isLoading,
 *   refetch
 * } = usePaginatedFetch<User>('/users', {
 *   initialLimit: 20,
 *   initialSortBy: 'createdAt',
 * })
 * ```
 */
export function usePaginatedFetch<T>(url: MaybeRefOrGetter<string>, options: UsePaginatedFetchOptions<T> = {}) {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSortBy = 'createdAt',
    initialSortOrder = 'desc',
    additionalParams = {},
    queryOptions = {}
  } = options

  const { fetchAPI } = useFetchAPI()

  // Estados reativos para parâmetros de paginação
  const page = ref(initialPage)
  const limit = ref(initialLimit)
  const sortBy = ref(initialSortBy)
  const sortOrder = ref<'asc' | 'desc'>(initialSortOrder)

  // Parâmetros adicionais customizados
  const customParams = ref(additionalParams)

  // Reset para a primeira página ao mudar a ordenação
  watch([sortBy, sortOrder], () => {
    page.value = 1
  })

  // Combina todos os parâmetros de query
  const queryParams = computed(() => ({
    page: page.value,
    limit: limit.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    ...customParams.value
  }))

  // Query key reativa
  const queryKey = computed(() => ['paginated', toValue(url), queryParams.value])

  // Usa TanStack Query para fetch paginado
  const {
    data: response,
    error,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const endpoint = toValue(url)
      const params = new URLSearchParams()

      // Adiciona todos os parâmetros à query string
      Object.entries(queryParams.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        }
      })

      const queryString = params.toString()
      const fullUrl = queryString ? `${endpoint}?${queryString}` : endpoint

      return fetchAPI<PaginatedResponse<T>>(fullUrl)
    },
    // Mantém dados anteriores enquanto carrega os novos (evita UI piscando)
    placeholderData: previousData => previousData,
    // Configurações padrão
    staleTime: 1000 * 60 * 2, // 2 minutos
    ...queryOptions
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
   * Limpa parâmetros customizados específicos
   */
  const clearCustomParams = (keys?: string[]) => {
    if (keys && keys.length > 0) {
      const newParams = { ...customParams.value }
      keys.forEach(key => {
        delete newParams[key]
      })
      customParams.value = newParams
    } else {
      customParams.value = {}
    }
    page.value = 1
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

  /**
   * Vai para uma página específica
   */
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= pagination.value.totalPages) {
      page.value = pageNumber
    }
  }

  /**
   * Vai para a próxima página
   */
  const nextPage = () => {
    if (page.value < pagination.value.totalPages) {
      page.value++
    }
  }

  /**
   * Vai para a página anterior
   */
  const prevPage = () => {
    if (page.value > 1) {
      page.value--
    }
  }

  /**
   * Vai para a primeira página
   */
  const firstPage = () => {
    page.value = 1
  }

  /**
   * Vai para a última página
   */
  const lastPage = () => {
    page.value = pagination.value.totalPages
  }

  return {
    // Dados
    data,
    pagination,

    // Parâmetros reativos
    page,
    limit,
    sortBy,
    sortOrder,
    customParams,

    // Estado da requisição
    error,
    isLoading,
    isFetching,
    isError,

    // Funções de controle
    refetch,
    resetFilters,
    updateCustomParams,
    clearCustomParams,
    toggleSort,

    // Funções de navegação
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,

    // Computed helpers
    hasNextPage: computed(() => page.value < pagination.value.totalPages),
    hasPrevPage: computed(() => page.value > 1),
    isFirstPage: computed(() => page.value === 1),
    isLastPage: computed(() => page.value === pagination.value.totalPages)
  }
}
