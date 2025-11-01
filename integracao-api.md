# Integração do Frontend com Autenticação e Autorização da API

Este documento explica como um frontend pode se integrar com a API de autenticação e autorização implementada em Quarkus.

## Fluxo de Autenticação

1. **Registro de Usuário**
   - Endpoint: `POST /auth/register`
   - Envie um JSON com os dados do usuário:
     ```json
     {
       "name": "João Silva",
       "email": "joao@exemplo.com",
       "cpf": "12345678901",
       "password": "senhaSegura123",
       "roles": ["USER"]
     }
     ```
   - Resposta: Dados do usuário + tokens JWT (accessToken, refreshToken)

2. **Login (Signin)**
   - Endpoint: `POST /auth/signin`
   - Envie um JSON:
     ```json
     {
       "email": "joao@exemplo.com",
       "password": "senhaSegura123"
     }
     ```
   - Resposta: Dados do usuário + tokens JWT

3. **Renovação de Token (Refresh Token)**
   - Endpoint: `POST /auth/refresh`
   - Envie um JSON:
     ```json
     {
       "refreshToken": "<refresh_token_recebido>"
     }
     ```
   - Resposta: Novos tokens JWT

## Estrutura da Resposta de Autenticação

```json
{
  "accessToken": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>",
  "tokenType": "Bearer",
  "expiresAt": "2025-12-31T23:59:59Z",
  "user": {
    "id": "...",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "roles": ["USER", "ADMIN"]
  }
}
```

Exemplo de resposta de erro:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Credenciais inválidas"
  }
}
```
