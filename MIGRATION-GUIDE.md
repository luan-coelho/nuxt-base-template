# Guia de Migração - UUID para TEXT

## 📋 Problema Identificado

O Better Auth gera IDs usando strings aleatórias (ex: `ZF0pmmd26DD5ev86jl9NiSEb3PVsRE4V`), mas os schemas estavam configurados com `uuid`, causando o erro:

```
error: invalid input syntax for type uuid: "ZF0pmmd26DD5ev86jl9NiSEb3PVsRE4V"
```

## ✅ Schemas Atualizados

Todos os campos `id` foram alterados de `uuid` para `text`:

### Arquivos modificados:

- ✅ `server/db/schemas/user-schema.ts`
- ✅ `server/db/schemas/account-schema.ts`
- ✅ `server/db/schemas/session-schema.ts`
- ✅ `server/db/schemas/verification-schema.ts`

## 🚀 Próximos Passos

### 1. Gerar nova migração

```bash
pnpm drizzle-kit generate
```

### 2. Verificar a migração gerada

A migração deve conter comandos SQL para:

- Alterar o tipo da coluna `id` de `uuid` para `text` em todas as tabelas
- Alterar os tipos das colunas de foreign keys (`userId`, `accountId`, `providerId`)

### 3. Aplicar a migração

```bash
pnpm drizzle-kit push
```

Ou se você usa migrations manualmente:

```bash
pnpm drizzle-kit migrate
```

### 4. Testar o script de criação de admin

```bash
tsx scripts/create-admin.ts \
  --name "Admin Principal" \
  --email "admin@empresa.com" \
  --cpf "12345678900" \
  --password "Admin@123456" \
  --phone "11987654321"
```

## ⚠️ Importante

### Se o banco já tem dados:

1. **Faça backup do banco de dados antes de aplicar a migração**
2. A migração pode falhar se já existirem dados com UUIDs
3. Neste caso, você tem duas opções:

#### Opção A: Limpar o banco (desenvolvimento)

```sql
TRUNCATE TABLE users, accounts, sessions, verifications CASCADE;
```

#### Opção B: Migração manual (produção)

Se você já tem dados em produção, será necessário criar uma migração customizada que:

1. Cria novas colunas do tipo TEXT
2. Copia os dados convertendo UUID para TEXT
3. Remove as colunas antigas
4. Renomeia as novas colunas

## 📝 Estrutura Atualizada

### users

```typescript
{
  id: text('id').primaryKey(),  // ← Mudou de uuid para text
  // ... outros campos
}
```

### accounts

```typescript
{
  id: text('id').primaryKey(),           // ← Mudou
  accountId: text('account_id'),          // ← Mudou
  providerId: text('provider_id'),        // ← Mudou
  userId: text('user_id'),                // ← Mudou
  // ... outros campos
}
```

### sessions

```typescript
{
  id: text('id').primaryKey(),  // ← Mudou
  userId: text('user_id'),       // ← Mudou
  // ... outros campos
}
```

### verifications

```typescript
{
  id: text('id').primaryKey(),  // ← Mudou
  // ... outros campos
}
```

## ✨ Benefícios

- ✅ Compatível com Better Auth por padrão
- ✅ IDs gerados automaticamente pelo Better Auth
- ✅ Não requer configuração adicional
- ✅ Funciona perfeitamente com a API `auth.api.signUpEmail()`

## 🔍 Verificação

Após aplicar a migração, você pode verificar no banco:

```sql
-- Ver estrutura da tabela users
\d users

-- A coluna id deve ser do tipo 'text' agora
```
