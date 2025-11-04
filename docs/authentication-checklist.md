# Checklist de Verificação - Sistema de Autenticação

Use esta lista para verificar se a implementação está funcionando corretamente.

## ✅ Checklist de Configuração

### Backend

- [ ] Backend rodando em `http://localhost:8080`
- [ ] Endpoint `/auth/signin` funcionando
- [ ] Endpoint `/auth/register` funcionando
- [ ] Endpoint `/auth/refresh` funcionando
- [ ] Endpoint `/auth/me` funcionando
- [ ] Endpoint `/auth/logout` funcionando
- [ ] Cookies configurados com `HttpOnly`
- [ ] Cookies configurados com `Secure` (em produção)
- [ ] CORS configurado para permitir `credentials`

### Frontend

- [ ] Arquivo `.env` criado com `NUXT_PUBLIC_API_BASE_URL`
- [ ] Dependências instaladas (`npm install` ou `pnpm install`)
- [ ] Aplicação iniciada (`npm run dev`)
- [ ] Sem erros de compilação no console

## ✅ Checklist de Funcionalidades

### Login

- [ ] Formulário de login acessível em `/auth/signin`
- [ ] Validação de campos (email e senha)
- [ ] Mensagens de erro exibidas corretamente
- [ ] Loading state durante o login
- [ ] Redirecionamento após login bem-sucedido
- [ ] Cookies `accessToken` e `refreshToken` criados (DevTools → Application → Cookies)
- [ ] Cookies marcados como `HttpOnly`

### Navegação Autenticada

- [ ] Página inicial (`/`) mostra nome do usuário quando logado
- [ ] Dashboard (`/dashboard`) acessível após login
- [ ] Dados do usuário exibidos corretamente
- [ ] Tentativa de acesso a rota protegida sem login redireciona para `/auth/signin`
- [ ] Após login, rotas protegidas ficam acessíveis

### Middleware

- [ ] Middleware global executa em todas as rotas
- [ ] Rotas públicas acessíveis sem autenticação
- [ ] Rotas privadas protegidas
- [ ] Redirecionamento automático funciona
- [ ] SSR valida cookies corretamente
- [ ] Client-side valida sessão corretamente

### Logout

- [ ] Botão de logout disponível quando autenticado
- [ ] Logout limpa o estado do usuário
- [ ] Cookies são removidos
- [ ] Redirecionamento para login após logout
- [ ] Tentativa de acessar rota protegida após logout é bloqueada

### Refresh Token

- [ ] Token renovado automaticamente quando expira
- [ ] Estado do usuário mantido após renovação
- [ ] Requisições continuam funcionando após renovação
- [ ] Falha de renovação redireciona para login

### SSR (Server-Side Rendering)

- [ ] Página carrega com dados do usuário no primeiro acesso (se logado)
- [ ] Cookies são validados no servidor
- [ ] Não há "flash" de conteúdo não autenticado
- [ ] Redirecionamentos funcionam no servidor

## ✅ Checklist de Segurança

### Cookies

- [ ] Cookies não são acessíveis via JavaScript (`document.cookie`)
- [ ] Flag `HttpOnly` está ativa
- [ ] Flag `Secure` está ativa em produção
- [ ] SameSite configurado adequadamente

### Tokens

- [ ] Tokens nunca são armazenados em `localStorage`
- [ ] Tokens nunca são armazenados em `sessionStorage`
- [ ] Tokens nunca são expostos no código JavaScript
- [ ] Tokens são gerenciados exclusivamente pelo navegador

### Requisições

- [ ] Todas as requisições de autenticação usam `credentials: 'include'`
- [ ] Requisições sensíveis validam autenticação no backend
- [ ] Erros 401 são tratados adequadamente
- [ ] Erros 403 são tratados adequadamente

### Estado

- [ ] Estado do usuário não contém informações sensíveis (senhas, tokens)
- [ ] Estado é limpo corretamente no logout
- [ ] Estado não vaza entre diferentes usuários

## 🧪 Cenários de Teste

### Teste 1: Login Básico

1. Acesse `http://localhost:3000`
2. Clique em "Entrar" ou acesse `/auth/signin`
3. Insira credenciais válidas
4. Verifique se foi redirecionado para a home
5. Verifique se o nome do usuário aparece
6. Verifique os cookies no DevTools

**Resultado Esperado:** Login bem-sucedido, cookies criados, usuário autenticado

### Teste 2: Proteção de Rotas

1. Abra uma aba anônima
2. Tente acessar `http://localhost:3000/dashboard`
3. Verifique se foi redirecionado para `/auth/signin`
4. Faça login
5. Tente acessar `/dashboard` novamente

**Resultado Esperado:** Rota protegida, redirecionamento funciona, acesso concedido após login

### Teste 3: Logout

1. Estando autenticado, clique em "Sair"
2. Verifique se foi redirecionado para `/auth/signin`
3. Verifique se os cookies foram removidos
4. Tente acessar `/dashboard`

**Resultado Esperado:** Logout bem-sucedido, cookies removidos, acesso negado

### Teste 4: Persistência de Sessão

1. Faça login
2. Navegue para `/dashboard`
3. Recarregue a página (F5)
4. Verifique se continua autenticado

**Resultado Esperado:** Sessão mantida após reload

### Teste 5: SSR

