# API de Usuários - Documentação

Esta documentação descreve as rotas da API de gerenciamento de usuários implementadas seguindo as melhores práticas do Nuxt 4.

## Rotas Disponíveis

### 1. Criar Usuário

**POST** `/api/users`

Cria um novo usuário no sistema.

#### Body (JSON)

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "123.456.789-00",
  "phone": "(11) 98765-4321",
  "roles": ["user"]
}
```

#### Campos

- `name` (obrigatório): Nome completo do usuário (mínimo 3 caracteres)
- `email` (obrigatório): E-mail válido
- `cpf` (obrigatório): CPF do usuário (11-14 caracteres, aceita formatação)
- `phone` (opcional): Telefone do usuário (10-15 caracteres, aceita formatação)
- `roles` (obrigatório): Array com as funções do usuário. Valores possíveis: `admin`, `user`, `manager`

#### Resposta de Sucesso (201)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "phone": "11987654321",
  "roles": ["user"],
  "active": true,
  "createdAt": "2025-10-15T10:00:00.000Z"
}
```

#### Erros Possíveis

- **400**: Dados inválidos
- **409**: E-mail ou CPF já cadastrado
- **500**: Erro interno do servidor

---

### 2. Listar Usuários

**GET** `/api/users`

Lista usuários com suporte a paginação, busca e filtros.

#### Query Parameters

- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Busca por nome, email ou CPF
- `sortBy` (opcional): Campo para ordenação (`name`, `email`, `cpf`, `active`, `createdAt`)
- `sortOrder` (opcional): Ordem da ordenação (`asc` ou `desc`, padrão: `desc`)
- `active` (opcional): Filtrar por status ativo (`true` ou `false`)

#### Exemplo de Requisição

```
GET /api/users?page=1&limit=10&search=joão&sortBy=name&sortOrder=asc&active=true
```

#### Resposta de Sucesso (200)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@example.com",
      "cpf": "12345678900",
      "phone": "11987654321",
      "roles": ["user"],
      "active": true,
      "emailVerified": false,
      "createdAt": "2025-10-15T10:00:00.000Z",
      "updatedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Erros Possíveis

- **500**: Erro interno do servidor

---

### 3. Buscar Usuário por ID

**GET** `/api/users/[id]`

Retorna os dados de um usuário específico.

#### Parâmetros de URL

- `id`: ID do usuário (UUID)

#### Exemplo de Requisição

```
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

#### Resposta de Sucesso (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "phone": "11987654321",
  "roles": ["user"],
  "active": true,
  "emailVerified": false,
  "createdAt": "2025-10-15T10:00:00.000Z",
  "updatedAt": null
}
```

#### Erros Possíveis

- **400**: ID não fornecido
- **404**: Usuário não encontrado
- **500**: Erro interno do servidor

---

### 4. Atualizar Usuário

**PATCH** `/api/users/[id]`

Atualiza os dados de um usuário existente. Todos os campos são opcionais.

#### Parâmetros de URL

- `id`: ID do usuário (UUID)

#### Body (JSON)

```json
{
  "name": "João Silva Atualizado",
  "email": "joao.novo@example.com",
  "cpf": "987.654.321-00",
  "phone": "(11) 91234-5678",
  "roles": ["manager", "user"]
}
```

#### Resposta de Sucesso (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva Atualizado",
  "email": "joao.novo@example.com",
  "cpf": "98765432100",
  "phone": "11912345678",
  "roles": ["manager", "user"],
  "active": true,
  "updatedAt": "2025-10-15T11:00:00.000Z"
}
```

#### Erros Possíveis

- **400**: Dados inválidos ou ID não fornecido
- **404**: Usuário não encontrado
- **409**: E-mail ou CPF já cadastrado para outro usuário
- **500**: Erro interno do servidor

---

### 5. Deletar Usuário

**DELETE** `/api/users/[id]`

Desativa um usuário (soft delete). O usuário não é removido do banco, apenas marcado como inativo.

#### Parâmetros de URL

- `id`: ID do usuário (UUID)

#### Exemplo de Requisição

```
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Usuário desativado com sucesso"
}
```

#### Erros Possíveis

- **400**: ID não fornecido
- **404**: Usuário não encontrado
- **500**: Erro interno do servidor

---

## Funcionalidades Implementadas

### Validação de Dados

- Todas as rotas utilizam validação com **Zod** através dos schemas definidos em `server/db/schemas/user-schema.ts`
- Validação automática usando `readValidatedBody` para garantir integridade dos dados

### Segurança

- CPF e telefone são limpos (removem formatação) antes de serem salvos
- Verificação de duplicidade de e-mail e CPF
- Soft delete para preservar dados históricos

### Organização

- Estrutura de rotas seguindo o padrão do Nuxt 4:
  - `index.get.ts` - Listar usuários
  - `index.post.ts` - Criar usuário
  - `[id].get.ts` - Buscar usuário por ID
  - `[id].patch.ts` - Atualizar usuário
  - `[id].delete.ts` - Deletar usuário

### Paginação e Filtros

- Suporte completo a paginação na listagem
- Busca por múltiplos campos (nome, email, CPF)
- Ordenação flexível por diferentes campos
- Filtro por status ativo/inativo

### Type Safety

- Tipagem completa com TypeScript
- Inferência automática de tipos com Drizzle ORM
- Schemas Zod para validação runtime

## Exemplo de Uso no Frontend

### Criar Usuário

```typescript
const { data, error } = await $fetch('/api/users', {
  method: 'POST',
  body: {
    name: 'João Silva',
    email: 'joao@example.com',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    roles: ['user']
  }
})
```

### Listar Usuários

```typescript
const { data, pagination } = await $fetch('/api/users', {
  query: {
    page: 1,
    limit: 10,
    search: 'joão',
    active: 'true'
  }
})
```

### Atualizar Usuário

```typescript
await $fetch(`/api/users/${userId}`, {
  method: 'PATCH',
  body: {
    name: 'Novo Nome'
  }
})
```

### Deletar Usuário

```typescript
await $fetch(`/api/users/${userId}`, {
  method: 'DELETE'
})
```
