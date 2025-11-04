# Exemplos de Uso - Sistema de Autenticação

Este documento contém exemplos práticos de como usar o sistema de autenticação implementado.

## 📋 Índice

1. [Uso Básico](#uso-básico)
2. [Páginas Protegidas](#páginas-protegidas)
3. [Componentes com Autenticação](#componentes-com-autenticação)
4. [Requisições Autenticadas](#requisições-autenticadas)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Casos Avançados](#casos-avançados)

## Uso Básico

### Login Simples

```vue
<script setup lang="ts">
const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = null

  const result = await login({
    email: email.value,
    password: password.value
  })

  if (result.success) {
    await router.push('/dashboard')
  } else {
    error.value = result.error
  }

  loading.value = false
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Senha" />
    <p v-if="error">{{ error }}</p>
    <button :disabled="loading">Entrar</button>
  </form>
</template>
```

### Logout

```vue
<script setup lang="ts">
const { logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  await router.push('/auth/signin')
}
</script>

<template>
  <button @click="handleLogout">Sair</button>
</template>
```

### Verificar Autenticação

```vue
<script setup lang="ts">
const { user, isAuthenticated, isAdmin } = useUserSession()
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Olá, {{ user?.name }}!</p>
    <p v-if="isAdmin">Você é administrador</p>
  </div>
  <div v-else>
    <p>Faça login para continuar</p>
  </div>
</template>
```

## Páginas Protegidas

### Proteger Página Individual (Não Recomendado)

O middleware global já protege todas as páginas, mas se você quiser adicionar lógica específica:

```vue
<script setup lang="ts">
const { isAuthenticated } = useUserSession()
const router = useRouter()

// Verifica autenticação no cliente
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/auth/signin')
  }
})
</script>
```

### Página com Verificação de Permissões

```vue
<script setup lang="ts">
const { user, isAdmin } = useUserSession()
const router = useRouter()

// Redireciona se não for admin
watchEffect(() => {
  if (user.value && !isAdmin.value) {
    router.push('/')
  }
})
</script>

<template>
  <div v-if="isAdmin">
    <h1>Painel Administrativo</h1>
    <!-- Conteúdo apenas para admins -->
  </div>
</template>
```

## Componentes com Autenticação

### Menu Condicional

```vue
<script setup lang="ts">
const { user, isAuthenticated } = useUserSession()
const { logout } = useAuth()
</script>

<template>
  <nav>
    <NuxtLink to="/">Home</NuxtLink>

    <template v-if="isAuthenticated">
      <NuxtLink to="/dashboard">Dashboard</NuxtLink>
      <NuxtLink to="/profile">Perfil</NuxtLink>
      <button @click="logout">Sair</button>
      <span>{{ user?.name }}</span>
    </template>

    <template v-else>
      <NuxtLink to="/auth/signin">Entrar</NuxtLink>
    </template>
  </nav>
</template>
```

### Card de Usuário

```vue
<script setup lang="ts">
const { user } = useUserSession()
</script>

<template>
  <div class="user-card">
    <img :src="user?.avatar || '/default-avatar.png'" :alt="user?.name" />
    <div>
      <h3>{{ user?.name }}</h3>
      <p>{{ user?.email }}</p>
      <div>
        <span v-for="role in user?.roles" :key="role">
          {{ role }}
        </span>
      </div>
    </div>
  </div>
</template>
```

## Requisições Autenticadas

### Usando $fetch

```vue
<script setup lang="ts">
const config = useRuntimeConfig()

const fetchProtectedData = async () => {
  try {
    const data = await $fetch(`${config.public.apiBaseUrl}/api/protected`, {
      method: 'GET',
      credentials: 'include' // Importante!
    })
    return data
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}
</script>
```

### Usando useFetch (Recomendado para SSR)

```vue
<script setup lang="ts">
const config = useRuntimeConfig()

// Busca dados de forma reativa e SSR-friendly
const { data, pending, error, refresh } = await useFetch(`${config.public.apiBaseUrl}/api/users`, {
  credentials: 'include',
  server: true // Executa no servidor
})
</script>

<template>
  <div v-if="pending">Carregando...</div>
  <div v-else-if="error">Erro: {{ error.message }}</div>
  <div v-else>
    <div v-for="user in data" :key="user.id">
      {{ user.name }}
    </div>
    <button @click="refresh">Atualizar</button>
  </div>
</template>
```

### POST com Dados

```vue
<script setup lang="ts">
const config = useRuntimeConfig()

const createItem = async (itemData: any) => {
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/api/items`, {
      method: 'POST',
      body: itemData,
      credentials: 'include'
    })
    return { success: true, data: response }
  } catch (error: any) {
    return {
      success: false,
      error: error?.data?.error?.message || 'Erro ao criar item'
    }
  }
}
</script>
```

### Usando Composable Customizado

```vue
<script setup lang="ts">
const { fetchUsers, createUser, deleteUser } = useApiExample()

const users = ref([])

const loadUsers = async () => {
  const result = await fetchUsers()
  if (result.success) {
    users.value = result.data
  }
}

const handleDelete = async (userId: string) => {
  const result = await deleteUser(userId)
  if (result.success) {
    await loadUsers() // Recarrega a lista
  }
}
</script>
```

## Tratamento de Erros

### Tratamento Global de Erros de Autenticação

```vue
<script setup lang="ts">
const handleApiCall = async (apiFunction: () => Promise<any>) => {
  try {
    return await apiFunction()
  } catch (error: any) {
    // Erro 401 - Não autorizado
    if (error?.status === 401) {
      const { refresh } = useAuth()
      const refreshResult = await refresh()

      if (refreshResult.success) {
        // Tenta novamente após refresh
        return await apiFunction()
      } else {
        // Refresh falhou, redireciona para login
        await navigateTo('/auth/signin')
      }
    }

    // Erro 403 - Sem permissão
    if (error?.status === 403) {
      console.error('Sem permissão para esta ação')
    }

    throw error
  }
}
</script>
```

### Tratamento com Notificações

```vue
<script setup lang="ts">
const toast = useToast() // Assumindo que você usa um sistema de toast

const safeApiCall = async (apiFunction: () => Promise<any>, successMessage?: string) => {
  try {
    const result = await apiFunction()

    if (successMessage) {
      toast.add({
        title: 'Sucesso',
        description: successMessage,
        color: 'green'
      })
    }

    return result
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: error?.data?.error?.message || 'Ocorreu um erro',
      color: 'red'
    })

    throw error
  }
}
</script>
```

## Casos Avançados

### Renovação Manual de Token

```vue
<script setup lang="ts">
const { refresh } = useAuth()

