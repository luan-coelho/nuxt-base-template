# Nuxt Base Template com Autenticação

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Template base Nuxt.js com sistema completo de autenticação integrado a backend Java, utilizando cookies HTTP-only para máxima segurança.

## 🚀 Características

### Autenticação e Segurança

- ✅ **Autenticação baseada em cookies HTTP-only** (tokens não acessíveis via JavaScript)
- ✅ **Integração com backend Java** existente
- ✅ **SSR e CSR compatível** (Server-Side e Client-Side Rendering)
- ✅ **Middleware global** para proteção automática de rotas
- ✅ **Renovação automática de tokens** (refresh token)
- ✅ **Estado reativo** com `useState` do Nuxt
- ✅ **Composables reutilizáveis** (`useAuth`, `useUserSession`)

### Interface

- 🎨 **Nuxt UI** - Componentes modernos e acessíveis
- 🌗 **Dark Mode** - Suporte a tema escuro
- 📱 **Responsivo** - Mobile-first design
- ⚡ **Performance otimizada** - SSR e tree-shaking

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Backend Java rodando em `http://localhost:8080`

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/nuxt-base-template.git
cd nuxt-base-template
```

### 2. Instale as dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 4. Inicie o servidor de desenvolvimento

```bash
pnpm dev
# ou
npm run dev
```

Acesse `http://localhost:3000`

## 📚 Documentação Completa

- **[Sistema de Autenticação](./docs/authentication.md)** - Documentação detalhada da implementação
- **[Exemplos de Uso](./docs/authentication-examples.md)** - Exemplos práticos e casos de uso
- **[Checklist de Verificação](./docs/authentication-checklist.md)** - Lista de verificação e testes
- **[API Backend](./integracao-api.md)** - Documentação dos endpoints do backend

## 🏗️ Estrutura do Projeto

```
app/
├── composables/
│   ├── useAuth.ts              # Operações de autenticação
│   ├── useUserSession.ts       # Estado do usuário
│   └── useApiExample.ts        # Exemplos de requisições
├── middleware/
│   └── auth.global.ts          # Proteção de rotas
├── pages/
│   ├── index.vue              # Página inicial
│   ├── dashboard.vue          # Dashboard protegido
│   └── auth/
│       └── signin.vue         # Login
├── plugins/
│   └── auth.ts                # Inicialização da sessão
└── types/
    ├── auth.ts                # Tipos de autenticação
    └── user.ts                # Tipo do usuário
```

## 🔐 Como Funciona

### 1. Login

```typescript
const { login } = useAuth()

const result = await login({
  email: 'usuario@exemplo.com',
  password: 'senha123'
})

if (result.success) {
  // Usuário autenticado, cookies criados automaticamente
  router.push('/dashboard')
}
```

### 2. Acessar Dados do Usuário

```vue
<script setup lang="ts">
const { user, isAuthenticated } = useUserSession()
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Olá, {{ user?.name }}!</p>
  </div>
</template>
```

### 3. Fazer Requisições Autenticadas

```typescript
const data = await $fetch('/api/protected', {
  credentials: 'include' // Envia cookies automaticamente
})
```

### 4. Logout

```typescript
const { logout } = useAuth()
await logout()
```

## 🛡️ Segurança

- ✅ Tokens **nunca** expostos no cliente
- ✅ Cookies com flags `HttpOnly`, `Secure`, e `SameSite`
- ✅ Renovação automática de tokens expirados
- ✅ Validação de sessão no SSR e CSR
- ✅ Proteção automática de rotas privadas
- ✅ Tratamento adequado de erros 401/403

## 📖 Rotas Disponíveis

- `/` - Página inicial (pública)
- `/auth/signin` - Login (pública)
- `/dashboard` - Dashboard (protegida)
- Qualquer outra rota é **protegida** por padrão

## 🧪 Testando

### Teste Básico

1. Inicie o backend Java em `http://localhost:8080`
2. Inicie o frontend: `pnpm dev`
3. Acesse `http://localhost:3000/dashboard` (deve redirecionar para login)
4. Faça login com credenciais válidas
5. Verifique que foi redirecionado e está autenticado
6. No DevTools → Application → Cookies, veja os tokens HTTP-only

### Verificação de Segurança

```javascript
// Tente acessar os cookies via JavaScript
console.log(document.cookie)
// Deve retornar vazio ou sem os tokens (HttpOnly protege)
```

## 🚀 Deploy

### Build para Produção

```bash
pnpm build
```

### Preview Local

```bash
pnpm preview
```

### Variáveis de Ambiente de Produção

Certifique-se de configurar:

```bash
NUXT_PUBLIC_API_BASE_URL=https://sua-api.com
NODE_ENV=production
```

### Considerações de Produção

- ✅ Use **HTTPS obrigatório**
- ✅ Configure CORS no backend com origins específicas
- ✅ Habilite flag `Secure` nos cookies
- ✅ Configure `SameSite` adequadamente
- ✅ Implemente rate limiting no backend
- ✅ Configure logs de segurança

Consulte a [documentação de deploy do Nuxt](https://nuxt.com/docs/getting-started/deployment) para mais informações.

## 🤝 Contribuindo

Contribuições são bem-vindas! Esta implementação segue as melhores práticas de:

- Nuxt 3 e Composition API
- TypeScript
- Segurança Web (OWASP)
- Clean Code

## 📄 Licença

MIT License

## 🔗 Links Úteis

- [Nuxt 3](https://nuxt.com)
- [Nuxt UI](https://ui.nuxt.com)
- [Vue 3](https://vuejs.org)
- [TypeScript](https://www.typescriptlang.org)

---

Desenvolvido com ❤️ usando Nuxt 3 e Nuxt UI
