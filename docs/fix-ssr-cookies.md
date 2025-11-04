# Correção: Cookies não enviados no SSR

## Problema Identificado

Durante o Server-Side Rendering (SSR), os cookies não estavam sendo encaminhados corretamente para o backend nas requisições de autenticação, especialmente no endpoint `/auth/refresh` e `/auth/me`.

### Erro Original
```
ERROR  Erro ao renovar token: [POST] "http://localhost:8080/auth/refresh": 401 Unauthorized
```

## Causa Raiz

No Nuxt 3, quando uma requisição é feita no servidor (SSR), o `$fetch` padrão **não encaminha automaticamente** os cookies da requisição original do navegador para as APIs externas. Isso é um comportamento de segurança para prevenir ataques SSRF (Server-Side Request Forgery).

## Solução Implementada

Criamos uma função auxiliar `makeAuthRequest` que:

1. **No Servidor (SSR)**: Usa `useRequestFetch()` que automaticamente encaminha os cookies do usuário
2. **No Cliente**: Usa `$fetch` normal com `credentials: 'include'`

### Código Implementado

```typescript
/**
 * Função auxiliar para fazer requisições que automaticamente
 * encaminha cookies no servidor (SSR) e usa credentials no cliente
 */
const makeAuthRequest = async <T>(url: string, options: any = {}): Promise<T> => {
  // No servidor, usa useRequestFetch que encaminha cookies automaticamente
  if (import.meta.server) {
    const event = useRequestEvent()
    if (event) {
      // Usa o fetch do evento de requisição que inclui os cookies
      const requestFetch = useRequestFetch()
      return requestFetch(url, options)
    }
  }
  
  // No cliente, usa $fetch normal com credentials: 'include'
  return $fetch(url, {
    ...options,
    credentials: 'include'
  })
}
```

### Uso nos Métodos

Todos os métodos de autenticação agora usam `makeAuthRequest`:

```typescript
// Antes (não funcionava no SSR)
const user = await $fetch<User>(`${apiBaseUrl}/auth/refresh`, {
  method: 'POST',
  credentials: 'include'
})

// Depois (funciona em SSR e CSR)
const user = await makeAuthRequest<User>(`${apiBaseUrl}/auth/refresh`, {
  method: 'POST'
})
```

## Por que isso funciona?

### `useRequestFetch()`

- É um wrapper do Nuxt que cria uma instância de `$fetch` vinculada ao evento de requisição atual
- Automaticamente encaminha headers e cookies da requisição original do navegador
- Mantém o contexto de autenticação durante SSR

### `useRequestEvent()`

- Obtém o evento HTTP atual durante SSR
- Permite acessar os headers e cookies da requisição original
- Retorna `undefined` no cliente (por isso verificamos)

## Benefícios

✅ **SSR Funciona**: Cookies são encaminhados corretamente no servidor
✅ **CSR Funciona**: Continua usando `credentials: 'include'` no cliente
✅ **Sem Flash**: Não há mais redirecionamentos desnecessários durante reload
✅ **Segurança**: Mantém os cookies HTTP-only protegidos

## Arquivos Modificados

- `app/composables/useAuth.ts` - Adicionada função `makeAuthRequest` e atualizado todos os métodos

## Testando

1. Faça login normalmente
2. Recarregue a página (F5)
3. Verifique que não há erros 401 no console
4. Verifique que o loading aparece e some rapidamente
5. Verifique que você continua autenticado após reload

## Referências

- [Nuxt 3 - useRequestFetch](https://nuxt.com/docs/api/composables/use-request-fetch)
- [Nuxt 3 - useRequestEvent](https://nuxt.com/docs/api/composables/use-request-event)
- [Nuxt 3 - Data Fetching](https://nuxt.com/docs/getting-started/data-fetching)