const manualRefresh = async () => {
  const result = await refresh()

  if (result.success) {
    console.log('Token renovado com sucesso')
  } else {
    console.error('Falha ao renovar token')
  }
}
</script>
```

### Verificar Sessão Periodicamente

```vue
<script setup lang="ts">
const { fetchUser } = useAuth()
const { isAuthenticated } = useUserSession()

// Verifica a sessão a cada 5 minutos
const checkInterval = setInterval(
  async () => {
    if (isAuthenticated.value) {
      await fetchUser()
    }
  },
  5 * 60 * 1000
)

onUnmounted(() => {
  clearInterval(checkInterval)
})
</script>
```

### Formulário de Registro

```vue
<script setup lang="ts">
const { register } = useAuth()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const error = ref<string | null>(null)
const loading = ref(false)

const handleRegister = async () => {
  // Validações
  if (form.password !== form.confirmPassword) {
    error.value = 'As senhas não coincidem'
    return
  }

  loading.value = true
  error.value = null

  const result = await register({
    name: form.name,
    email: form.email,
    cpf: form.cpf,
    phone: form.phone,
    password: form.password
  })

  if (result.success) {
    await router.push('/dashboard')
  } else {
    error.value = result.error
  }

  loading.value = false
}
</script>
```

### Guard de Rota Customizado

```typescript
// middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAdmin } = useUserSession()

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
```

Uso na página:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})
</script>
```

### Interceptor de Requisições

```typescript
// plugins/api-interceptor.ts
export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()

  // Cria uma instância customizada de $fetch
  const apiFetch = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',

    // Interceptor de requisição
    onRequest({ request, options }) {
      console.log('Fazendo requisição para:', request)
    },

    // Interceptor de resposta
    onResponse({ request, response }) {
      console.log('Resposta recebida:', response.status)
    },

    // Interceptor de erro
    async onResponseError({ request, response }) {
      if (response.status === 401) {
        const { refresh } = useAuth()
        await refresh()
      }
    }
  })

  return {
    provide: {
      apiFetch
    }
  }
})
```

Uso:

```vue
<script setup lang="ts">
const { $apiFetch } = useNuxtApp()

const data = await $apiFetch('/api/users')
</script>
```

## 🔗 Links Úteis

- [Documentação Principal](./authentication.md)
- [Documentação da API Backend](../integracao-api.md)
- [Nuxt 3 Documentation](https://nuxt.com)
