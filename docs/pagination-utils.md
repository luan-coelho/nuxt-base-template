# Utilitário de Paginação - Guia de Uso

Este documento descreve como usar o composable `usePagination` e `useLazyPagination` para implementar paginação de dados com o componente `UPagination` do Nuxt UI.

## Visão Geral

O composable `usePagination` fornece uma solução completa para paginação:

- ✅ Integração perfeita com o componente `UPagination` do Nuxt UI
- ✅ Funciona com SSR (Server-Side Rendering)
- ✅ Estado reativo da página atual
- ✅ Funções auxiliares para navegação (próximo, anterior, ir para página)
- ✅ Suporte a query parameters adicionais (busca, filtros, etc)
- ✅ Tipagem forte com TypeScript
- ✅ Atualização automática dos dados ao mudar de página

## Interface da Resposta da API

O composable espera que a API retorne dados no seguinte formato:

```typescript
interface PaginatedResponse<T> {
  data: T[] // Array com os dados da página atual
  total: number // Total de itens
  page: number // Página atual
  limit: number // Itens por página
  totalPages: number // Total de páginas
}
```

**Exemplo de resposta:**

```json
{
  "data": [
    { "id": 1, "name": "João Silva" },
    { "id": 2, "name": "Maria Santos" }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

## Uso Básico

### Listagem Simples com Paginação

```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
}

const {
  data: users,
  page,
  total,
  pending,
  error
} = await usePagination<User>('/users', {
  limit: 10
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center p-8">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-500">Erro ao carregar usuários: {{ error.message }}</div>

    <!-- Content -->
    <div v-else>
      <!-- Lista de usuários -->
      <div class="space-y-2">
        <UCard v-for="user in users" :key="user.id">
          <div>
            <h3 class="font-semibold">{{ user.name }}</h3>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </UCard>
      </div>

      <!-- Paginação -->
      <UPagination v-model:page="page" :total="total" :items-per-page="10" show-edges class="mt-6" />
    </div>
  </div>
</template>
```

## Uso com Busca e Filtros

```vue
<script setup lang="ts">
interface Post {
  id: string
  title: string
  content: string
  author: string
}

// Estados dos filtros
const search = ref('')
const author = ref('')

// Paginação com query parameters reativos
const {
  data: posts,
  page,
  total,
  totalPages,
  pending
} = await usePagination<Post>('/posts', {
  limit: 20,
  query: {
    search,
    author
  }
})

// Informações para exibição
const startItem = computed(() => (page.value - 1) * 20 + 1)
const endItem = computed(() => Math.min(page.value * 20, total.value))
</script>

<template>
  <div class="space-y-6">
    <!-- Filtros -->
    <div class="flex gap-4">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar posts..." class="flex-1" />
      <UInput v-model="author" icon="i-lucide-user" placeholder="Filtrar por autor..." class="w-64" />
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center p-8">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
    </div>

    <!-- Lista de posts -->
    <div v-else class="space-y-4">
      <UCard v-for="post in posts" :key="post.id">
        <h3 class="text-lg font-bold">{{ post.title }}</h3>
        <p class="mt-2 text-gray-600">{{ post.content }}</p>
        <p class="mt-2 text-sm text-gray-500">Por {{ post.author }}</p>
      </UCard>
    </div>

    <!-- Informações e Paginação -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">Mostrando {{ startItem }} a {{ endItem }} de {{ total }} resultados</p>

      <UPagination v-model:page="page" :total="total" :items-per-page="20" show-edges show-controls />
    </div>
  </div>
</template>
```

## Uso com Tabela (UTable)

```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
}

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'role', label: 'Função' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Ações' }
]

const {
  data: users,
  page,
  total,
  limit,
  pending
} = await usePagination<User>('/users', {
  limit: 15
})
</script>

