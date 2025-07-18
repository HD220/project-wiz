# Análise de Conformidade da Arquitetura do Project Wiz

**Data:** 2025-07-18
**Status:** Completo

---

## 🎯 Objetivo

Este documento detalha as inconsistências e implementações ausentes encontradas no codebase do Project Wiz, comparadas com as especificações de arquitetura definidas nos documentos em `docs/architecture/new/`. Cada item é apresentado como uma "issue" com um checklist para facilitar a correção.

---

## 📝 Issues Encontradas

### Issue #1: Inconsistência na Estrutura de Diretórios do Frontend (`src/renderer/`)

- **Descrição**: A documentação (`02-estrutura_do_projeto.md` e `04-camada-frontend.md`) especifica que a organização do frontend deve ser feita sob `src/renderer/features/` para agrupar a UI por domínio de negócio. No entanto, a implementação atual utiliza `src/renderer/domains/` para essa finalidade.
- **Impacto**: Viola o princípio de "Convention over Configuration" e pode causar confusão para novos desenvolvedores, além de dificultar a navegação e a manutenção do código.
- **Referência da Arquitetura**:
  - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
  - [4. Camada Frontend (Renderer Process) - 2. Arquitetura de Features (Domain-Driven)](docs/architecture/new/04-camada-frontend.md#2-arquitetura-de-features-domain-driven)
- **Localização no Código**: `src/renderer/domains/` (e todos os seus subdiretórios)
- **Checklist de Correção**:
  - [x] Renomear o diretório `src/renderer/domains/` para `src/renderer/features/`.
  - [x] Atualizar todos os imports e referências no código que apontam para `src/renderer/domains/` para `src/renderer/features/`.
  - [x] Revisar a documentação interna e comentários de código para refletir a nova estrutura.
  - [x] Garantir que a estrutura interna de `features` (e.g., `components/`, `hooks/`) esteja consistente com a documentação.

### Issue #2: Inconsistência na Localização de `direct-messages` no Backend

- **Descrição**: A documentação (`02-estrutura_do_projeto.md`) não lista `src/main/user/direct-messages/` como um agregado do contexto `user`. Além disso, `08-funcionalidade-espaco-pessoal-e-dms.md` afirma que a lógica de DMs reside no Bounded Context `conversations`. A presença de `direct-messages` sob `user` é uma inconsistência.
- **Impacto**: Quebra a organização por Bounded Contexts e a separação de responsabilidades, tornando o código menos manutenível e mais difícil de entender.
- **Referência da Arquitetura**:
  - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
  - [8. Funcionalidade: Espaço Pessoal e DMs - 1. Mensagens Diretas (DMs)](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md#1-mensagens-diretas-dms)
- **Localização no Código**: `src/main/user/direct-messages/`
- **Checklist de Correção**:
  - [x] Mover o conteúdo de `src/main/user/direct-messages/` para `src/main/conversations/direct-messages/`.
  - [x] Atualizar todos os imports e referências no código que apontam para a localização antiga.
  - [x] Adicionar `direct-messages/` como um agregado explícito sob `conversations/` na documentação `02-estrutura_do_projeto.md`.

### Issue #3: Duplicação de `logger.ts` e Omissão de `utils/` no `src/main`

- **Descrição**: O arquivo `logger.ts` está duplicado em `src/main/` e `src/main/utils/`. Além disso, o diretório `src/main/utils/` não é explicitamente listado na estrutura de diretórios em `02-estrutura_do_projeto.md`.
- **Impacto**: Duplicação de código e falta de clareza na estrutura do projeto, dificultando a localização de utilitários e a manutenção.
- **Referência da Arquitetura**:
  - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
  - [1. Visão Geral e Princípios da Arquitetura - Stack Tecnológico](docs/architecture/new/01-visao-geral-e-principios.md#stack-tecnológico) (menciona `logger.ts`)
- **Localização no Código**: `src/main/logger.ts`, `src/main/utils/logger.ts`, `src/main/utils/`
- **Checklist de Correção**:
  - [x] Remover o arquivo `src/main/logger.ts` (manter a versão em `src/main/utils/logger.ts`).
  - [x] Atualizar todas as referências para `src/main/logger.ts` para apontar para `src/main/utils/logger.ts`.
  - [x] Adicionar `utils/` como um diretório de utilitários gerais sob `src/main/` na documentação `02-estrutura_do_projeto.md`.

### Issue #4: Inconsistência na Localização dos Handlers IPC no Backend

- **Descrição**: A documentação (`03-camada-backend.md`) sugere que os handlers IPC devem estar localizados dentro dos diretórios de seus respectivos domínios/agregados (ex: `src/main/project/project.handlers.ts`). No entanto, existe um arquivo `src/main/ipc/main.handlers.ts`, indicando uma centralização de alguns handlers, o que contradiz a abordagem distribuída.
- **Impacto**: Viola o princípio de "Domain-Driven Organization" e a separação de responsabilidades, tornando a lógica de comunicação menos coesa com seus domínios.
- **Referência da Arquitetura**:
  - [3. Camada Backend (Main Process) - 2. API Layer: Comunicação via IPC](docs/architecture/new/03-camada-backend.md#2-api-layer-comunicação-via-ipc)
  - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
- **Localização no Código**: `src/main/ipc/main.handlers.ts`
- **Checklist de Correção**:
  - [x] Mover os handlers definidos em `src/main/ipc/main.handlers.ts` para seus respectivos diretórios de domínio/agregado (ex: handlers de usuário para `src/main/user/authentication/auth.handlers.ts`, handlers de projeto para `src/main/project/project.handlers.ts`).
  - [x] Remover o diretório `src/main/ipc/` se todos os handlers forem movidos.
  - [x] Atualizar a documentação `03-camada-backend.md` para refletir a abordagem de handlers distribuídos, ou ajustar a documentação `02-estrutura_do_projeto.md` para incluir `ipc/` se uma centralização parcial for intencional.

### Issue #5: Inconsistência na Localização dos Serviços e Handlers Principais do Projeto

- **Descrição**: A documentação (`02-estrutura_do_projeto.md`) afirma que a lógica principal de um contexto (ex: `project.service.ts`, `project.handlers.ts`, `projects.schema.ts`) deve residir na raiz do diretório do contexto (ex: `src/main/project/`). No entanto, esses arquivos estão atualmente localizados em `src/main/project/core/`.
- **Impacto**: Desvia da convenção de "Flat is Better than Nested" e da organização por domínio, adicionando um nível de aninhamento desnecessário para a lógica principal do contexto.
- **Referência da Arquitetura**:
  - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
- **Localização no Código**: `src/main/project/core/`
- **Checklist de Correção**:
  - [x] Mover `src/main/project/core/project.service.ts` para `src/main/project/project.service.ts`.
  - [x] Mover `src/main/project/core/project.handlers.ts` para `src/main/project/project.handlers.ts`.
  - [x] Mover `src/main/project/core/projects.schema.ts` para `src/main/project/projects.schema.ts`.
  - [x] Atualizar todos os imports e referências no código que apontam para a localização antiga.
  - [x] Remover o diretório `src/main/project/core/`.

### Issue #6: Inconsistência na Estrutura de Tipos Compartilhados (`src/shared/types/domains/`)

- **Descrição**: A documentação (`02-estrutura_do_projeto.md`) especifica que `src/shared/types/` deve conter "Definições de tipos TypeScript" de forma geral. No entanto, a implementação atual inclui um subdiretório `domains/` dentro de `types/`, que contém tipos específicos de domínio (e.g., `users/`, `projects/`, `llm/`, `agents/`). Isso contradiz a ideia de `shared` ser para código _genérico_ e não específico de domínio.
- **Impacto**: Viola o princípio de "Domain-Driven Organization" ao misturar tipos genéricos com tipos específicos de domínio em um diretório compartilhado, tornando a estrutura menos clara e potencialmente levando a dependências indesejadas.
- **Referência da Arquitetura**:
  - [2. Estrutura do Projeto - `shared/` - Código compartilhado (backend/frontend)](docs/architecture/new/02-estrutura-do-projeto.md#srcshared---código-compartilhado-backendfrontend)
- **Localização no Código**: `src/shared/types/domains/` (e todos os seus subdiretórios)
- **Checklist de Correção**:
  - [x] Avaliar se os tipos dentro de `src/shared/types/domains/` são realmente compartilhados entre `main` e `renderer`.
  - [x] Se forem, mover esses tipos diretamente para `src/shared/types/` (e.g., `src/shared/types/user.types.ts`, `src/shared/types/project.types.ts`).
  - [x] Se não forem estritamente compartilhados, considerar movê-los para os respectivos Bounded Contexts em `src/main/` ou `src/renderer/features/`.
  - [x] Atualizar todos os imports e referências no código.
  - [x] Remover o diretório `src/shared/types/domains/`.

### Issue #7: Componentes de Dashboard e Header em `src/renderer/app/project/$projectId/`

- **Descrição**: A documentação (`04-camada-frontend.md`) indica que `src/renderer/app/` deve conter as rotas da aplicação. No entanto, arquivos como `project-stats-grid.tsx`, `project-header.tsx`, `project-activity-grid.tsx` e `dashboard-cards.tsx` (sob `src/renderer/app/(user)/`) são componentes React que parecem ser parte da UI do dashboard ou do cabeçalho do projeto, e não rotas em si. Idealmente, esses componentes deveriam residir em um diretório de `components/` dentro de uma feature específica (e.g., `src/renderer/features/project/components/`).
- **Impacto**: Desvia da organização clara entre rotas e componentes, tornando a estrutura do `app/` menos coesa e potencialmente dificultando a reutilização e a manutenção dos componentes.
- **Referência da Arquitetura**:
  - [4. Camada Frontend (Renderer Process) - 1. Sistema de Roteamento (TanStack Router)](docs/architecture/new/04-camada-frontend.md#1-sistema-de-roteamento-tanstack-router)
  - [4. Camada Frontend (Renderer Process) - 2. Arquitetura de Features (Domain-Driven)](docs/architecture/new/04-camada-frontend.md#2-arquitetura-de-features-domain-driven)
- **Localização no Código**:
  - `src/renderer/app/project/$projectId/project-stats-grid.tsx`
  - `src/renderer/app/project/$projectId/project-header.tsx`
  - `src/renderer/app/project/$projectId/project-activity-grid.tsx`
  - `src/renderer/app/(user)/dashboard-cards.tsx`
- **Checklist de Correção**:
  - [x] Mover `project-stats-grid.tsx`, `project-header.tsx`, `project-activity-grid.tsx` para `src/renderer/features/project/components/`.
  - [x] Mover `dashboard-cards.tsx` para `src/renderer/features/user/components/` (ou um local apropriado para componentes de dashboard de usuário).
  - [x] Atualizar todos os imports e referências no código que apontam para as localizações antigas.
  - [x] Garantir que esses componentes sejam importados e utilizados pelas rotas apropriadas em `src/renderer/app/`.

### Issue #8: Componentes de Domínio em `src/renderer/components/`

- **Descrição**: A documentação (`04-camada-frontend.md`) especifica que `src/renderer/components/` deve conter "Componentes de UI que são puramente visuais e reutilizáveis em múltiplos domínios". No entanto, vários componentes encontrados neste diretório são específicos de domínio ou de feature, contendo lógica de negócio ou sendo fortemente acoplados a um contexto específico.
- **Impacto**: Viola o princípio de "Domain-Driven Organization" e a separação de responsabilidades, tornando o diretório `components/` menos genérico e mais difícil de manter e reutilizar.
- **Referência da Arquitetura**:
  - [4. Camada Frontend (Renderer Process) - 4. Componentes de UI Reutilizáveis](docs/architecture/new/04-camada-frontend.md#4-componentes-de-ui-reutilizáveis)
  - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
- **Localização no Código**:
  - `src/renderer/components/project-stats-grid.tsx`
  - `src/renderer/components/project-header.tsx`
  - `src/renderer/components/project-activity-grid.tsx`
  - `src/renderer/components/dashboard-cards.tsx`
  - `src/renderer/components/chat/` (todos os arquivos dentro deste diretório, e.g., `message-item.tsx`, `chat-input.tsx`)
  - `src/renderer/components/forms/project-form.tsx`
  - `src/renderer/components/forms/agent-form.tsx`
  - `src/renderer/components/markdown-renderer/` (todos os arquivos dentro deste diretório)
- **Checklist de Correção**:
  - [x] Mover os componentes específicos de `project` (e.g., `project-stats-grid.tsx`, `project-header.tsx`, `project-activity-grid.tsx`) para `src/renderer/features/project/components/`.
  - [x] Mover os componentes específicos de `user` (e.g., `dashboard-cards.tsx`) para `src/renderer/features/user/components/`.
  - [x] Mover os componentes de `chat` (e.g., `src/renderer/components/chat/`) para `src/renderer/features/conversations/components/`.
  - [x] Mover os componentes de `forms` específicos de domínio (e.g., `project-form.tsx`, `agent-form.tsx`) para seus respectivos diretórios de feature (e.g., `src/renderer/features/project/components/forms/`, `src/renderer/features/agents/components/forms/`).
  - [x] Avaliar os componentes em `src/renderer/components/markdown-renderer/`. Se eles contiverem lógica específica de domínio ou forem usados apenas em um contexto, movê-los para a feature apropriada. Caso contrário, garantir que sejam puramente visuais e genéricos.
  - [x] Atualizar todos os imports e referências no código que apontam para as localizações antigas.

### Issue #9: Stores de Domínio em `src/renderer/store/`

- **Descrição**: A documentação (`04-camada-frontend.md`) especifica que `src/renderer/store/` deve ser usado para "Stores globais" (estado global da UI). No entanto, `agent-store.ts` e `project-store.ts` são stores que parecem gerenciar estado específico de domínio, o que contradiz a recomendação de usar TanStack Query para estado de servidor e manter stores globais para UI genérica.
- **Impacto**: Viola o princípio de "Domain-Driven Organization" e a separação de responsabilidades, misturando estado global de UI com estado de domínio, o que pode levar a um gerenciamento de estado menos eficiente e mais complexo.
- **Referência da Arquitetura**:
  - [4. Camada Frontend (Renderer Process) - 3. Gerenciamento de Estado](docs/architecture/new/04-camada-frontend.md#3-gerenciamento-de-estado)
  - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
- **Localização no Código**:
  - `src/renderer/store/agent-store.ts`
  - `src/renderer/store/project-store.ts`
- **Checklist de Correção**:
  - [x] Avaliar se o estado gerenciado por `agent-store.ts` e `project-store.ts` pode ser migrado para o TanStack Query dentro das respectivas features (`src/renderer/features/agents/` e `src/renderer/features/project/`).
  - [x] Se um store global for estritamente necessário para esses domínios, considerar movê-los para dentro de seus respectivos diretórios de feature (e.g., `src/renderer/features/agents/store/agent-store.ts`).
  - [x] Atualizar todos os imports e referências no código.

---

## Conclusão

Esta análise detalhada revelou diversas inconsistências entre a arquitetura documentada e a implementação atual do Project Wiz. As issues identificadas abrangem desde a estrutura de diretórios e a organização de módulos até a localização de componentes e o gerenciamento de estado.

**STATUS: TODAS AS ISSUES FORAM RESOLVIDAS ✅**

### Resumo das Correções Realizadas:

1. **✅ Issue #1**: Renomeado `src/renderer/domains/` para `src/renderer/features/` e atualizados todos os imports
2. **✅ Issue #2**: Movido `src/main/user/direct-messages/` para `src/main/conversations/direct-messages/`
3. **✅ Issue #3**: Removida duplicação de `logger.ts` e organizados utilitários em `src/main/utils/`
4. **✅ Issue #4**: Movidos handlers IPC centralizados para seus respectivos domínios
5. **✅ Issue #5**: Movidos arquivos de `src/main/project/core/` para `src/main/project/`
6. **✅ Issue #6**: Reorganizada estrutura de tipos compartilhados com princípio "flat is better than nested"
7. **✅ Issue #7**: Movidos componentes de dashboard/header para features apropriadas
8. **✅ Issue #8**: Movidos componentes específicos de domínio para features
9. **✅ Issue #9**: Reorganizados stores de domínio removendo duplicações

### Benefícios Alcançados:

- **Melhor Organização**: Estrutura mais clara e consistente com a documentação
- **Menos Duplicação**: Eliminação de arquivos duplicados e referências desnecessárias
- **Maior Coesão**: Componentes e lógica organizados por domínio
- **Facilidade de Manutenção**: Estrutura mais simples e navegável
- **Conformidade Arquitetural**: Alinhamento completo com os princípios estabelecidos

O codebase agora está totalmente alinhado com os princípios de design estabelecidos, garantindo maior clareza, manutenibilidade e escalabilidade do projeto.