1. Limpe os cookies
2. Faça login
3. Abra uma nova aba
4. Acesse diretamente `http://localhost:3000/dashboard`
5. Verifique se a página carrega já autenticada (sem "flash")

**Resultado Esperado:** SSR funciona, página carrega autenticada

### Teste 6: Token Expirado

1. Faça login
2. Aguarde o token expirar (ou expire manualmente via backend)
3. Tente fazer uma requisição
4. Verifique se o token é renovado automaticamente

**Resultado Esperado:** Token renovado, requisição bem-sucedida

### Teste 7: Credenciais Inválidas

1. Tente fazer login com email inválido
2. Verifique se a mensagem de erro é exibida
3. Tente com senha incorreta
4. Verifique a mensagem de erro

**Resultado Esperado:** Erros exibidos corretamente

### Teste 8: Navegação Cliente

1. Estando na home, navegue para `/dashboard` usando um link
2. Verifique se não há reload da página
3. Verifique se a autenticação é mantida

**Resultado Esperado:** Navegação SPA funciona, autenticação mantida

### Teste 9: Múltiplas Abas

1. Abra duas abas do navegador
2. Faça login em uma aba
3. Na outra aba, recarregue a página
4. Verifique se está autenticado

**Resultado Esperado:** Cookies compartilhados entre abas

### Teste 10: CORS

1. Tente acessar a API de outro domínio/porta
2. Verifique se o CORS está configurado
3. Verifique se os cookies são enviados

**Resultado Esperado:** CORS permite credentials, cookies enviados

## 🐛 Problemas Comuns

### "Cookies não estão sendo enviados"

**Possíveis Causas:**

- Esqueceu `credentials: 'include'` na requisição
- CORS não configurado para permitir credentials
- Backend não está configurando cookies corretamente
- Domínios diferentes (localhost vs 127.0.0.1)

**Solução:**

```typescript
// Sempre use credentials: 'include'
await $fetch('/api/endpoint', {
  credentials: 'include'
})
```

### "Redirecionamento infinito"

**Possíveis Causas:**

- Rota de login não está na lista de rotas públicas
- Endpoint `/auth/me` retorna 200 mesmo sem autenticação
- Middleware executando em rota de login

**Solução:**

```typescript
// middleware/auth.global.ts
const publicRoutes = ['/auth/signin', '/auth/signup']
```

### "Estado não persiste após reload"

**Comportamento Esperado:** O estado é perdido no reload, mas o middleware restaura automaticamente usando os cookies.

**Se não funciona:**

- Verifique se os cookies ainda existem após reload
- Verifique se o endpoint `/auth/me` funciona
- Verifique o console para erros

### "TypeError: Cannot read property of undefined"

**Possíveis Causas:**

- Acessando propriedades do usuário antes de carregar
- Usuário não está autenticado

**Solução:**

```vue
<!-- Use optional chaining -->
<template>
  <p>{{ user?.name }}</p>
</template>
```

### "401 em todas as requisições"

**Possíveis Causas:**

- Cookies não estão sendo enviados
- Token expirou e refresh falhou
- Backend não está validando cookies corretamente

**Solução:**

- Verifique DevTools → Network → Headers
- Confirme que `Cookie` está nos headers
- Teste o endpoint `/auth/me` diretamente

## 📊 Ferramentas de Debug

### Chrome DevTools

**Application → Cookies:**

- Verifique se `accessToken` e `refreshToken` existem
- Verifique as flags (HttpOnly, Secure, SameSite)
- Verifique expiration

**Network → Headers:**

- Verifique se o header `Cookie` está presente nas requisições
- Verifique os headers `Set-Cookie` nas respostas

**Console:**

- Busque por erros relacionados a autenticação
- Verifique logs de debug

### Vue DevTools

**Pinia/State:**

- Verifique o estado do usuário
- Confirme que `isAuthenticated` está correto

**Router:**

- Verifique as rotas atuais
- Confirme que os guards estão funcionando

## 📝 Logs Úteis

Adicione logs para debug:

```typescript
// composables/useAuth.ts
const login = async (credentials: LoginCredentials) => {
  console.log('🔐 Tentando login...', credentials.email)

  try {
    const response = await $fetch(...)
    console.log('✅ Login bem-sucedido', response.user.name)
    return { success: true, user: response.user }
  } catch (error) {
    console.error('❌ Erro no login', error)
    return { success: false, error: '...' }
  }
}
```

```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('🛡️ Middleware: Verificando rota', to.path)
  console.log('🔑 Autenticado:', isAuthenticated.value)

  // ... resto do código
})
```

## ✅ Pronto para Produção

Antes de fazer deploy:

- [ ] Variáveis de ambiente de produção configuradas
- [ ] HTTPS habilitado
- [ ] Cookies com flag `Secure`
- [ ] CORS configurado com origins específicas (não `*`)
- [ ] Rate limiting implementado no backend
- [ ] Logs de segurança habilitados
- [ ] Tokens com tempo de expiração adequado
- [ ] Testes de segurança realizados
- [ ] Documentação atualizada

## 🆘 Precisa de Ajuda?

Consulte:

- [Documentação Principal](./authentication.md)
- [Exemplos de Uso](./authentication-examples.md)
- [Documentação da API](../integracao-api.md)
- [Issues do Repositório](https://github.com/seu-repo/issues)
