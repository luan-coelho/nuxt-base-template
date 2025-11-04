# Sistema de Autenticação - Nuxt.js + Backend Java

Esta aplicação implementa um sistema completo de autenticação integrado com um backend Java que utiliza **cookies HTTP-only** para gerenciamento seguro de tokens JWT.

## 🔐 Características de Segurança

- **Cookies HTTP-only**: Tokens não são acessíveis via JavaScript
- **Cookies Secure**: Transmissão apenas via HTTPS em produção
- **Access Token**: Token de curta duração para autenticação
- **Refresh Token**: Token de longa duração para renovação automática
- **Proteção CSRF**: Cookies com flags apropriadas
- **SSR Compatível**: Funciona tanto no servidor quanto no cliente

## 📁 Estrutura da Implementação

```
app/
├── composables/
│   ├── useAuth.ts           # Operações de autenticação (login, logout, refresh)
│   └── useUserSession.ts    # Gerenciamento do estado do usuário
├── middleware/
│   └── auth.global.ts       # Middleware global de proteção de rotas
├── types/
│   ├── auth.ts             # Interfaces de autenticação
│   └── user.ts             # Interface do usuário
├── pages/
│   ├── index.vue           # Página inicial
│   ├── dashboard.vue       # Dashboard protegido
│   └── auth/
│       └── signin.vue      # Página de login
└── components/
    └── auth/
        └── auth-form.vue   # Formulário de login
```

## 🚀 Como Funciona

### 1. **Composable `useUserSession`**

Gerencia o estado reativo do usuário autenticado usando `useState` do Nuxt, garantindo compatibilidade com SSR:

```typescript
const { user, isAuthenticated, isAdmin, setUser, clear } = useUserSession()
```

### 2. **Composable `useAuth`**

Fornece todas as operações de autenticação:

```typescript
const { login, register, logout, refresh, fetchUser } = useAuth()

// Login
const result = await login({ email, password })

// Logout
await logout()
```

**Características importantes:**

- Todas as requisições usam `credentials: 'include'` para enviar cookies
- Não armazena tokens manualmente (gerenciados pelo navegador)
- Atualiza automaticamente o estado global da sessão

### 3. **Middleware Global**

O arquivo `auth.global.ts` protege automaticamente todas as rotas:

- **Rotas públicas**: `/auth/signin`, `/auth/signup`
- **Rotas privadas**: Todas as outras rotas requerem autenticação
- **Validação SSR**: Verifica cookie no servidor durante SSR
- **Validação Cliente**: Verifica sessão no cliente após navegação
- **Redirecionamentos automáticos**:
  - Não autenticado → `/auth/signin`
  - Autenticado em rota pública → `/`

### 4. **Fluxo de Autenticação**

#### Login:

1. Usuário preenche formulário de login
2. Frontend chama `POST /auth/signin` com `credentials: 'include'`
3. Backend valida credenciais e retorna cookies `accessToken` e `refreshToken`
4. Frontend armazena dados do usuário em `useState`
5. Usuário é redirecionado para a home

#### Navegação em Rota Protegida:

1. Middleware intercepta a navegação
2. Verifica se o usuário está autenticado
3. Se não estiver, tenta buscar dados com `GET /auth/me`
4. Backend valida cookie automaticamente
5. Se válido, atualiza estado e permite acesso
6. Se inválido, tenta renovar com `POST /auth/refresh`
7. Se falhar, redireciona para login

#### Logout:

1. Usuário clica em "Sair"
2. Frontend chama `POST /auth/logout`
3. Backend remove os cookies
4. Frontend limpa o estado local
5. Usuário é redirecionado para login

## 🛠️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. Configuração do Nuxt

O `nuxt.config.ts` já está configurado:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    }
  }
})
```

### 3. Backend Java

Certifique-se de que seu backend está rodando em `http://localhost:8080` e possui os seguintes endpoints:

