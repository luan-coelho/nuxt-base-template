# 🚀 Quick Start: TanStack Query + Autenticação

Guia rápido para começar a usar TanStack Query com autenticação no projeto.

## 📦 O que foi implementado?

✅ **useFetchAPI()** - Composable para requisições autenticadas  
✅ **useUsers()** - Hooks para CRUD de usuários  
✅ **Plugin vue-query** - Configuração global otimizada  
✅ **Refresh automático** - Tokens expirados são renovados automaticamente  
✅ **Type-safe** - Totalmente tipado com TypeScript

## 🎯 Uso Rápido

### 1. Query (GET)

```vue
<script setup lang="ts">
import { useUsersQuery } from '~/composables/useUsers'

const { data, isLoading, error } = useUsersQuery()
</script>

<template>
  <div v-if="isLoading">Carregando...</div>
  <div v-else-if="error">Erro: {{ error.message }}</div>
  <div v-else>
    <div v-for="user in data" :key="user.id">
      {{ user.name }}
    </div>
  </div>
</template>
```

### 2. Mutation (POST/PUT/DELETE)

```vue
<script setup lang="ts">
import { useCreateUserMutation } from '~/composables/useUsers'

const { mutate: createUser, isPending } = useCreateUserMutation()

const handleSubmit = formData => {
  createUser(formData, {
    onSuccess: user => {
      console.log('Criado:', user)
      // Cache é automaticamente atualizado!
    }
  })
}
</script>
```

### 3. Query com Parâmetros Dinâmicos

```vue
<script setup lang="ts">
import { useUserQuery } from '~/composables/useUsers'

const route = useRoute()
const userId = computed(() => route.params.id)

// Query reage automaticamente a mudanças em userId
const { data: user, isLoading } = useUserQuery(userId)
</script>
```

### 4. Paginação

```vue
<script setup lang="ts">
import { usePaginatedUsersQuery } from '~/composables/useUsers'

const page = ref(0)
const size = ref(10)

const { data, isLoading } = usePaginatedUsersQuery({ page, size })

// Mudar page.value automaticamente refetch os dados
</script>
```

## 🔧 Como Criar Suas Próprias Queries

### Exemplo: Composable para Companies

```typescript
// app/composables/useCompanies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export const useCompaniesQuery = () => {
  const { fetchAPI } = useFetchAPI()

  return useQuery({
    queryKey: ['companies'],
    queryFn: () => fetchAPI('/companies'),
    staleTime: 1000 * 60 * 5 // 5 minutos
  })
}

export const useCreateCompanyMutation = () => {
  const { fetchAPI } = useFetchAPI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data =>
      fetchAPI('/companies', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      // Invalida o cache para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })
}
```

### Uso Direto do fetchAPI (para casos simples)

```typescript
const { fetchAPI } = useFetchAPI()

// GET
const companies = await fetchAPI('/companies')

// POST
const newCompany = await fetchAPI('/companies', {
  method: 'POST',
  body: { name: 'Acme Corp' }
})

// PUT
await fetchAPI(`/companies/${id}`, {
  method: 'PUT',
  body: { name: 'New Name' }
})

// DELETE
await fetchAPI(`/companies/${id}`, { method: 'DELETE' })
```

## 🎨 Estrutura de Query Keys

Use hierarquia para facilitar invalidação:

```typescript
['users']                     // Todos os usuários
['users', userId]             // Usuário específico
['users', 'paginated', ...]   // Usuários paginados

['companies']                 // Todas as empresas
['companies', companyId]      // Empresa específica
['companies', companyId, 'employees'] // Funcionários da empresa
```

## 💡 Dicas Importantes

### 1. Invalidação de Cache

Sempre invalide queries relacionadas após mutations:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['users'] })
}
```

### 2. Query Condicional

Use `enabled` para executar query apenas quando necessário:

```typescript
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchAPI(`/users/${userId}`),
  enabled: () => !!userId // Só executa se userId existir
})
```

### 3. Tratamento de Erros

```typescript
const { data, error, isError } = useUsersQuery()

watch(isError, hasError => {
  if (hasError) {
    console.error('Erro:', error.value)
    // Mostrar toast, modal, etc
  }
})
```

### 4. Loading States

```typescript
const { isLoading, isFetching, isRefetching } = useUsersQuery()

// isLoading: Primeira vez carregando (sem dados em cache)
// isFetching: Qualquer fetch (incluindo background)
// isRefetching: Refetch de dados existentes
```

## 🔍 QueryClient Helpers

```typescript
const queryClient = useQueryClient()

// Ver dados em cache
const cachedUsers = queryClient.getQueryData(['users'])

// Atualizar cache manualmente
queryClient.setQueryData(['users', '123'], updatedUser)

// Invalidar queries
queryClient.invalidateQueries({ queryKey: ['users'] })

// Remover do cache
queryClient.removeQueries({ queryKey: ['users', '123'] })

// Prefetch (carregar antes)
await queryClient.prefetchQuery({
  queryKey: ['users'],
  queryFn: () => fetchAPI('/users')
})
```

## 📚 Arquivos Importantes

- **`app/composables/useFetchAPI.ts`** - Fetch autenticado
- **`app/composables/useUsers.ts`** - Exemplo completo de hooks
- **`app/plugins/vue-query.ts`** - Configuração do QueryClient
- **`docs/tanstack-query-integration.md`** - Documentação completa
- **`docs/example-component-tanstack-query.vue`** - Componente de exemplo

## 🆘 Troubleshooting

### "Token de acesso não encontrado"

- Verifique se o usuário está autenticado
- Use `enabled: loggedIn` em queries que precisam de auth

### Query não atualiza após mutation

- Adicione `invalidateQueries` no `onSuccess` da mutation

### Muitos fetches desnecessários

- Aumente o `staleTime` da query
- Verifique se não está criando múltiplas instâncias da mesma query

## 📖 Próximos Passos

1. Leia a [documentação completa](./tanstack-query-integration.md)
2. Veja o [componente de exemplo](./example-component-tanstack-query.vue)
3. Crie seus próprios composables seguindo o padrão de `useUsers.ts`
4. Explore a [documentação oficial do TanStack Query](https://tanstack.com/query/latest/docs/framework/vue/overview)

---

**Dúvidas?** Consulte a documentação completa em `docs/tanstack-query-integration.md`
