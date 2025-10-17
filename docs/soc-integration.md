# Integração SOC - Sistema Ocupacional

Este documento descreve a implementação da integração com o sistema SOC (Sistema Ocupacional) para sincronização de dados.

## 📋 Visão Geral

O sistema sincroniza os seguintes dados do SOC:

- **Empresas** (Companies)
- **Unidades** (Units)
- **Setores** (Sectors)
- **Cargos** (Jobs)

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
server/
├── types/
│   └── soc.ts                    # TypeScript types para API do SOC
├── lib/
│   └── soc-api-client.ts         # Cliente HTTP para API do SOC
├── services/
│   └── soc-sync.service.ts       # Serviço de sincronização
└── api/
    └── soc/
        ├── sync.post.ts          # Endpoint para sync completo
        └── sync/
            ├── companies.post.ts # Sync apenas empresas
            ├── units.post.ts     # Sync apenas unidades
            ├── sectors.post.ts   # Sync apenas setores
            └── jobs.post.ts      # Sync apenas cargos
```

### Hierarquia de Dados

```
Company (Empresa)
    ↓ companyId
Unit (Unidade)
    ↓ unitId
Sector (Setor)
    ↓ sectorId
Job (Cargo)
```

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
# SOC API Configuration
SOC_EMPRESA=500493
SOC_BASE_URL=https://ws1.soc.com.br/WebSoc/exportadados

# SOC API Keys (um para cada endpoint)
SOC_API_KEY_COMPANIES=1372b2861a7bafd29765
SOC_API_KEY_UNITS=501cf2440298e0d88b93
SOC_API_KEY_SECTORS=aa518f7304ca04086775
SOC_API_KEY_JOBS=26e92249c7e0d592277c
```

### Configuração do Nuxt

Adicione ao `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    socEmpresa: process.env.SOC_EMPRESA,
    socBaseUrl: process.env.SOC_BASE_URL || 'https://ws1.soc.com.br/WebSoc/exportadados',
    socApiKeyCompanies: process.env.SOC_API_KEY_COMPANIES,
    socApiKeyUnits: process.env.SOC_API_KEY_UNITS,
    socApiKeySectors: process.env.SOC_API_KEY_SECTORS,
    socApiKeyJobs: process.env.SOC_API_KEY_JOBS
  }
})
```

## 🚀 Uso

### Sincronização Completa

Sincroniza todos os dados (empresas, unidades, setores e cargos) na ordem correta:

```bash
curl -X POST http://localhost:3000/api/soc/sync
```

**Resposta:**

```json
{
  "success": true,
  "message": "SOC synchronization completed successfully",
  "statistics": {
    "companies": {
      "created": 5,
      "updated": 10,
      "failed": 0
    },
    "units": {
      "created": 15,
      "updated": 20,
      "failed": 0
    },
    "sectors": {
      "created": 30,
      "updated": 25,
      "failed": 0
    },
    "jobs": {
      "created": 50,
      "updated": 40,
      "failed": 0
    },
    "startedAt": "2025-10-17T10:00:00.000Z",
    "completedAt": "2025-10-17T10:05:00.000Z",
    "errors": []
  }
}
```

### Sincronização Parcial

#### Apenas Empresas

```bash
curl -X POST http://localhost:3000/api/soc/sync/companies
```

#### Apenas Unidades

```bash
curl -X POST http://localhost:3000/api/soc/sync/units
```

#### Apenas Setores

```bash
curl -X POST http://localhost:3000/api/soc/sync/sectors
```

#### Apenas Cargos

```bash
curl -X POST http://localhost:3000/api/soc/sync/jobs
```

## 📊 Mapeamento de Dados

### Companies (Empresas)

| Campo SOC     | Campo DB    | Tipo    | Obrigatório |
| ------------- | ----------- | ------- | ----------- |
| CODIGO        | socCode     | string  | Não         |
| NOMEABREVIADO | name        | string  | Sim         |
| RAZAOSOCIAL   | companyName | string  | Sim         |
| CNPJ          | cnpj        | string  | Não         |
| ENDERECO      | address     | text    | Não         |
| ATIVO         | active      | boolean | Sim         |

### Units (Unidades)

| Campo SOC          | Campo DB       | Tipo    | Obrigatório |
| ------------------ | -------------- | ------- | ----------- |
| CODIGOUNIDADE      | socCode        | string  | Não         |
| CODIGOEMPRESA      | socCompanyCode | string  | Não         |
| NOMEUNIDADE        | name           | string  | Sim         |
| RAZAOSOCIAL        | companyName    | string  | Sim         |
| CNPJUNIDADE        | cnpj           | string  | Não         |
| CPFUNIDADE         | cpf            | string  | Não         |
| ENDERECO           | address        | text    | Não         |
| GRAUDERISCOUNIDADE | riskDegree     | string  | Não         |
| UNIDADEATIVA       | active         | boolean | Sim         |
| CODIGOEMPRESA      | companyId      | FK      | Sim         |

