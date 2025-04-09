# Plano de Refatoração - Clean Code & Clean Architecture

## Objetivo
Reestruturar o código do projeto para aderir aos princípios de Clean Code, Clean Architecture e melhores práticas, sem alterar funcionalidades, sem adicionar comentários ou testes, apenas reorganizando e limpando o código.

## Escopo
- Refatoração completa dos arquivos em `/src/client` (Presentation Layer)
- Refatoração completa dos arquivos em `/src/core` (Domain, Application, Infrastructure)
- **Ignorar** a pasta `/src/components/ui` (componentes shadcn)
- Não adicionar funcionalidades, comentários ou testes
- Criar issues separadas para erros ou melhorias encontradas

## Metodologia
1. **Mapeamento e análise detalhada**
   - Analisar cada pasta e arquivo individualmente
   - Documentar problemas, inconsistências, violações de boas práticas
   - Sugerir melhorias estruturais e de código
   - Criar issues para erros ou melhorias fora do escopo

2. **Planejamento da refatoração**
   - Definir sequência lógica das alterações
   - Dividir em macro e micro etapas
   - Garantir que funcionalidades permaneçam intactas

3. **Execução da refatoração**
   - Refatorar arquivos um a um conforme plano
   - Validar integridade do sistema a cada etapa

## Princípios adotados
- **Clean Code**: nomes descritivos, funções pequenas, responsabilidade única, evitar duplicação, código legível
- **Clean Architecture**: separação clara entre camadas (Presentation, Domain, Application, Infrastructure)
- **Boas práticas gerais**: SOLID, DRY, KISS, YAGNI

## Próximos passos
- Analisar `/src/client` (exceto `/src/components/ui`)
- Analisar `/src/core`
- Documentar cada análise em subpastas dentro de `docs/refatoracao-clean-architecture/`
- Criar plano detalhado de execução da refatoração
- Executar a refatoração conforme plano

## Análise Parcial - src/client/components (exceto ui, prompt-manager, providers)

### Visão geral
- Componentes pequenos (ex: `messages/*`, `mode-toggle.tsx`, `github-token-manager.tsx`) seguem boas práticas.
- Componentes médios (`model-configuration.tsx`, `model-settings.tsx`) podem ser modularizados.
- Componentes grandes (`activity-log.tsx`, `repository-settings.tsx`, `documentation.tsx`, `dashboard.tsx`) concentram múltiplas responsabilidades e são difíceis de manter.

### Problemas identificados
- Funções excessivamente longas, violando Clean Code:
  - `dashboard.tsx` (~400 linhas)
  - `documentation.tsx` (~380 linhas)
  - `repository-settings.tsx` (~350 linhas)
  - `activity-log.tsx` (~140 linhas)
  - `model-card/ModelActions.tsx` (>50 linhas)
- Mistura de lógica de dados, filtragem, formatação e renderização.
- Baixa modularização, dificultando manutenção e testes.
- Violações de Clean Architecture: mistura de camadas e responsabilidades.

### Recomendações
- Dividir componentes grandes em subcomponentes menores.
- Extrair lógica de dados e manipulação para hooks.
- Separar responsabilidades visuais e de dados.
- Consolidar componentes comuns para evitar duplicação.

### Issues criadas
- **ISSUE-0089:** Refatorar componente Dashboard
- **ISSUE-0090:** Refatorar componente Documentation
- **ISSUE-0091:** Refatorar componente RepositorySettings
- **ISSUE-0092:** Refatorar componente ActivityLog
- **ISSUE-0093:** Refatorar componente ModelActions

### Próximos passos
- Priorizar as refatorações listadas.
- Continuar análise das demais pastas (`prompt-manager`, `providers`, etc).
- Atualizar este documento com novas análises.

# Plano Consolidado da Refatoração

## Resumo das análises

- **Client**: componentes grandes, funções longas, mistura de responsabilidades, necessidade de modularização e extração de hooks
- **Core Application**: funções complexas, dependências incorretas, vazamento de responsabilidades
- **Core Domain**: interfaces sobrepostas, tipagens genéricas, necessidade de segregação e documentação
- **Core Infrastructure**: mistura de regras de negócio e persistência, dependências incorretas, acoplamento excessivo

## Sequência recomendada

1. **Refatorar componentes do client**
   - Começar pelos componentes grandes (`Dashboard`, `Documentation`, `RepositorySettings`, `ActivityLog`)
   - Modularizar `prompt-manager` e `providers`
   - Ajustar hooks e libs
   - Refatorar páginas

2. **Refatorar camada Application**
   - Extrair lógica para serviços e use cases
   - Corrigir dependências e vazamentos
   - Segregar responsabilidades

3. **Refatorar camada Domain**
   - Segregar interfaces
   - Definir tipagens estritas
   - Documentar contratos

4. **Refatorar camada Infrastructure**
   - Separar persistência de regras de negócio
   - Criar adaptadores e gateways
   - Reduzir acoplamento

## Macro e micro etapas

- **Macro**: refatoração por camada e módulo
- **Micro**: renomear variáveis, extrair funções, dividir classes, mover arquivos

## Issues criadas

- Listadas nas análises detalhadas em `docs/refatoracao-clean-architecture/`
- Organizadas no backlog por prioridade e dependência

## Diretrizes

- Não adicionar funcionalidades, comentários ou testes
- Manter funcionalidades existentes intactas
- Criar issues para erros ou melhorias encontradas durante a execução

## Próximos passos

- Priorizar issues e etapas
- Executar refatoração incrementalmente
- Atualizar documentação conforme progresso