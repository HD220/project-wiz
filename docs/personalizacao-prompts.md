# Documentação da Feature: **Personalização de Prompts**

## 1. Visão Geral

### Objetivo
Permitir que usuários avançados e desenvolvedores criem, editem, organizem, exportem, importem e compartilhem **prompts personalizados** com variáveis dinâmicas, otimizando fluxos de trabalho com LLMs.

### Benefícios
- Criação de templates reutilizáveis e parametrizáveis
- Facilidade para ajustar prompts sem alterar código
- Compartilhamento seguro e rápido de prompts
- Controle de versões e restauração para padrão
- Integração transparente com configurações globais

---

## 2. Arquitetura

### Estrutura de Dados

#### Entidade Prompt (`prompts`)
| Campo         | Tipo        | Descrição                                   |
|---------------|-------------|----------------------------------------------|
| `id`          | UUID        | Identificador único                         |
| `name`        | string      | Nome único do prompt                       |
| `content`     | string      | Texto do prompt com placeholders `{{var}}` |
| `createdAt`   | timestamp   | Data de criação                            |
| `updatedAt`   | timestamp   | Última atualização                         |
| `version`     | int         | Controle de versões                        |
| `isDefault`   | boolean     | Indica se é prompt padrão                  |
| `isShared`    | boolean     | Indica se está compartilhado               |
| `sharedLink`  | string      | Token/link público opcional                |

#### Entidade Variable (`variables`)
| Campo          | Tipo        | Descrição                                         |
|----------------|-------------|----------------------------------------------------|
| `id`           | UUID        | Identificador único da variável                   |
| `promptId`     | UUID        | FK para prompt                                   |
| `name`         | string      | Nome da variável (placeholder)                   |
| `type`         | enum        | `string`, `number`, `boolean`, `date`, `enum`    |
| `required`     | boolean     | Se é obrigatória                                 |
| `defaultValue` | JSON        | Valor padrão opcional                            |
| `options`      | JSON        | Lista de opções (para enum)                      |

---

### Banco de Dados e Repositório

- Persistência via SQLite + Drizzle ORM
- Classe `PromptRepository`:
  - CRUD completo com validações
  - Importação/exportação com merge por nome
  - Controle de versões automático
  - Restauração para prompts padrão
  - Limites e validações integrados ao `SettingsService`

---

### Serviço de Aplicação de Variáveis

- Função `applyPrompt(prompt, values)`
- Valida tipos e obrigatoriedade
- Substitui placeholders `{{ nome }}` por valores sanitizados
- Suporta todos os tipos, inclusive enum e datas
- Sanitização para evitar injeções

---

### Integração com `SettingsService`

- Limites configuráveis:
  - Máximo prompts: 100
  - Máximo caracteres: 10.000
  - Máximo variáveis: 20
- Palavras proibidas: `"senha"`, `"password"`, `"token"`, `"chave-secreta"`
- Futuramente configurável via backend

---

### Compartilhamento Seguro

- Exportação com checksum para garantir integridade
- Validação na importação
- Geração de token UUID para links públicos
- Possibilidade de evoluir para assinatura digital

---

## 3. Fluxo de Uso

### Criar Prompt
- Acessar **Prompt Manager**
- Clicar em **Novo Prompt**
- Preencher nome e conteúdo com placeholders `{{variavel}}`
- Adicionar variáveis (nome, tipo, obrigatório, valor padrão, opções enum)
- Visualizar resultado dinâmico na prévia
- Salvar

### Editar Prompt
- Selecionar prompt na lista
- Clicar em **Editar**
- Alterar dados e salvar

### Excluir Prompt
- Selecionar prompt
- Clicar em **Excluir**

### Aplicar Variáveis e Visualizar Prévia
- No formulário, preencher valores simulados para variáveis
- Visualizar resultado renderizado com substituições

### Exportar Prompts
- Clicar em **Exportar**
- Baixar arquivo JSON com checksum

### Importar Prompts
- Clicar em **Importar**
- Selecionar arquivo JSON exportado
- Sistema valida integridade e substitui prompts existentes pelo nome

### Compartilhar Prompt
- Clicar em **Gerar Link**
- Token UUID gerado e salvo no prompt
- Link pode ser compartilhado com segurança

### Restaurar Padrão
- Remove todos os prompts personalizados
- Mantém apenas os padrões do sistema

---

## 4. APIs Internas

### PromptRepository

- `createPrompt(data: PromptData)`
- `updatePrompt(id, data)`
- `deletePrompt(id)`
- `getPrompt(id)`
- `listPrompts(filter?)`
- `importPrompts(data[])`
- `exportPrompts(ids?)`
- `restoreDefaultPrompts()`

### Serviço de Processamento

- `applyPrompt(prompt, values): string`

### Serviço de Compartilhamento

- `exportPromptsWithChecksum(prompts)`
- `validateImportedPackage(pkg)`
- `generateShareToken()`

---

## 5. Exemplos

### Template com Variáveis

Olá {{nome}}, sua consulta está agendada para {{data}}.

### Definição de Variáveis

| Nome   | Tipo    | Obrigatório | Valor Padrão | Opções (enum) |
|---------|---------|-------------|--------------|---------------|
| nome    | string  | Sim         | -            | -             |
| data    | date    | Sim         | -            | -             |
| idioma  | enum    | Não         | "pt-BR"      | "pt-BR", "en" |

### Exportação

```json
{
  "prompts": [ { "name": "...", "content": "...", "variables": [...] } ],
  "checksum": "123456789"
}
```

### Link Compartilhável

https://app/prompt/share/<UUID>

---

## 6. Validações e Restrições

- Nome único, 3-50 caracteres
- Conteúdo até 10.000 caracteres
- Máximo 100 prompts por usuário
- Máximo 20 variáveis por prompt
- Palavras proibidas bloqueadas
- Variáveis obrigatórias devem ser preenchidas
- Tipos validados na aplicação
- Checksum garante integridade na importação/exportação
- Tokens UUID para compartilhamento seguro

---

## 7. Riscos e Pontos de Atenção

- Segurança: evitar vazamento de dados sensíveis via prompts compartilhados
- Integridade: garantir que importações não corrompam dados
- Escalabilidade: limites fixos podem precisar ser ajustados
- Conflitos: nomes duplicados na importação substituem prompts existentes
- Validações: dependem do `SettingsService`, que deve ser confiável

---

## 8. Próximos Passos e Melhorias Futuras

- Permitir descrição salva para prompts
- Assinatura digital para exportação/importação segura
- Controle de permissões por usuário
- Histórico de versões e rollback
- Editor avançado com validação em tempo real
- Templates públicos e marketplace
- Configurações dinâmicas via backend
- Suporte a variáveis aninhadas ou condicionais