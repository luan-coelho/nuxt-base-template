# Guia Rápido - Autenticação

## 🚀 Início Rápido

### 1. Configurar variável de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

### 4. Iniciar o backend Java

Certifique-se de que o backend está rodando em `http://localhost:8080`

## 📁 Estrutura

```
app/
├── types/auth.ts              # Tipos TypeScript
├── composables/
│   ├── useUserSession.ts      # Gerenciamento de sessão
│   └── useAuth.ts             # Operações de autenticação
├── middleware/
│   └── auth.global.ts         # Proteção de rotas
├── plugins/
│   └── auth.client.ts         # Inicialização da sessão
└── pages/
    ├── index.vue              # Página inicial
    ├── login.vue              # Login
    ├── register.vue           # Registro
    └── dashboard.vue          # Dashboard (protegido)
```

## 🔐 Como Usar

### Login

```vue
<script setup>
const { signIn, isLoggingIn } = useAuth()
const error = ref('')

const handleLogin = async () => {
  try {
    await signIn({
      email: 'usuario@email.com',
      password: 'senha123'
    })
    // Redireciona automaticamente para /dashboard
  } catch (err) {
    error.value = err.message
  }
}
</script>
```

### Registro

```vue
<script setup>
const { signUp, isRegistering } = useAuth()

const handleRegister = async () => {
  await signUp({
    name: 'João Silva',
    email: 'joao@email.com',
    password: 'senha123',
    cpf: '123.456.789-00',     // opcional
    phone: '(11) 98765-4321',  // opcional
    roles: ['USER']
  })
}
</script>
```

### Logout

```vue
<script setup>
const { logout, isLoggingOut } = useAuth()

const handleLogout = async () => {
  await logout()
  // Redireciona automaticamente para /login
}
</script>
```

### Verificar Autenticação

```vue
<script setup>
const { user, loggedIn, loading } = useUserSession()
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else-if="loggedIn">
    <p>Olá, {{ user.name }}!</p>
  </div>
  <div v-else>
    <p>Faça login</p>
  </div>
</template>
```

### Verificar Roles

```vue
<script setup>
const { hasRole, hasAnyRole } = useUserSession()
</script>

<template>
  <div v-if="hasRole('ADMIN')">
    Painel de Administrador
  </div>
  <div v-if="hasAnyRole(['ADMIN', 'MANAGER'])">
    Painel de Gestão
  </div>
</template>
```

## 🛡️ Proteção de Rotas

### Rotas Públicas (Padrão)

Por padrão, estas rotas são públicas:
- `/` - Página inicial
- `/login` - Login
- `/register` - Registro

### Adicionar Rota Pública

Edite `app/middleware/auth.global.ts`:

```typescript
const publicRoutes = ['/login', '/register', '/', '/about', '/contact']
```

### Middleware Customizado (Admin)

Crie `app/middleware/admin.ts`:

```typescript
export default defineNuxtRouteMiddleware(() => {
  const { hasRole } = useUserSession()
  
  if (!hasRole('ADMIN')) {
    return navigateTo('/')
  }
})
```

Use na página:

```vue
<script setup>
definePageMeta({
  middleware: ['admin']
})
</script>
```

## 🔒 Segurança

### ✅ O que é feito automaticamente:

- Cookies HTTP-Only (não acessíveis via JavaScript)
- Cookies Secure (apenas HTTPS em produção)
- Tokens JWT gerenciados pelo backend
- `credentials: 'include'` em todas as requisições
- Proteção XSS
- SameSite cookies

### ❌ O que NÃO fazer:

```javascript
// ❌ NÃO tente acessar tokens manualmente
document.cookie
localStorage.getItem('token')

// ❌ NÃO faça requisições sem credentials
$fetch('/api/endpoint') // Faltando credentials: 'include'
```

### ✅ O que fazer:

```javascript
// ✅ Use os composables
const { signIn, logout } = useAuth()
const { user, loggedIn } = useUserSession()

// ✅ Requisições com credentials
await $fetch('/auth/me', {
  baseURL: config.public.apiBaseUrl,
  credentials: 'include'
})
```

## 🐛 Troubleshooting

### "Não consigo fazer login"

1. ✅ Backend rodando em `http://localhost:8080`?
2. ✅ Credenciais corretas?
3. ✅ Console do navegador mostra erros?
4. ✅ Verifique cookies no DevTools > Application > Cookies

### "Sessão não persiste"

1. ✅ Cookies definidos no navegador?
2. ✅ Plugin `auth.client.ts` carregando?
3. ✅ Endpoint `/auth/me` retornando dados?

### "CORS Error"

1. ✅ Backend configurado para aceitar requisições?
2. ✅ `allowCredentials: true` no CORS?
3. ✅ Headers corretos?

### "Redirecionamento infinito"

1. ✅ Rotas públicas corretas no middleware?
2. ✅ Lógica de redirecionamento sem loops?

## 📚 Documentação Completa

Para documentação detalhada, veja:
- `docs/AUTENTICACAO.md` - Documentação completa
- `integracao-api.md` - Documentação da API

## 🔗 Endpoints do Backend

- `POST /auth/signin` - Login
- `POST /auth/register` - Registro
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Renovar tokens
- `GET /auth/me` - Obter usuário autenticado

## 💡 Dicas

1. **SSR**: A autenticação funciona tanto no servidor quanto no cliente
2. **Cookies**: São gerenciados automaticamente pelo navegador
3. **Refresh Token**: Renovação automática pelo backend
4. **Middleware**: Executa em toda navegação
5. **Plugin**: Inicializa sessão ao carregar app

## 📞 Suporte

Problemas? Consulte:
- Documentação completa: `docs/AUTENTICACAO.md`
- Issues do projeto
- Equipe de desenvolvimento
