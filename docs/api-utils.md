# Utilitários de API - Guia de Uso

Este documento descreve como usar os utilitários de API do projeto para fazer chamadas ao backend de forma consistente e tipada.

## Visão Geral

O projeto fornece um conjunto de composables e plugins para facilitar a comunicação com o backend:

- **Plugin `$api`**: Instância customizada de `$fetch` com configurações globais
- **Composable `useAPI`**: Wrapper de `useFetch` que usa a instância `$api`
- **Composables auxiliares**: `useLazyAPI`, `useAsyncAPI`, `useLazyAsyncAPI`

## Plugin $api

O plugin `$api` é uma instância customizada de `$fetch` que:

- ✅ Adiciona automaticamente a `baseURL` configurada
- ✅ Inclui cookies para autenticação (JWT HTTP-only)
- ✅ Trata erros de forma consistente
- ✅ Redireciona para login automaticamente em caso de 401
- ✅ Propaga cookies do backend para o cliente durante SSR

### Acesso Direto ao $api

Você pode usar `$api` diretamente quando precisar de mais controle:

```typescript
<script setup lang="ts">
const { $api } = useNuxtApp()

// GET request
const users = await $api<User[]>('/users')

// POST request
const newUser = await $api('/users', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})

// PUT request
const updated = await $api(`/users/${id}`, {
  method: 'PUT',
  body: userData
})

// DELETE request
await $api(`/users/${id}`, {
  method: 'DELETE'
})
</script>
```

⚠️ **Atenção**: Usar `$api` diretamente **não** fornece os benefícios de SSR e caching do `useFetch`. Use `useAPI` quando possível.

## Composable useAPI

O `useAPI` é a forma recomendada de fazer requisições, pois:

- ✅ Funciona perfeitamente com SSR
- ✅ Evita busca duplicada (servidor + cliente)
- ✅ Fornece estados reativos (pending, error)
- ✅ Suporta cache automático
- ✅ Permite refresh manual
- ✅ Tipagem forte com TypeScript

### Uso Básico

```typescript
<script setup lang="ts">
// GET request simples
const { data: users, pending, error, refresh } = await useAPI<User[]>('/users')
</script>

<template>
  <div v-if="pending">Carregando...</div>
  <div v-else-if="error">Erro: {{ error.message }}</div>
  <div v-else>
    <div v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>
    <button @click="refresh">Atualizar</button>
  </div>
</template>
```

### POST Request

```typescript
<script setup lang="ts">
interface CreateUserData {
  name: string
  email: string
}

const form = reactive({
  name: '',
  email: ''
})

async function createUser() {
  const { data, error } = await useAPI<User>('/users', {
    method: 'POST',
    body: form
  })

  if (error.value) {
    console.error('Erro ao criar usuário:', error.value)
  } else {
    console.log('Usuário criado:', data.value)
  }
}
</script>
```

### Query Parameters

```typescript
<script setup lang="ts">
const page = ref(1)
const search = ref('')

// Reativo - refaz a requisição quando page ou search mudam
const { data: users } = await useAPI<User[]>('/users', {
  query: {
    page,
    search,
    limit: 10
  },
  watch: [page, search] // Observa mudanças
})
</script>
```

### URL Dinâmica

```typescript
<script setup lang="ts">
const route = useRoute()
const userId = computed(() => route.params.id as string)

// A URL é reativa - refaz quando userId muda
const { data: user } = await useAPI<User>(
  () => `/users/${userId.value}`
)
</script>
```

### Transformar Resposta

```typescript
<script setup lang="ts">
const { data: userNames } = await useAPI<User[]>('/users', {
  transform: (users) => users.map(u => u.name)
})
// data agora é string[] ao invés de User[]
</script>
```

### Selecionar Campos Específicos

```typescript
<script setup lang="ts">
const { data: user } = await useAPI<User>('/users/123', {
  pick: ['id', 'name', 'email'] // Apenas estes campos
})
</script>
```

## useLazyAPI

Use `useLazyAPI` quando **não** quiser bloquear a navegação:

```typescript
<script setup lang="ts">
// Não bloqueia a navegação da página
const { data: posts, pending } = useLazyAPI<Post[]>('/posts')
</script>

<template>
  <div v-if="pending">Carregando posts...</div>
  <div v-else>
    <div v-for="post in posts" :key="post.id">
      {{ post.title }}
    </div>
  </div>
</template>
```

## useAsyncAPI

Use `useAsyncAPI` para requisições mais complexas:

```typescript
<script setup lang="ts">
const { data: dashboard } = await useAsyncAPI('dashboard', async () => {
  const { $api } = useNuxtApp()

  // Múltiplas requisições em paralelo
  const [users, posts, stats] = await Promise.all([
    $api<User[]>('/users'),
    $api<Post[]>('/posts'),
    $api<Stats>('/stats')
  ])

  return { users, posts, stats }
})
</script>
```

## Tipos e Interfaces

### Resposta de Sucesso Padrão