- `POST /auth/signin` - Login
- `POST /auth/register` - Registro
- `POST /auth/refresh` - Renovar tokens
- `GET /auth/me` - Dados do usuário autenticado
- `POST /auth/logout` - Logout

**Importante:** O backend deve configurar os cookies com:

```java
cookie.setHttpOnly(true);  // Impede acesso via JavaScript
cookie.setSecure(true);    // Apenas HTTPS em produção
cookie.setPath("/");       // Disponível em todas as rotas
cookie.setSameSite("Lax"); // Proteção CSRF
```

## 📝 Uso

### Proteger uma Página

Todas as páginas são automaticamente protegidas pelo middleware global, exceto as rotas públicas definidas. Para adicionar uma nova rota pública:

```typescript
// middleware/auth.global.ts
const publicRoutes = ['/auth/signin', '/auth/signup', '/sua-nova-rota']
```

### Acessar Dados do Usuário

Em qualquer componente Vue:

```vue
<script setup lang="ts">
const { user, isAuthenticated, isAdmin } = useUserSession()
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Olá, {{ user?.name }}!</p>
    <p v-if="isAdmin">Você é administrador</p>
  </div>
</template>
```

### Fazer Logout

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

### Fazer Requisições Autenticadas

Os cookies são enviados automaticamente em todas as requisições que usam `credentials: 'include'`:

```typescript
const data = await $fetch('/api/protected-endpoint', {
  credentials: 'include'
})
```

## 🔒 Boas Práticas de Segurança

### ✅ O que foi implementado:

1. **Nunca expor tokens no cliente**: Tokens são gerenciados pelo navegador via cookies HTTP-only
2. **Renovação automática**: Sistema tenta renovar tokens expirados automaticamente
3. **Limpeza de estado**: Logout limpa completamente o estado do usuário
4. **Validação em ambos os lados**: SSR e CSR validam autenticação
5. **Redirecionamentos seguros**: Middleware impede acesso não autorizado
6. **Credentials include**: Todas as requisições de autenticação enviam cookies

### ⚠️ Considerações de Produção:

1. **HTTPS obrigatório**: Em produção, use sempre HTTPS
2. **CORS configurado**: Backend deve permitir origins específicas
3. **Cookies Secure**: Habilitar flag `Secure` em produção
4. **SameSite**: Configurar apropriadamente para proteção CSRF
5. **Rate Limiting**: Implementar no backend para prevenir ataques
6. **Logging**: Implementar logs de tentativas de autenticação

## 🧪 Testando

1. Inicie o backend Java em `http://localhost:8080`
2. Inicie o frontend Nuxt:
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:3000`
4. Tente acessar `/dashboard` sem estar logado (deve redirecionar para login)
5. Faça login com credenciais válidas
6. Verifique que foi redirecionado e pode acessar rotas protegidas
7. Verifique no DevTools → Application → Cookies que os tokens estão presentes e são HTTP-only

## 📚 Referências

- [Documentação da API Backend](./integracao-api.md)
- [Nuxt 3 - Data Fetching](https://nuxt.com/docs/getting-started/data-fetching)
- [Nuxt 3 - State Management](https://nuxt.com/docs/getting-started/state-management)
- [Nuxt 3 - Route Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)

## 🐛 Troubleshooting

### Cookies não estão sendo enviados

Certifique-se de:

- Usar `credentials: 'include'` em todas as requisições
- Backend está configurando cookies corretamente
- CORS está configurado para permitir credentials

### Redirecionamento infinito

Verifique se:

- As rotas públicas estão corretamente definidas no middleware
- O endpoint `/auth/me` está retornando 401 quando não autenticado

### Estado não persiste após recarregar

Isso é esperado! O estado `useState` é resetado ao recarregar. O middleware vai:

1. Verificar os cookies no servidor (SSR)
2. Buscar dados do usuário com `/auth/me`
3. Repovoar o estado automaticamente

## 🤝 Contribuindo

Esta implementação segue as melhores práticas do Nuxt 3 e segurança web moderna. Sugestões e melhorias são bem-vindas!
