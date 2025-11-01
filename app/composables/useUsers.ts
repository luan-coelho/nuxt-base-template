/**
 * Composable para gerenciar operações de usuários com TanStack Query
 *
 * Este composable fornece hooks para queries e mutations relacionadas a usuários,
 * utilizando o TanStack Query para gerenciamento de cache e estado.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UserSchema, CreateUserSchema, UpdateUserSchema } from '~/types/user'

/**
 * Hook para buscar lista de usuários
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { data: users, isLoading, error, refetch } = useUsersQuery()
 * </script>
 *
 * <template>
 *   <div v-if="isLoading">Carregando...</div>
 *   <div v-else-if="error">Erro: {{ error.message }}</div>
 *   <div v-else>
 *     <div v-for="user in users" :key="user.id">
 *       {{ user.name }} - {{ user.email }}
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export const useUsersQuery = () => {
  const { fetchAPI } = useFetchAPI()

  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchAPI<UserSchema[]>('/users'),
    // Configurações opcionais específicas para esta query
    staleTime: 1000 * 60 * 5 // 5 minutos
  })
}

/**
 * Hook para buscar um usuário específico por ID
 *
 * @param userId - ID do usuário (pode ser um Ref ou valor direto)
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const route = useRoute()
 * const userId = computed(() => route.params.id as string)
 *
 * const { data: user, isLoading } = useUserQuery(userId)
 * </script>
 * ```
 */
export const useUserQuery = (userId: MaybeRefOrGetter<string>) => {
  const { fetchAPI } = useFetchAPI()

  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchAPI<UserSchema>(`/users/${toValue(userId)}`),
    // Só executa a query se userId estiver definido
    enabled: () => !!toValue(userId),
    staleTime: 1000 * 60 * 5
  })
}

/**
 * Hook para criar um novo usuário
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { mutate: createUser, isPending, isError, error } = useCreateUserMutation()
 *
 * const handleSubmit = () => {
 *   createUser(
 *     { name: 'João', email: 'joao@example.com', password: '123456' },
 *     {
 *       onSuccess: (user) => {
 *         console.log('Usuário criado:', user)
 *         navigateTo(`/users/${user.id}`)
 *       },
 *       onError: (error) => {
 *         console.error('Erro ao criar usuário:', error)
 *       }
 *     }
 *   )
 * }
 * </script>
 * ```
 */
export const useCreateUserMutation = () => {
  const { fetchAPI } = useFetchAPI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserSchema) =>
      fetchAPI<UserSchema & { temporaryPassword?: string }>('/users', {
        method: 'POST',
        body: userData
      }),
    onSuccess: newUser => {
      // Invalida a lista de usuários para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Adiciona o novo usuário ao cache
      queryClient.setQueryData(['users', newUser.id], newUser)
    }
  })
}

/**
 * Hook para atualizar um usuário existente
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { mutate: updateUser, isPending } = useUpdateUserMutation()
 *
 * const handleUpdate = (userId: string) => {
 *   updateUser(
 *     { id: userId, name: 'João Silva' },
 *     {
 *       onSuccess: () => {
 *         console.log('Usuário atualizado!')
 *       }
 *     }
 *   )
 * }
 * </script>
 * ```
 */
export const useUpdateUserMutation = () => {
  const { fetchAPI } = useFetchAPI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...userData }: UpdateUserSchema & { id: string }) =>
      fetchAPI<UserSchema>(`/users/${id}`, {
        method: 'PUT',
        body: userData
      }),
    onSuccess: (updatedUser, variables) => {
      // Invalida a lista de usuários
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Atualiza o cache do usuário específico
      queryClient.setQueryData(['users', variables.id], updatedUser)
    }
  })
}

/**
 * Hook para deletar um usuário
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { mutate: deleteUser, isPending } = useDeleteUserMutation()
 *
 * const handleDelete = (userId: string) => {
 *   if (confirm('Tem certeza que deseja deletar?')) {
 *     deleteUser(userId, {
 *       onSuccess: () => {
 *         console.log('Usuário deletado!')
 *         navigateTo('/users')
 *       }
 *     })
 *   }
 * }
 * </script>
 * ```
 */
export const useDeleteUserMutation = () => {
  const { fetchAPI } = useFetchAPI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      fetchAPI(`/users/${userId}`, {
        method: 'DELETE'
      }),
    onSuccess: (_, deletedUserId) => {
      // Invalida a lista de usuários
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Remove o usuário do cache
      queryClient.removeQueries({ queryKey: ['users', deletedUserId] })
    }
  })
}

/**
 * Hook para buscar usuários com paginação
 *
 * @param options - Opções de paginação (page, size, sort)
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const page = ref(0)
 * const size = ref(10)
 *
 * const { data, isLoading } = usePaginatedUsersQuery({ page, size })
 *
 * const nextPage = () => page.value++
 * const prevPage = () => page.value--
 * </script>
 * ```
 */
export const usePaginatedUsersQuery = (options: {
  page: MaybeRefOrGetter<number>
  size: MaybeRefOrGetter<number>
  sort?: MaybeRefOrGetter<string>
}) => {
  const { fetchAPI } = useFetchAPI()

  return useQuery({
    queryKey: ['users', 'paginated', options.page, options.size, options.sort],
    queryFn: () => {
      const page = toValue(options.page)
      const size = toValue(options.size)
      const sort = toValue(options.sort)

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(sort && { sort })
      })

      return fetchAPI<{
        content: UserSchema[]
        totalElements: number
        totalPages: number
        number: number
        size: number
      }>(`/users?${params.toString()}`)
    },
    // Mantém os dados da página anterior enquanto carrega a próxima
    placeholderData: previousData => previousData
  })
}
