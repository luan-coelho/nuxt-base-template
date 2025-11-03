# Guia de Integração Frontend - Autenticação Baseada em Cookies

## Visão Geral

O frontend não precisa manipular tokens manualmente, pois eles são gerenciados automaticamente pelos cookies gerados pelo backend.

## Características da Autenticação

- **Cookies HttpOnly**: Os tokens não são acessíveis via JavaScript, aumentando a segurança
- **Cookies Secure**: Tokens são transmitidos apenas via HTTPS
- **Access Token**: Token de curta duração para autenticação de requisições
- **Refresh Token**: Token de longa duração para renovar o access token

---

## Endpoints Disponíveis

### 1. POST `/auth/signin` - Login de Usuário

Autentica um usuário existente e retorna os dados do usuário com tokens nos cookies.

#### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Validações:**

- `email`: obrigatório, deve ser um e-mail válido
- `password`: obrigatório

#### Response Success (200 OK)

**Cookies definidos:**

- `accessToken`: Token JWT de acesso (HttpOnly, Secure)
- `refreshToken`: Token JWT de renovação (HttpOnly, Secure)

**Body:**

```json
{
  "user": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "cpf": "123.456.789-00",
    "roles": ["USER"]
  }
}
```

#### Response Error

**401 Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "E-mail ou senha inválidos"
  }
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Usuário inativo"
  }
}
```

### 2. POST `/auth/register` - Registro de Novo Usuário

Registra um novo usuário no sistema e retorna os dados do usuário com tokens nos cookies.

#### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "cpf": "123.456.789-00",
  "phone": "(11) 98765-4321",
  "password": "senha123",
  "roles": ["USER"]
}
```

**Validações:**

- `name`: obrigatório, entre 2 e 100 caracteres
- `email`: obrigatório, deve ser um e-mail válido, máximo 255 caracteres
- `cpf`: deve ser um CPF válido
- `phone`: deve ser um telefone válido (10-11 dígitos ou formato (XX) XXXXX-XXXX), máximo 15 caracteres
- `password`: obrigatório, mínimo 6 caracteres
- `roles`: opcional, padrão é `["USER"]`

#### Response Success (201 CREATED)

**Cookies definidos:**

- `accessToken`: Token JWT de acesso (HttpOnly, Secure)
- `refreshToken`: Token JWT de renovação (HttpOnly, Secure)

**Body:**

```json
{
  "user": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "cpf": "123.456.789-00",
    "roles": ["USER"]
  }
}
```

#### Response Error

**400 Bad Request:**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Mensagem de erro específica (ex: E-mail já cadastrado)"
  }
}
```

### 3. POST `/auth/refresh` - Renovar Tokens

Renova o access token usando o refresh token armazenado nos cookies.

#### Request

**Headers:**

```
Content-Type: (qualquer)
```

**Body:** Vazio ou qualquer conteúdo (será ignorado)

**Cookies:**

- `refreshToken`: Enviado automaticamente pelo navegador

#### Response Success (200 OK)

**Cookies atualizados:**

- `accessToken`: Novo token JWT de acesso
- `refreshToken`: Novo token JWT de renovação

**Body:**

```json
{
  "id": "uuid-do-usuario",
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "cpf": "123.456.789-00",
  "roles": ["USER"]
}
```

#### Response Error

**401 Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Refresh não fornecido"
  }
}
```

ou

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Refresh token inválido ou expirado"
  }
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Usuário inativo"
  }
}
```

### 4. GET `/auth/me` - Obter Usuário Autenticado

Retorna as informações do usuário atualmente autenticado.

#### Request

**Headers:**

```
(nenhum header específico necessário)
```

**Cookies:**

- `accessToken`: Enviado automaticamente pelo navegador

**Autorização:** Requer roles `USER` ou `ADMIN`

#### Response Success (200 OK)

**Body:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "roles": ["USER"],
    "active": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

#### Response Error

**401 Unauthorized:** Token ausente ou inválido

**403 Forbidden:** Usuário sem permissão adequada

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR",
    "message": "Erro interno do servidor"
  }
}
```

### 5. POST `/auth/logout` - Logout do Usuário

Realiza o logout do usuário, removendo os cookies de autenticação.

#### Request

**Headers:**

```
Content-Type: (qualquer)
```

**Body:** Vazio ou qualquer conteúdo (será ignorado)

#### Response Success (200 OK)

**Cookies removidos:**

- `accessToken`: Cookie expirado
- `refreshToken`: Cookie expirado

**Body:** Vazio

### 4. Validação de Entrada

Sempre valide os dados no frontend antes de enviar para a API, mas **nunca confie apenas na validação do frontend**.