```typescript
interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// Exemplo de uso
const { data } = await useAPI<ApiSuccessResponse<User>>('/users/123')
if (data.value?.success) {
  const user = data.value.data
}
```

### Resposta de Erro Padrão

```typescript
interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

// Tratamento de erro
const { error } = await useAPI<User>('/users/123')
if (error.value) {
  const apiError = error.value.data as ApiErrorResponse
  console.error(apiError.error.message)
}
```

## Boas Práticas

### 1. Use useAPI para carregamento inicial de dados

```typescript
// ✅ Bom - SSR-friendly
const { data } = await useAPI<User[]>('/users')

// ❌ Ruim - dupla busca (servidor + cliente)
const { data } = await useAsyncData('users', () => $api('/users'))
```

### 2. Use $api para ações do usuário

```typescript
<script setup lang="ts">
const { $api } = useNuxtApp()

// ✅ Bom para ações (POST, PUT, DELETE)
async function deleteUser(id: string) {
  await $api(`/users/${id}`, { method: 'DELETE' })
}
</script>
```

### 3. Use useLazyAPI para dados não essenciais

```typescript
// ✅ Bom - não bloqueia navegação
const { data: comments } = useLazyAPI<Comment[]>('/posts/123/comments')

// ❌ Ruim - bloqueia se os comentários não são essenciais
const { data: comments } = await useAPI<Comment[]>('/posts/123/comments')
```

### 4. Defina tipos para suas respostas

```typescript
// ✅ Bom - tipado
interface User {
  id: string
  name: string
  email: string
}

const { data } = await useAPI<User[]>('/users')
// data é Ref<User[] | null>

// ❌ Ruim - sem tipagem
const { data } = await useAPI('/users')
// data é Ref<any>
```

### 5. Trate erros apropriadamente

```typescript
<script setup lang="ts">
const { data, error, refresh } = await useAPI<User[]>('/users')

// ✅ Bom - trata erro na UI
</script>

<template>
  <div v-if="error" class="error">
    <p>{{ error.message }}</p>
<button @click="refresh">Tentar novamente</button>
  </div>
</template>
```

## Exemplos Completos

### Listagem com Paginação

```vue
<script setup lang="ts">
const page = ref(1)
const limit = ref(10)

const { data: response, pending } = await useAPI<{
  users: User[]
  total: number
}>('/users', {
  query: { page, limit },
  watch: [page]
})

const users = computed(() => response.value?.users || [])
const total = computed(() => response.value?.total || 0)

function nextPage() {
  if (page.value * limit.value < total.value) {
    page.value++
  }
}
</script>

<template>
  <div>
    <div v-if="pending">Carregando...</div>
    <div v-else>
      <UserCard v-for="user in users" :key="user.id" :user="user" />
      <button @click="nextPage" :disabled="page * limit >= total">Próxima Página</button>
    </div>
  </div>
</template>
```

### Formulário de Criação

```vue
<script setup lang="ts">
const { $api } = useNuxtApp()
const router = useRouter()
const toast = useToast()

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const loading = ref(false)

async function handleSubmit() {
  loading.value = true

  try {
    const user = await $api<User>('/users', {
      method: 'POST',
      body: form
    })

    toast.add({
      title: 'Usuário criado com sucesso!',
      color: 'success'
    })

    router.push(`/users/${user.id}`)
  } catch (error: any) {
    toast.add({
      title: 'Erro ao criar usuário',
      description: error.data?.error?.message || error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm :state="form" @submit="handleSubmit">
    <UFormField label="Nome" name="name">
      <UInput v-model="form.name" />
    </UFormField>

    <UFormField label="E-mail" name="email">
      <UInput v-model="form.email" type="email" />
    </UFormField>

    <UFormField label="Senha" name="password">
      <UInput v-model="form.password" type="password" />
    </UFormField>

    <UButton type="submit" :loading="loading">Criar Usuário</UButton>
  </UForm>
</template>
```

## Troubleshooting

### Erro 401 - Não autenticado

O plugin automaticamente:

1. Limpa a sessão
2. Redireciona para `/auth/signin`

Você não precisa tratar manualmente.

### Cookies não estão sendo enviados

Certifique-se de que:

- A API está na mesma origem ou configurada para CORS
- `credentials: 'include'` está configurado (já feito no plugin)
- Os cookies do backend têm `SameSite` configurado corretamente

### Dupla busca de dados (SSR + Client)

Use `useAPI` ao invés de `$api` diretamente:

```typescript
// ❌ Busca duas vezes
const data = await $api('/users')

// ✅ Busca uma vez
const { data } = await useAPI('/users')
```

## Referências

- [Documentação oficial do Nuxt - Data Fetching](https://nuxt.com/docs/getting-started/data-fetching)
- [Documentação oficial do Nuxt - useFetch](https://nuxt.com/docs/api/composables/use-fetch)
- [Documentação do ofetch](https://github.com/unjs/ofetch)