<template>
  <div class="space-y-4">
    <UTable :rows="users || []" :columns="columns" :loading="pending">
      <template #status-data="{ row }">
        <UBadge :color="row.status === 'active' ? 'success' : 'neutral'">
          {{ row.status === 'active' ? 'Ativo' : 'Inativo' }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <UButton icon="i-lucide-pencil" size="sm" color="neutral" variant="ghost" @click="editUser(row)" />
      </template>
    </UTable>

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">Total: {{ total }} usuários</p>

      <UPagination v-model:page="page" :total="total" :items-per-page="limit" />
    </div>
  </div>
</template>
```

## Navegação Manual

```vue
<script setup lang="ts">
const { data: items, page, nextPage, prevPage, goToPage, hasNext, hasPrev } = await usePagination('/items')
</script>

<template>
  <div class="space-y-4">
    <div>
      <!-- Conteúdo -->
    </div>

    <!-- Navegação customizada -->
    <div class="flex items-center justify-between">
      <UButton :disabled="!hasPrev" icon="i-lucide-chevron-left" @click="prevPage">Anterior</UButton>

      <div class="flex gap-2">
        <UButton
          v-for="pageNum in [1, 2, 3, 4, 5]"
          :key="pageNum"
          :variant="page === pageNum ? 'solid' : 'outline'"
          @click="goToPage(pageNum)">
          {{ pageNum }}
        </UButton>
      </div>

      <UButton :disabled="!hasNext" trailing-icon="i-lucide-chevron-right" @click="nextPage">Próxima</UButton>
    </div>
  </div>
</template>
```

## useLazyPagination

Use `useLazyPagination` quando **não** quiser bloquear a navegação:

```vue
<script setup lang="ts">
// Não bloqueia a navegação da página
const {
  data: comments,
  page,
  pending
} = useLazyPagination<Comment>('/comments', {
  limit: 5
})
</script>

<template>
  <div>
    <div v-if="pending" class="text-gray-500">Carregando comentários...</div>

    <div v-else class="space-y-2">
      <div v-for="comment in comments" :key="comment.id">
        {{ comment.text }}
      </div>
    </div>

    <UPagination v-model:page="page" :total="total" :items-per-page="5" class="mt-4" />
  </div>
</template>
```

## Customização do Componente UPagination

### Tamanho

```vue
<UPagination v-model:page="page" :total="total" size="xl" />
```

### Cores

```vue
<UPagination v-model:page="page" :total="total" color="primary" active-color="neutral" active-variant="solid" />
```

### Controles e Bordas

```vue
<UPagination
  v-model:page="page"
  :total="total"
  show-controls    <!-- Mostra botões primeira/última página -->
  show-edges       <!-- Sempre mostra primeira e última página -->
  :sibling-count="1" <!-- Quantidade de páginas ao redor da atual -->
/>
```

## API Completa

### usePagination / useLazyPagination

**Parâmetros:**

- `url` (string): Endpoint da API
- `options` (objeto):
  - `limit` (number): Itens por página (padrão: 10)
  - `query` (objeto): Query parameters adicionais
  - Todas as opções do `useFetch`

**Retorno:**

- `data` (Ref): Dados da página atual
- `page` (Ref): Página atual (reativa, pode ser usada com v-model)
- `total` (Ref): Total de itens
- `limit` (Ref): Itens por página
- `totalPages` (Ref): Total de páginas
- `pending` (Ref): Estado de carregamento
- `error` (Ref): Erro, se houver
- `refresh` (função): Atualiza os dados
- `nextPage` (função): Vai para próxima página
- `prevPage` (função): Vai para página anterior
- `goToPage` (função): Vai para página específica
- `hasNext` (Ref): Se há próxima página
- `hasPrev` (Ref): Se há página anterior

## Exemplo Backend (Node.js/Express)

Para o composable funcionar, sua API deve retornar dados no formato esperado:

```typescript
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const search = req.query.search || ''

  // Busca no banco de dados
  const offset = (page - 1) * limit
  const [users, total] = await Promise.all([
    db.users.findMany({
      where: { name: { contains: search } },
      skip: offset,
      take: limit
    }),
    db.users.count({
      where: { name: { contains: search } }
    })
  ])

  const totalPages = Math.ceil(total / limit)

  res.json({
    data: users,
    total,
    page,
    limit,
    totalPages
  })
})
```

## Boas Práticas

### 1. ✅ Use await com usePagination para SSR

```typescript
// ✅ Bom - SSR-friendly
const { data } = await usePagination('/users')

// ❌ Ruim - não funciona com SSR
const { data } = usePagination('/users')
```

### 2. ✅ Use useLazyPagination para dados secundários

```typescript
// ✅ Bom - não bloqueia navegação
const { data: comments } = useLazyPagination('/comments')
```

### 3. ✅ Defina tipos para seus dados

```typescript
// ✅ Bom - tipado
interface User {
  id: string
  name: string
}

const { data } = await usePagination<User>('/users')
// data é Ref<User[] | null>
```

### 4. ✅ Use v-model:page com UPagination

```vue
<!-- ✅ Bom - sincronização automática -->
<UPagination v-model:page="page" :total="total" />
```

### 5. ✅ Exiba informações úteis

```vue
<!-- ✅ Bom - usuário sabe onde está -->
<p>Mostrando {{ startItem }} a {{ endItem }} de {{ total }}</p>
```

## Troubleshooting

### Dados não carregam ao mudar de página

Verifique se o backend está recebendo os parâmetros `page` e `limit`:

```typescript
// No backend, log os parâmetros
console.log('Query params:', req.query)
// Deve exibir: { page: '2', limit: '10' }
```

### Paginação não aparece

Certifique-se de que `total` está sendo retornado pela API:

```typescript
const { data, total } = await usePagination('/users')
console.log('Total:', total.value) // Deve ter um número > 0
```

### Watch não funciona com query parameters

Adicione os refs ao array `watch`:

```typescript
const search = ref('')
const { data } = await usePagination('/users', {
  query: { search },
  watch: [search] // ✅ Adicione aqui
})
```

## Referências

- [Documentação Nuxt UI - Pagination](https://ui.nuxt.com/components/pagination)
- [Documentação Nuxt - useFetch](https://nuxt.com/docs/api/composables/use-fetch)
- [Guia de Utilitários de API](./api-utils.md)
