# ✅ Atualização: usePaginatedFetch com TanStack Query

## 📋 Resumo das Mudanças

Refatorei o composable `usePaginatedFetch` para usar **TanStack Query** em vez de `useFetch` do Nuxt, integrando-o com a autenticação automática via `useFetchAPI`.

---

## 🔄 Principais Mudanças

### **Antes (useFetch do Nuxt)**

```typescript
import type { UseFetchOptions } from 'nuxt/app'

export function usePaginatedFetch<T>(url: string, options) {
  const {
    data: response,
    status,
    error,
    refresh,
    clear
  } = useFetch<PaginatedResponse<T>>(url, {
    query: queryParams,
    watch: [page, limit, sortBy, sortOrder, customParams]
  })

  // ...
}
```

**Problemas:**

- ❌ Sem autenticação automática
- ❌ Sem refresh automático de tokens
- ❌ Cache menos inteligente
- ❌ Necessário `await` no componente

### **Depois (TanStack Query)**

```typescript
import { useQuery } from '@tanstack/vue-query'

export function usePaginatedFetch<T>(url: MaybeRefOrGetter<string>, options) {
  const { fetchAPI } = useFetchAPI()

  const {
    data: response,
    error,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const endpoint = toValue(url)
      const params = new URLSearchParams()
      // ...
      return fetchAPI<PaginatedResponse<T>>(fullUrl)
    },
    placeholderData: previousData => previousData,
    staleTime: 1000 * 60 * 2 // 2 minutos
  })

  // ...
}
```

**Benefícios:**

- ✅ Autenticação automática via `useFetchAPI`
- ✅ Refresh automático de tokens expirados
- ✅ Cache inteligente do TanStack Query
- ✅ Não precisa de `await` no componente
- ✅ `placeholderData` evita UI piscando
- ✅ Estados de loading mais precisos

---

## 📦 Nova Interface e Recursos

### **Interface Atualizada**

```typescript
export interface UsePaginatedFetchOptions<T> {
  initialPage?: number
  initialLimit?: number
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
  additionalParams?: Record<string, unknown>
  queryOptions?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
}
```

**Novidades:**

- ✨ `queryOptions` para customizar o TanStack Query
- ✨ Suporte a `MaybeRefOrGetter` para URLs dinâmicas

### **Retorno Estendido**

```typescript
return {
  // Dados (mesmos de antes)
  data,
  pagination,

  // Parâmetros reativos (mesmos de antes)
  page,
  limit,
  sortBy,
  sortOrder,
  customParams,

  // Estado da requisição (melhorado)
  error,
  isLoading, // Primeira vez carregando
  isFetching, // Qualquer fetch (incluindo background)
  isError,

  // Funções de controle (atualizadas + novas)
  refetch, // ⚠️ Mudou de `refresh` para `refetch`
  resetFilters,
  updateCustomParams,
  clearCustomParams, // ✨ NOVA
  toggleSort,

  // ✨ NOVAS - Funções de navegação
  goToPage,
  nextPage,
  prevPage,
  firstPage,
  lastPage,

  // ✨ NOVOS - Computed helpers
  hasNextPage,
  hasPrevPage,
  isFirstPage,
  isLastPage
}
```

---

## 🔧 Como Usar (Atualizado)

### **Uso Básico**

```vue
<script setup lang="ts">
// ⚠️ MUDANÇAS:
// 1. URL sem prefixo '/api' (adicionado automaticamente)
// 2. Remover 'await' (não é mais necessário)
// 3. 'refresh' → 'refetch'

const {
  data: users,
  pagination,
  page,
  isLoading,
  refetch // ⚠️ Mudou de 'refresh'
} = usePaginatedFetch<User>('/users', {
  // ⚠️ Sem '/api'
  initialLimit: 10,
  initialSortBy: 'createdAt'
})
</script>

<template>
  <div v-if="isLoading">Carregando...</div>
  <div v-else>
    <div v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>

    <button @click="refetch()">Atualizar</button>
    <!-- ⚠️ refetch -->
  </div>
</template>
```

