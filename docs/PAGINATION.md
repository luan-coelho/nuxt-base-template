# Composable de Paginação Reutilizável

Este composable fornece uma solução completa e reutilizável para implementar paginação, busca, ordenação e filtros em qualquer endpoint da API.

## Uso Básico

```vue
<script setup lang="ts">
import type { User } from '~/types/user'

const { data: users, pagination, page, searchInput, status, refresh } = await usePaginatedFetch<User>('/api/users')
</script>

<template>
  <div>
    <input v-model="searchInput" placeholder="Buscar..." />

    <div v-if="status === 'pending'">Carregando...</div>

    <div v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>

    <UPagination v-model:page="page" :total="pagination.total" :items-per-page="pagination.limit" />
  </div>
</template>
```

## Opções de Configuração

```typescript
const options = {
  initialPage: 1, // Página inicial (padrão: 1)
  initialLimit: 10, // Itens por página (padrão: 10)
  initialSearch: '', // Busca inicial (padrão: '')
  initialSortBy: 'createdAt', // Campo de ordenação inicial (padrão: 'createdAt')
  initialSortOrder: 'desc', // Ordem inicial (padrão: 'desc')
  additionalParams: {}, // Parâmetros customizados adicionais
  debounceSearch: 500 // Delay do debounce em ms (padrão: 500)
}

const result = await usePaginatedFetch<T>('/api/endpoint', options)
```

## Valores Retornados

```typescript
{
  // Dados
  data: ComputedRef<T[]>,              // Array de dados tipados
  pagination: ComputedRef<PaginationMeta>, // Metadados de paginação

  // Parâmetros reativos (Refs)
  page: Ref<number>,                   // Página atual
  limit: Ref<number>,                  // Itens por página
  searchInput: Ref<string>,            // Input de busca (com debounce)
  search: Ref<string>,                 // Valor de busca aplicado
  sortBy: Ref<string>,                 // Campo de ordenação
  sortOrder: Ref<'asc' | 'desc'>,      // Ordem de ordenação
  customParams: Ref<Record<string, unknown>>, // Parâmetros customizados

  // Estado da requisição
  status: Ref<'idle' | 'pending' | 'success' | 'error'>,
  error: Ref<Error | undefined>,

  // Funções
  refresh: () => Promise<void>,        // Recarrega os dados
  clear: () => void,                   // Limpa os dados
  resetFilters: () => void,            // Reseta todos os filtros
  updateCustomParams: (params: Record<string, unknown>) => void, // Atualiza parâmetros customizados
  toggleSort: (column: string) => void // Alterna ordenação de uma coluna
}
```

## Exemplos Avançados

### Com Ordenação em Múltiplas Colunas

```vue
<script setup lang="ts">
const { data, sortBy, sortOrder, toggleSort } = await usePaginatedFetch('/api/products')

const getSortIcon = (column: string) => {
  if (sortBy.value !== column) return 'i-lucide-arrow-up-down'
  return sortOrder.value === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow'
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th @click="toggleSort('name')">
          Nome
          <Icon :name="getSortIcon('name')" />
        </th>
        <th @click="toggleSort('price')">
          Preço
          <Icon :name="getSortIcon('price')" />
        </th>
      </tr>
    </thead>
  </table>
</template>
```

### Com Filtros Customizados

```vue
<script setup lang="ts">
const { data, updateCustomParams } = await usePaginatedFetch('/api/products', {
  additionalParams: {
    category: 'electronics',
    inStock: true
  }
})

const changeCategory = (category: string) => {
  updateCustomParams({ category })
}

const toggleInStock = () => {
  updateCustomParams({ inStock: !customParams.value.inStock })
}
</script>
```

### Com Reset de Filtros

```vue
<script setup lang="ts">
const { data, searchInput, sortBy, sortOrder, resetFilters } = await usePaginatedFetch('/api/users')

const handleReset = () => {
  resetFilters()
  // Todos os filtros voltam aos valores iniciais
}
</script>

<template>
  <button @click="handleReset">Limpar Filtros</button>
</template>
```

## Tipos

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
```

### PaginationMeta

```typescript
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

## Requisitos da API

Sua API deve retornar dados no seguinte formato:

```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

E aceitar os seguintes parâmetros de query:

- `page`: Número da página
- `limit`: Itens por página
- `search`: Termo de busca
- `sortBy`: Campo para ordenar
- `sortOrder`: `asc` ou `desc`
- Quaisquer parâmetros customizados adicionais

## Benefícios

✅ **Reutilizável**: Use em qualquer componente que precise de paginação
✅ **Type-safe**: Totalmente tipado com TypeScript
✅ **Reativo**: Todos os parâmetros são reativos
✅ **Debounce**: Busca com debounce automático
✅ **Flexível**: Suporta parâmetros customizados
✅ **Completo**: Paginação, busca, ordenação e filtros em um só lugar
✅ **Performance**: Otimizado com computed e watch
