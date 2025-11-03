import type { UseFetchOptions } from '#app'
import type { Ref } from 'vue'

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

/**
 * Composable para manipular paginação com a API
 *
 * @example
 * ```typescript
 * // Uso básico
 * const {
 *   data: users,
 *   page,
 *   total,
 *   pending,
 *   nextPage,
 *   prevPage
 * } = await usePagination<User>('/users')
 * ```
 *
 * @example
 * ```typescript
 * // Com parâmetros customizados
 * const searchTerm = ref('')
 * const {
 *   data: posts,
 *   page,
 *   total,
 *   totalPages
 * } = await usePagination<Post>('/posts', {
 *   limit: 20,
 *   query: {
 *     search: searchTerm
 *   }
 * })
 * ```
 *
 * @param url - Endpoint da API
 * @param options - Opções do useFetch e parâmetros de paginação
 * @returns Objeto com dados paginados e funções de controle
 */
export async function usePagination<T>(
  url: string,
  options: UseFetchOptions<PaginatedResponse<T>> & {
    limit?: number
    query?: Record<string, any>
  } = {}
): Promise<UsePaginationReturn<T>> {
  // Estado da paginação
  const page = ref(1)
  const limit = ref(options.limit || 10)

  // Monta a query com os parâmetros de paginação
  const query = computed(() => ({
    page: page.value,
    limit: limit.value,
    ...options.query
  }))

  // Faz a requisição usando useAPI
  const {
    data: response,
    pending,
    error,
    refresh
  } = await useAPI<PaginatedResponse<T>>(url, {
    ...options,
    query,
    watch: [page, ...(options.watch || [])]
  })

  // Dados extraídos da resposta
  const data = computed(() => response.value?.data ?? null)
  const total = computed(() => response.value?.total ?? 0)
  const totalPages = computed(() => response.value?.totalPages ?? 0)

  // Funções de navegação
  const nextPage = () => {
    if (page.value < totalPages.value) {
      page.value++
    }
  }

  const prevPage = () => {
    if (page.value > 1) {
      page.value--
    }
  }

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages.value) {
      page.value = pageNumber
    }
  }

  // Computed properties para verificação
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  return {
    data,
    page,
    total,
    limit,
    totalPages,
    pending,
    error,
    refresh,
    nextPage,
    prevPage,
    goToPage,
    hasNext,
    hasPrev
  }
}

/**
 * Versão lazy do usePagination que não bloqueia a navegação
 *
 * @example
 * ```typescript
 * const { data: comments, page, pending } = useLazyPagination<Comment>('/comments')
 * ```
 */
export function useLazyPagination<T>(
  url: string,
  options: UseFetchOptions<PaginatedResponse<T>> & {
    limit?: number
    query?: Record<string, any>
  } = {}
): UsePaginationReturn<T> {
  const page = ref(1)
  const limit = ref(options.limit || 10)

  const query = computed(() => ({
    page: page.value,
    limit: limit.value,
    ...options.query
  }))

  const {
    data: response,
    pending,
    error,
    refresh
  } = useLazyAPI<PaginatedResponse<T>>(url, {
    ...options,
    query,
    watch: [page, ...(options.watch || [])]
  })

  const data = computed(() => response.value?.data ?? null)
  const total = computed(() => response.value?.total ?? 0)
  const totalPages = computed(() => response.value?.totalPages ?? 0)

  const nextPage = () => {
    if (page.value < totalPages.value) {
      page.value++
    }
  }

  const prevPage = () => {
    if (page.value > 1) {
      page.value--
    }
  }

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages.value) {
      page.value = pageNumber
    }
  }

  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  return {
    data,
    page,
    total,
    limit,
    totalPages,
    pending,
    error,
    refresh,
    nextPage,
    prevPage,
    goToPage,
    hasNext,
    hasPrev
  }
}