### **Uso com URL Dinâmica**

```vue
<script setup lang="ts">
const route = useRoute()
const companyId = computed(() => route.params.id)

// URL reativa - automaticamente refetch quando companyId mudar
const { data: units, isLoading } = usePaginatedFetch<Unit>(
  computed(() => `/companies/${companyId.value}/units`),
  { initialLimit: 10 }
)
</script>
```

### **Novas Funções de Navegação**

```vue
<script setup lang="ts">
const {
  data: users,
  pagination,
  page,

  // Funções de navegação
  nextPage,
  prevPage,
  firstPage,
  lastPage,
  goToPage,

  // Helpers
  hasNextPage,
  hasPrevPage,
  isFirstPage,
  isLastPage
} = usePaginatedFetch<User>('/users')
</script>

<template>
  <div>
    <!-- Paginação com as novas funções -->
    <button @click="firstPage" :disabled="isFirstPage">Primeira</button>
    <button @click="prevPage" :disabled="!hasPrevPage">Anterior</button>
    <span>Página {{ page }} de {{ pagination.totalPages }}</span>
    <button @click="nextPage" :disabled="!hasNextPage">Próxima</button>
    <button @click="lastPage" :disabled="isLastPage">Última</button>

    <!-- Ou ir para página específica -->
    <button @click="goToPage(5)">Ir para página 5</button>
  </div>
</template>
```

### **Limpar Filtros Customizados**

```vue
<script setup lang="ts">
const {
  data: users,
  customParams,
  updateCustomParams,
  clearCustomParams // ✨ Nova função
} = usePaginatedFetch<User>('/users')

// Adicionar filtros
const filterByStatus = (status: string) => {
  updateCustomParams({ status })
}

// Limpar filtros específicos
const clearStatusFilter = () => {
  clearCustomParams(['status'])
}

// Limpar todos os filtros
const clearAllFilters = () => {
  clearCustomParams()
}
</script>
```

### **Customizar TanStack Query**

```typescript
const { data, isLoading } = usePaginatedFetch<User>('/users', {
  initialLimit: 20,
  queryOptions: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
    refetchOnWindowFocus: true, // Refetch ao focar janela
    retry: 3 // 3 tentativas em caso de erro
  }
})
```

---

## 🔄 Migração dos Componentes Existentes

### **Mudanças Necessárias**

#### **1. Remover `await`**

```typescript
// ❌ Antes
const { data } = await usePaginatedFetch('/api/users')

// ✅ Depois
const { data } = usePaginatedFetch('/users')
```

#### **2. Remover prefixo `/api` da URL**

```typescript
// ❌ Antes
usePaginatedFetch('/api/users')
usePaginatedFetch('/api/soc/companies')

// ✅ Depois
usePaginatedFetch('/users')
usePaginatedFetch('/soc/companies')
```

#### **3. Trocar `refresh` por `refetch`**

```vue
<!-- ❌ Antes -->
<button @click="refresh()">Atualizar</button>
<UsersAddModal @user-created="refresh" />

<!-- ✅ Depois -->
<button @click="refetch()">Atualizar</button>
<UsersAddModal @user-created="refetch" />
```

#### **4. Remover `clear` (se usado)**

```typescript
// ❌ Antes
const { clear } = usePaginatedFetch('/api/users')
clear()

// ✅ Depois - use resetFilters ou refetch
const { resetFilters, refetch } = usePaginatedFetch('/users')
resetFilters() // Reseta filtros e volta para página 1
refetch() // Apenas refaz o fetch
```

---

## 📊 Arquivos Atualizados

### **Composable**

- ✅ `app/composables/usePaginatedFetch.ts`

### **Páginas Migradas**