### Sectors (Setores)

| Campo SOC     | Campo DB       | Tipo    | Obrigatório |
| ------------- | -------------- | ------- | ----------- |
| CODIGOSETOR   | socCode        | string  | Não         |
| CODIGOEMPRESA | socCompanyCode | string  | Não         |
| NOMESETOR     | name           | string  | Sim         |
| SETORATIVO    | active         | boolean | Sim         |
| -             | unitId         | FK      | Sim         |

### Jobs (Cargos)

| Campo SOC          | Campo DB            | Tipo    | Obrigatório |
| ------------------ | ------------------- | ------- | ----------- |
| CODIGOCARGO        | socCode             | string  | Não         |
| CODIGOEMPRESA      | socCompanyCode      | string  | Não         |
| NOMECARGO          | name                | string  | Sim         |
| DESCRICAODETALHADA | detailedDescription | text    | Não         |
| CARGOATIVO         | active              | boolean | Sim         |
| -                  | sectorId            | FK      | Sim         |

## 🔄 Lógica de Sincronização

### Estratégia de Sync

1. **Upsert**: O sistema verifica se o registro já existe (pelo `socCode`)
   - Se existe: atualiza os dados
   - Se não existe: cria um novo registro

2. **Ordem de Execução**: A sincronização respeita a hierarquia:
   - 1º Companies
   - 2º Units (depende de Companies)
   - 3º Sectors (depende de Units)
   - 4º Jobs (depende de Sectors)

3. **Tratamento de Erros**:
   - Erros em registros individuais não interrompem a sincronização
   - Erros são coletados no array `statistics.errors`
   - Logs detalhados são gerados para debugging

### Relacionamentos

- **Units → Companies**: Através de `companyId` (FK para `companies.id`)
- **Sectors → Units**: Através de `unitId` (FK para `units.id`)
- **Jobs → Sectors**: Através de `sectorId` (FK para `sectors.id`)

## 🔍 Endpoints da API SOC

### Empresas

```
https://ws1.soc.com.br/WebSoc/exportadados?parametro={
  "empresa": "500493",
  "codigo": "200267",
  "chave": "1372b2861a7bafd29765",
  "tipoSaida": "json"
}
```

### Unidades

```
https://ws1.soc.com.br/WebSoc/exportadados?parametro={
  "empresa": "500493",
  "codigo": "200266",
  "chave": "501cf2440298e0d88b93",
  "tipoSaida": "json",
  "ativo": ""
}
```

### Setores

```
https://ws1.soc.com.br/WebSoc/exportadados?parametro={
  "empresa": "500493",
  "codigo": "200268",
  "chave": "aa518f7304ca04086775",
  "tipoSaida": "json"
}
```

### Cargos

```
https://ws1.soc.com.br/WebSoc/exportadados?parametro={
  "empresa": "500493",
  "codigo": "200265",
  "chave": "26e92249c7e0d592277c",
  "tipoSaida": "json"
}
```

## 🛠️ Desenvolvimento

### Executar Sync Manualmente

Você pode usar o serviço diretamente no código:

```typescript
import { SocSyncService } from '~/server/services/soc-sync.service'

const syncService = new SocSyncService()

// Sync completo
const stats = await syncService.syncAll()

// Sync individual
await syncService.syncCompanies()
await syncService.syncUnits()
await syncService.syncSectors()
await syncService.syncJobs()

// Ver estatísticas
const statistics = syncService.getStatistics()
console.log(statistics)
```

### Adicionar Autenticação

Para proteger os endpoints, adicione middleware de autenticação:

```typescript
// server/api/soc/sync.post.ts
export default defineEventHandler(async event => {
  // Verifica se usuário está autenticado e é admin
  const session = await requireUserSession(event)
  if (!session.user.roles.includes('admin')) {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized'
    })
  }

  // ... resto do código
})
```

## 📝 Notas Importantes

1. **Performance**: A sincronização completa pode demorar dependendo da quantidade de dados
2. **Rate Limiting**: Considere adicionar rate limiting para evitar sobrecarga da API do SOC
3. **Agendamento**: Use cron jobs ou scheduled tasks para sincronização automática periódica
4. **Logs**: Todos os erros são logados no console para facilitar debugging
5. **Transações**: Considere usar transações do banco de dados para garantir consistência

## 🔐 Segurança

- ✅ As chaves da API estão em variáveis de ambiente
- ✅ Endpoints protegidos (adicionar autenticação)
- ⚠️ Adicionar validação de IP/origem se necessário
- ⚠️ Implementar rate limiting
- ⚠️ Adicionar logs de auditoria

## 🚦 Próximos Passos

- [ ] Adicionar autenticação nos endpoints
- [ ] Implementar cron job para sync automático
- [ ] Adicionar testes unitários
- [ ] Implementar retry logic para falhas temporárias
- [ ] Adicionar webhook para notificações
- [ ] Criar dashboard de monitoramento
