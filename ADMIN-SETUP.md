# Guia Rápido - Criar Usuário Administrador

## Usando tsx diretamente

```bash
tsx scripts/create-admin.ts \
  --name "Admin Principal" \
  --email "admin@gmail.com" \
  --cpf "941.800.330-97" \
  --password "admin123" \
  --phone "68981614575"
```

## Usando npm script

```bash
pnpm create-admin -- \
  --name "Admin Principal" \
  --email "admin@empresa.com" \
  --cpf "12345678900" \
  --password "Admin@123456" \
  --phone "11987654321"
```

## Parâmetros

- `--name`: Nome completo (obrigatório)
- `--email`: E-mail único (obrigatório)
- `--cpf`: CPF sem formatação (obrigatório)
- `--password`: Senha forte (obrigatório)
- `--phone`: Telefone (opcional)

## Notas Importantes

1. ✅ O script usa a API oficial do Better Auth (`auth.api.signUpEmail()`)
2. ✅ A senha é automaticamente hasheada com bcrypt (segurança de produção)
3. ✅ Valida se o e-mail e CPF já existem no banco
4. ✅ O usuário é criado com a role 'admin'
5. ✅ O e-mail é marcado como verificado automaticamente
6. ✅ O usuário é criado como ativo
7. ✅ As credenciais são criadas automaticamente pelo Better Auth

## Fluxo de Criação

```
1. Validação de dados (e-mail e CPF únicos)
   ↓
2. Better Auth cria usuário + credenciais
   - Usa bcrypt para hash de senha
   - Cria registro na tabela users
   - Cria registro na tabela account
   ↓
3. Atualização de dados adicionais
   - Adiciona CPF
   - Adiciona telefone (opcional)
   - Define role como 'admin'
   - Marca e-mail como verificado
```

Para mais detalhes, consulte [scripts/README.md](./scripts/README.md)
