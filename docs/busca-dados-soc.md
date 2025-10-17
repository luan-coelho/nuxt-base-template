Link de relacionamento entre setor e unidade é hierarquia.json

## JSON's de Exemplos

### Cadastro de Empresas

https://ws1.soc.com.br/WebSoc/exportadados?parametro={"empresa":'500493',"codigo":"200267","chave":"1372b2861a7bafd29765","tipoSaida":"json"}

```json
{
  "CODIGO": "1150968",
  "NOMEABREVIADO": "AGROPECUÁRIA ÁGUA BENTA (396)",
  "RAZAOSOCIALINICIAL": "AGROPECUÁRIA ÁGUA BENTA LTDA",
  "RAZAOSOCIAL": "AGROPECUÁRIA ÁGUA BENTA LTDA",
  "ENDERECO": "ROD TO 130, ESTRADA SANTA TEREZA DO TOCANTINS A PONTE ALTA DO TO",
  "NUMEROENDERECO": "S/N",
  "COMPLEMENTOENDERECO": "",
  "BAIRRO": "ZONA RURAL",
  "CIDADE": "Ponte Alta do Tocantins",
  "CEP": "77590-000",
  "UF": "TO",
  "CNPJ": "36.430.164/0001-04",
  "INSCRICAOESTADUAL": "",
  "INSCRICAOMUNICIPAL": "",
  "ATIVO": "1",
  "CODIGOCLIENTEINTEGRACAO": "",
  "COD. CLIENTE (INT.)": ""
}
```

#### Informações que deverão ser salvas na tabela de empresas:

- Nome Abreviado;
- Razão Social;
- CNPJ;
- CAEPF;
- Endereço;
- CNAE;
- Grau de Risco.

### Cadastro de Unidades (todas empresas)

https://ws1.soc.com.br/WebSoc/exportadados?parametro={"empresa":'500493',"codigo":"200266","chave":"501cf2440298e0d88b93","tipoSaida":"json","ativo":""}

```json
{
  "CODIGOEMPRESA": "1150968",
  "NOMEEMPRESA": "AGROPECUÁRIA ÁGUA BENTA LTDA",
  "CODIGOUNIDADE": "001",
  "NOMEUNIDADE": "AGROPECUÁRIA ÁGUA BENTA (396)",
  "CODIGORHUNIDADE": "",
  "GRAUDERISCOUNIDADE": "3",
  "UNIDADEATIVA": "1",
  "CNPJUNIDADE": "36.430.164/0001-04",
  "INSCRICAOESTADUALUNIDADE": "",
  "CODIGOCLIENTEINTEGRACAO": "",
  "ENDERECO": "ROD TO 130, ESTRADA SANTA TEREZA DO TOCANTINS A PONTE ALTA DO TO",
  "NUMEROENDERECO": "S/N",
  "COMPLEMENTO": "",
  "BAIRRO": "ZONA RURAL",
  "CIDADE": "Ponte Alta do Tocantins",
  "UF": "TO",
  "CEP": "77590-000",
  "CPFUNIDADE": "",
  "RAZAOSOCIAL": "AGROPECUÁRIA ÁGUA BENTA LTDA"
}
```

#### Informações que deverão ser salvas na tabela de unidades:

- Nome Abreviado;
- Razão Social;
- CNPJ;
- CAEPF;
- Endereço;
- CNAE;
- Grau de Risco.
- Empresa (relação com a tabela de empresas).

### Cadastro de Setores (todas empresas)

https://ws1.soc.com.br/WebSoc/exportadados?parametro={"empresa":'500493',"codigo":"200268","chave":"aa518f7304ca04086775","tipoSaida":"json"}

```json
{
  "CODIGOEMPRESA": "1150968",
  "NOMEEMPRESA": "AGROPECUÁRIA ÁGUA BENTA LTDA",
  "CODIGOSETOR": "1",
  "NOMESETOR": "GES | SERVIÇOS GERAIS RURAIS",
  "CODIGORHSETOR": "",
  "SETORATIVO": "1"
}
```

#### Informações que deverão ser salvas na tabela de setores:

- Nome do Setor;
- Unidade (relação com a tabela de unidades).

### Cadastro de Cargos (todas empresas)

https://ws1.soc.com.br/WebSoc/exportadados?parametro={"empresa":'500493',"codigo":"200265","chave":"26e92249c7e0d592277c","tipoSaida":"json"}

```json
{
  "CODIGOEMPRESA": "1150968",
  "NOMEEMPRESA": "AGROPECUÁRIA ÁGUA BENTA LTDA",
  "CODIGOCARGO": "1",
  "NOMECARGO": "TRABALHADOR RURAL",
  "CODIGORHCARGO": "",
  "CARGOATIVO": "1",
  "FUNCAO": "TRABALHADOR RURAL",
  "GFIP": "00",
  "DESCRICAODETALHADA": "Executar diversos trabalhos próprios da cultura agrícola e da criação e tratamento do gado, empregando processos e equipamentos manuais ou mecanizados, para obter diversos produtos agrícolas e de orig",
  "CBO": ""
}
```

#### Informações que deverão ser salvas na tabela de cargos:

- Nome do Cargo;
- Descrição Detalhada.
- Setor (relação com a tabela de setores).

### Informações da Hierarquia (Por Empresa)

https://ws1.soc.com.br/WebSoc/exportadados?parametro={"empresa":'1150968',"codigo":"198531","chave":"3e122bc3400d8e0e58f5","tipoSaida":"json"}

```json
{
  "NOMEUNIDADE": "AGROPECUÁRIA ÁGUA BENTA (396)",
  "NOMESETOR": "GES | SERVIÇOS GERAIS RURAIS",
  "NOMECARGO": "TRABALHADOR RURAL",
  "LOCALSETORCARGO": "",
  "DESCRICAOSETORCARGODETALHADA": "",
  "FUNCAO": "TRABALHADOR RURAL",
  "CBO": "",
  "REQUISITOSFUNCAO": "",
  "DESCRICAODETALHADAPPRAPCMSO": "Executar diversos trabalhos próprios da cultura agrícola e da criação e tratamento do gado, empregando processos e equipamentos manuais ou mecanizados, para obter diversos produtos agrícolas e de orig",
  "USARDESCRICAOREQUISITOSDOCARGO": "Sim"
}
```

#### Informações que deverão ser salvas na tabela de hierarquias:

A ordem da hierarquia é: EMPRESA -> UNIDADE -> SETOR -> HIERARQUIA -> CARGO -> FUNCIONÁRIO