- ✅ `app/pages/users/index.vue`
- ✅ `app/pages/soc/companies/index.vue`
- ✅ `app/pages/soc/companies/[id].vue`

---

## 🎯 Benefícios da Migração

### **1. Autenticação Transparente**

```typescript
// Antes: sem autenticação
useFetch('/api/users') // ❌ Não envia token

// Depois: autenticação automática
usePaginatedFetch('/users') // ✅ Token adicionado automaticamente
```

### **2. Refresh Automático de Tokens**

```typescript
// Sistema automaticamente:
// 1. Detecta token expirado (401)
// 2. Faz refresh do token
// 3. Refaz a requisição com novo token
// 4. Tudo transparente! 🎉
```

### **3. Cache Inteligente**

```typescript
// Primeira vez: busca da API
const { data } = usePaginatedFetch('/users')

// Segunda vez (em outro componente, dentro de 2 min): retorna do cache
const { data } = usePaginatedFetch('/users') // ⚡ Instantâneo!
```

### **4. Sem Loading Flash**

```typescript
// placeholderData mantém dados antigos enquanto carrega novos
// UI não "pisca" ao mudar de página
page.value = 2 // Mantém dados da página 1 até página 2 carregar ✨
```

### **5. Estados Mais Precisos**

```typescript
const { isLoading, isFetching } = usePaginatedFetch('/users')

// isLoading: true apenas na PRIMEIRA vez (sem dados em cache)
// isFetching: true SEMPRE que está buscando (incluindo background)

// Perfeito para diferentes indicadores de loading:
// - isLoading: spinner/skeleton (primeira vez)
// - isFetching: indicador sutil (atualizações)
```

### **6. Sincronização Automática**

```typescript
// Se você criar/editar/deletar em um componente
// Todos os outros componentes usando usePaginatedFetch são atualizados!

// Componente A: lista de usuários
const { data: users } = usePaginatedFetch('/users')

// Componente B: cria usuário
const { mutate: createUser } = useCreateUserMutation()
createUser(data, {
  onSuccess: () => {
    // Cache de '/users' é invalidado automaticamente
    // Componente A é atualizado automaticamente! 🎊
  }
})
```

---

## 🚀 Próximos Passos

### **Padrão para Novos Composables Paginados**

Use este template para criar novos composables paginados:

```typescript
// app/composables/useCompanies.ts
export const usePaginatedCompaniesQuery = (filters?: {
  status?: MaybeRefOrGetter<string>
  city?: MaybeRefOrGetter<string>
}) => {
  return usePaginatedFetch<Company>('/companies', {
    initialLimit: 15,
    initialSortBy: 'name',
    additionalParams: computed(() => ({
      status: toValue(filters?.status),
      city: toValue(filters?.city)
    }))
  })
}
```

**Uso:**

```vue
<script setup lang="ts">
const statusFilter = ref('active')
const { data: companies, isLoading } = usePaginatedCompaniesQuery({
  status: statusFilter
})

// Mudar statusFilter automaticamente refetch!
statusFilter.value = 'inactive'
</script>
```

---

## 📚 Recursos Relacionados

- **Documentação Principal**: `docs/tanstack-query-integration.md`
- **Quick Start**: `docs/QUICK-START-TANSTACK-QUERY.md`
- **Implementação**: `docs/IMPLEMENTACAO-TANSTACK-QUERY.md`
- **Composables**:
  - `app/composables/useFetchAPI.ts`
  - `app/composables/usePaginatedFetch.ts`
  - `app/composables/useUsers.ts`

---

## 🎉 Conclusão

O `usePaginatedFetch` agora:

- 🔐 Tem autenticação automática
- 🔄 Refresh automático de tokens
- 💾 Cache inteligente do TanStack Query
- ⚡ Melhor performance
- 🎨 Melhor UX (sem loading flash)
- 🧩 Mais fácil de usar
- 🐛 Mais fácil de debugar

**Código mais limpo e funcionalidade mais robusta!** 🚀
