# Autenticação via Cookies

## Estrutura das Respostas

### Resposta de Sucesso

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@exemplo.com",
    "name": "João Silva"
  }
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Recurso não encontrado"
  }
}
```

**Endpoints na api** que utilizam cookies:

- `POST /auth/signin` - Login via cookies
- `POST /auth/register` - Registro via cookies
- `POST /auth/refresh` - Refresh via cookies (lê do cookie)
- `POST /auth/logout` - Logout com limpeza de cookies
- `GET /auth/me` - Busca o usuário logado via cookies

### 1. Login/Registro

```
Cliente → POST /auth/signin
       ← 200 OK + Set-Cookie: accessToken + Set-Cookie: refreshToken

Resposta JSON (sem tokens):
{
  "success": true,
  "data": {
    "message": "Autenticação realizada com sucesso",
    "expiresAt": "2025-09-30T10:30:00",
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "User Name",
      "roles": ["USER"]
    }
  }
}
```

## 🔄 Fluxo de Autenticação via Cookies

### 2. Requisições Autenticadas

```
Cliente → GET /api/resource (Cookie: accessToken=...)
       ← 200 OK + dados do recurso
```

### 3. Refresh de Tokens

```
Cliente → POST /auth/refresh (Cookie: refreshToken=...)
       ← 200 OK + Set-Cookie: accessToken + Set-Cookie: refreshToken
```

### 4. Logout

```
Cliente → POST /auth/logout
       ← 200 OK + Set-Cookie: accessToken=; Max-Age=0 + Set-Cookie: refreshToken=; Max-Age=0
```
