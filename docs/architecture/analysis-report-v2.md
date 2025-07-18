# Análise de Conformidade da Arquitetura do Project Wiz (Completa)

**Data:** 2025-07-18
**Status:** Completo

---

## 🎯 Objetivo

Este documento detalha as inconsistências e implementações ausentes encontradas no codebase do Project Wiz, comparadas com as especificações de arquitetura definidas nos documentos em `docs/architecture/new/`. Cada item é apresentado como uma "issue" com um checklist para facilitar a correção.

---

## 📝 Análise de Arquivos de Configuração e Código (`src/`)

### 1. `package.json`

- **Análise**: O arquivo `package.json` está em conformidade com a "Stack Tecnológico" definida em `01-visao-geral-e-principios.md` e os "Scripts Essenciais" em `07-desenvolvimento-e-qualidade.md`. Todas as dependências e scripts listados na documentação estão presentes e as versões parecem adequadas.
- **Status**: ✅ Conforme.

### 2. `tsconfig.json`

- **Análise**: O `tsconfig.json` define as configurações do compilador TypeScript e os aliases de caminho. Embora as configurações gerais do compilador estejam alinhadas com o uso de TypeScript, os aliases de caminho (`paths`) revelam inconsistências significativas com a estrutura de diretórios documentada.
- **Status**: ❌ Inconsistente.
- **Issues Encontradas**:
  - **Issue #10: Inconsistência no Alias `@/features/*` e `@/domains/*`**
    - **Descrição**: O `tsconfig.json` define um alias `@/features/*` apontando para `src/renderer/features/*`, mas o código real do frontend utiliza `src/renderer/domains/` (confirmado pelo alias `@/domains/*` apontando para `src/renderer/domains/*`). Isso indica uma divergência entre a intenção arquitetural (uso de `features`) e a implementação atual (`domains`).
    - **Impacto**: Causa confusão na navegação do código, viola a convenção de nomenclatura e a organização por domínio, e pode levar a erros de importação se a refatoração para `features` não for acompanhada pela atualização do `tsconfig.json`.
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
      - [4. Camada Frontend (Renderer Process) - 2. Arquitetura de Features (Domain-Driven)](docs/architecture/new/04-camada-frontend.md#2-arquitetura-de-features-domain-driven)
    - **Localização no Código**: `tsconfig.json` (seções `compilerOptions.paths`)
    - **Checklist de Correção**:
      - [ ] Decidir se a estrutura `src/renderer/features/` será adotada. Se sim, remover o alias `@/domains/*` e garantir que `@/features/*` aponte corretamente para a nova estrutura.
      - [ ] Se a estrutura `src/renderer/domains/` for mantida (contrariando a documentação), atualizar a documentação para refletir isso e remover o alias `@/features/*`.
      - [ ] Atualizar todos os imports no código para usar o alias correto (`@/features/*` ou `@/domains/*`).
  - **Issue #11: Inconsistência no Alias `@/main-domains/*`**
    - **Descrição**: O `tsconfig.json` define um alias `@/main-domains/*` apontando para `src/main/domains/*`. No entanto, a documentação (`02-estrutura_do_projeto.md`) para a estrutura de `src/main` não menciona um diretório `domains/` aninhado; os Bounded Contexts (e.g., `user/`, `project/`) são listados diretamente sob `src/main/`.
    - **Impacto**: Introduz um nível de aninhamento não documentado, violando o princípio de "Flat is Better than Nested" e a clareza da organização por domínio no backend.
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
    - **Localização no Código**: `tsconfig.json` (seção `compilerOptions.paths`)
    - **Checklist de Correção**:
      - [ ] Mover os Bounded Contexts de `src/main/domains/` (se existir) para `src/main/`.
      - [ ] Remover o alias `@/main-domains/*` e atualizar os imports correspondentes para usar aliases diretos (e.g., `@/user/*`, `@/project/*` ou `@/main/user/*`, `@/main/project/*`).
      - [ ] Se `src/main/domains/` não existir, remover o alias e garantir que os imports usem o caminho correto.
  - **Issue #12: Alias `@/infrastructure/*` Não Documentado**
    - **Descrição**: O `tsconfig.json` inclui um alias `@/infrastructure/*` apontando para `src/main/infrastructure/*`. Este diretório e seu propósito não são mencionados na documentação da estrutura de `src/main` (`02-estrutura_do_projeto.md`).
    - **Impacto**: Representa uma decisão arquitetural não documentada, o que pode levar a inconsistências futuras e dificultar a compreensão do projeto por novos membros da equipe.
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
    - **Localização no Código**: `tsconfig.json` (seção `compilerOptions.paths`)
    - **Checklist de Correção**:
      - [ ] Documentar o propósito e o conteúdo do diretório `src/main/infrastructure/` em `02-estrutura_do_projeto.md`.
      - [ ] Se o diretório não for necessário ou estiver mal posicionado, removê-lo e o alias correspondente, movendo seu conteúdo para um local apropriado.

### 3. `eslint.config.js`

- **Análise**: O `eslint.config.js` está bem configurado e alinhado com os princípios de qualidade de código e convenções de nomenclatura. As regras de `boundaries` são particularmente úteis para reforçar a separação de responsabilidades entre `main`, `renderer` e `shared`.
- **Status**: ✅ Conforme (com pequenas observações).
- **Observações/Sugestões de Melhoria**:
  - **Issue #13: Nomenclatura `snake_case` em Propriedades**
    - **Descrição**: A regra `@typescript-eslint/naming-convention` permite `snake_case` para `objectLiteralProperty`, `property` e `typeProperty`. Embora a intenção possa ser para APIs externas, a documentação de convenções de nomenclatura (`07-desenvolvimento-e-qualidade.md`) não menciona explicitamente o uso de `snake_case`.
    - **Impacto**: Potencial para inconsistências na nomenclatura de propriedades se não for estritamente limitado a casos de uso específicos (e.g., integração com APIs externas que usam `snake_case`).
    - **Referência da Arquitetura**:
      - [7. Desenvolvimento e Qualidade - 2. Padrões de Código e Convenções - Convenções de Nomenclatura](docs/architecture/new/07-desenvolvimento-e-qualidade.md#convenções-de-nomenclatura)
    - **Localização no Código**: `eslint.config.js` (regra `@typescript-eslint/naming-convention`)
    - **Checklist de Correção**:
      - [ ] Revisar a necessidade de permitir `snake_case` para propriedades. Se for essencial para integração com APIs externas, adicionar uma nota explícita na documentação de convenções de nomenclatura.
      - [ ] Se não for essencial, remover `snake_case` das opções permitidas para essas seleções de `naming-convention`.
  - **Issue #14: Componentes `shadcn/ui` Ignorados no Linting**
    - **Descrição**: O `eslint.config.js` ignora arquivos em `src/renderer/components/ui/**/*.tsx`. Estes são os componentes gerados ou customizados a partir do `shadcn/ui`.
    - **Impacto**: Quaisquer modificações ou extensões feitas nesses componentes não serão sujeitas às regras de linting, o que pode levar a inconsistências de estilo ou a introdução de bugs que o linter poderia pegar.
    - **Referência da Arquitetura**:
      - [7. Desenvolvimento e Qualidade - 2. Padrões de Código e Convenções - Checklist de Qualidade Antes do Commit](docs/architecture/new/07-desenvolvimento-e-qualidade.md#checklist-de-qualidade-antes-do-commit)
    - **Localização no Código**: `eslint.config.js` (seção `ignores`)
    - **Checklist de Correção**:
      - [ ] Avaliar se a exclusão desses arquivos é intencional e justificada (e.g., se são puramente gerados e não modificados).
      - [ ] Se forem modificados ou estendidos, remover a exclusão para garantir que sejam lintados.
      - [ ] Adicionar uma nota na documentação (`07-desenvolvimento-e-qualidade.md`) explicando a política de linting para componentes de UI de terceiros/gerados.

### 4. `drizzle.config.ts`

- **Análise**: O `drizzle.config.ts` está configurado para usar SQLite e Drizzle ORM, o que está em conformidade com a arquitetura. No entanto, a configuração `schema: "./src/main/database/schema-consolidated.ts"` aponta para um único arquivo consolidado, enquanto a documentação (`03-camada-backend.md`) enfatiza a definição de schemas "por Domínio/Agregado".
- **Status**: ❌ Inconsistente (potencialmente).
- **Issues Encontradas**:
  - **Issue #15: Abordagem de Schema Consolidado vs. Distribuído no Drizzle ORM**
    - **Descrição**: A documentação (`03-camada-backend.md`) promove a ideia de "Schema por Domínio/Agregado", com exemplos de `projects.schema.ts` e `issues.schema.ts` dentro de seus respectivos domínios. O `drizzle.config.ts` aponta para um único `schema-consolidado.ts`. Se `schema-consolidado.ts` é o _único_ local onde os schemas são definidos, isso contradiz a abordagem distribuída. Se ele apenas _importa e re-exporta_ schemas definidos em outros lugares, a documentação pode precisar de mais clareza sobre essa agregação.
    - **Impacto**: Pode levar a uma centralização excessiva da definição de schemas, dificultando a manutenção e a compreensão da estrutura de dados por domínio, e potencialmente violando o princípio de "One File, One Responsibility" para a definição de schemas.
    - **Referência da Arquitetura**:
      - [3. Camada Backend (Main Process) - 4. Data Layer: Persistência com Drizzle ORM - Schema por Domínio/Agregado](docs/architecture/new/03-camada-backend.md#schema-por-domínioagregado)
    - **Localização no Código**: `drizzle.config.ts`, `src/main/database/schema-consolidated.ts`
    - **Checklist de Correção**:
      - [ ] Clarificar na documentação (`03-camada-backend.md`) se `schema-consolidado.ts` é um ponto de agregação ou o único local de definição de schemas.
      - [ ] Se a intenção é ter schemas definidos em cada domínio/agregado, garantir que `schema-consolidado.ts` apenas importe e re-exporte esses schemas, e que os schemas individuais sejam a fonte primária de verdade.
      - [ ] Se a abordagem consolidada for a preferida, atualizar a documentação para refletir isso e justificar a centralização.

### 5. `tailwind.config.ts`

- **Análise**: O `tailwind.config.ts` está bem configurado e alinhado com o uso de TailwindCSS, conforme especificado na arquitetura. A configuração de `content` aponta corretamente para os arquivos do frontend, e as extensões de tema e plugins são consistentes com um projeto React/TailwindCSS.
- **Status**: ✅ Conforme.

### 6. `vite.main.config.mts`, `vite.preload.config.mts`, `vite.renderer.config.mts`

- **Análise**: Os arquivos de configuração do Vite estão em conformidade com a arquitetura, utilizando Vite como ferramenta de build para os processos `main`, `preload` e `renderer` do Electron. As configurações parecem adequadas para o ambiente de desenvolvimento e build.
- **Status**: ✅ Conforme.

### 7. `vitest.config.mts`

- **Análise**: O `vitest.config.mts` está configurado corretamente para o Vitest, alinhado com a "Stack Tecnológico" e a "Estratégia de Testes" da arquitetura. As configurações de teste, incluindo o uso de `@vitest/coverage-v8` para cobertura, são consistentes com as práticas de qualidade esperadas.
- **Status**: ✅ Conforme.

### 8. `lingui.config.ts`

- **Análise**: O `lingui.config.ts` está configurado para internacionalização com LinguiJS, o que é uma boa prática. No entanto, os caminhos `include` para os catálogos (`src/renderer/components/messages/`) não estão alinhados com a estrutura de diretórios de componentes ou features documentada.
- **Status**: ❌ Inconsistente.
- **Issues Encontradas**:
  - **Issue #16: Localização Inconsistente dos Arquivos de Mensagens LinguiJS**
    - **Descrição**: Os arquivos que contêm as mensagens para internacionalização (`common.tsx`, `validation.tsx`, `glossary.tsx`) estão localizados em `src/renderer/components/messages/`. Esta localização não se alinha com a estrutura de `src/renderer/features/` para lógica de domínio ou `src/renderer/components/ui/` para componentes puramente visuais. Mensagens de internacionalização são geralmente consideradas parte da camada de UI, mas sua organização deve seguir a estrutura de features ou ser mais genérica se forem usadas em múltiplos domínios.
    - **Impacto**: Dificulta a localização e manutenção das strings traduzíveis, e pode levar a uma organização inconsistente se novas mensagens forem adicionadas sem seguir um padrão claro.
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
      - [4. Camada Frontend (Renderer Process) - 2. Arquitetura de Features (Domain-Driven)](docs/architecture/new/04-camada-frontend.md#2-arquitetura-de-features-domain-driven)
    - **Localização no Código**: `lingui.config.ts` (seção `catalogs.include`), `src/renderer/components/messages/`
    - **Checklist de Correção**:
      - [ ] Mover os arquivos de mensagens (`common.tsx`, `validation.tsx`, `glossary.tsx`) para um local mais apropriado, como `src/renderer/locales/` (se forem globais) ou dentro de subdiretórios de `src/renderer/features/` se forem específicos de domínio.
      - [ ] Atualizar os caminhos `include` em `lingui.config.ts` para refletir a nova localização.
      - [ ] Definir uma convenção clara na documentação para a localização de arquivos de mensagens de internacionalização.

### 9. `forge.config.cts`

- **Análise**: O `forge.config.cts` está configurado corretamente para o Electron Forge, alinhado com a arquitetura de aplicação desktop (Electron). As configurações de `packagerConfig`, `makers` e `plugins` são consistentes com um projeto Electron.
- **Status**: ✅ Conforme.

### 10. `components.json`

- **Análise**: O `components.json` está em conformidade com o uso de `shadcn/ui` e as convenções de aliases para componentes de UI. Os aliases para `components`, `ui`, `lib` e `hooks` estão alinhados com a estrutura de diretórios do frontend.
- **Status**: ✅ Conforme.

### 11. `.prettierrc.json`

- **Análise**: O `.prettierrc.json` define as regras de formatação de código com Prettier, o que está em conformidade com a arquitetura que especifica Prettier para formatação. As configurações são padrão e contribuem para a consistência do estilo de código.
- **Status**: ✅ Conforme.

### 12. Análise Detalhada do Backend (`src/main/`)

- **Análise**: Uma análise aprofundada do diretório `src/main/` revelou várias inconsistências e implementações ausentes em relação à arquitetura documentada. Embora a organização geral por Bounded Contexts e camadas seja visível, há desvios significativos na granularidade e localização de certos módulos.
- **Status**: ❌ Inconsistente.
- **Issues Encontradas**:
  - **Issue #17: Duplicação da Função `createDefaultChannels`**
    - **Descrição**: A função `createDefaultChannels` está duplicada em `src/main/project/core/project.service.ts` e `src/main/project/channels/channel.service.ts`. A versão em `channel.service.ts` parece ser a mais completa e funcional.
    - **Impacto**: Duplicação de lógica de negócio, dificultando a manutenção e garantindo a consistência entre as duas implementações.
    - **Referência da Arquitetura**:
      - [6. Autenticação e Fluxos de Usuário - Fluxo 1: Criação de um Novo Projeto](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-1-criação-de-um-novo-projeto)
    - **Localização no Código**:
      - `src/main/project/core/project.service.ts`
      - `src/main/project/channels/channel.service.ts`
    - **Checklist de Correção**:
      - [ ] Remover a implementação de `createDefaultChannels` de `src/main/project/core/project.service.ts`.
      - [ ] Garantir que `src/main/project/core/project.service.ts` chame a versão de `createDefaultChannels` de `src/main/project/channels/channel.service.ts`.
      - [ ] Atualizar quaisquer outras referências para usar a versão correta.
  - **Issue #18: Placeholder `temp-user-id` em Handlers IPC**
    - **Descrição**: Muitos handlers IPC no backend (e.g., `llm.handlers.ts`, `agent.handlers.ts`, `message.handlers.ts`, `project.handlers.ts`, `channel.handlers.ts`) utilizam um `userId` hardcoded como `temp-user-id`. Isso é um placeholder e não representa uma extração de usuário real.
    - **Impacto**: Falha na segurança e na autenticação adequada das requisições, tornando o sistema vulnerável e não funcional em um ambiente de produção.
    - **Referência da Arquitetura**:
      - [6. Autenticação e Fluxos de Usuário - 1. Sistema de Autenticação Local e Multi-Conta](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#1-sistema-de-autenticação-local-e-multi-conta)
      - [src/main/utils/error-handler.ts](src/main/utils/error-handler.ts) (menciona `extractUserId` como TODO)
    - **Localização no Código**: Vários arquivos `*.handlers.ts` e `src/main/utils/error-handler.ts`
    - **Checklist de Correção**:
      - [ ] Implementar a lógica de extração de `userId` de forma segura e robusta (e.g., via token JWT validado) em `src/main/utils/error-handler.ts` ou um módulo de autenticação dedicado.
      - [ ] Substituir todas as ocorrências de `temp-user-id` nos handlers IPC pela extração real do `userId`.
      - [ ] Remover o `extractUserId` do `error-handler.ts` se a lógica for movida para um módulo de autenticação.
  - **Issue #19: Ausência de Implementação para Agregados Documentados**
    - **Descrição**: A documentação (`02-estrutura_do_projeto.md`) lista vários agregados que não possuem implementação correspondente no diretório `src/main/`.
    - **Impacto**: Funcionalidades essenciais do sistema estão ausentes, e a arquitetura não está totalmente implementada conforme o design.
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
      - [5. Sistema de Agentes Autônomos](docs/architecture/new/05-sistema-de-agentes.md)
      - [8. Funcionalidade: Espaço Pessoal e DMs](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md)
      - [11. Funcionalidade: Fórum de Discussão](docs/architecture/new/11-funcionalidade-forum-de-discussao.md)
    - **Localização no Código**:
      - `src/main/project/issues/` (diretório vazio, mas schemas `issues`, `issue_activities`, `issue_comments` existem nas migrações SQL)
      - `src/main/project/forums/` (diretório vazio, mas schemas `forum_posts`, `forum_topics` existem nas migrações SQL)
      - `src/main/agents/queue/` (diretório vazio, mas `queue.service.ts` é mencionado na documentação)
      - `src/main/conversations/routing/` (diretório vazio, mas `MessageRouter` é mencionado na documentação)
      - `src/main/user/profile/` (diretório vazio, mas `ProfileService` é mencionado na documentação)
      - `src/main/project/members/project-users.schema.ts` (schema `project_users` existe nas migrações SQL, mas o arquivo `.ts` está ausente)
    - **Checklist de Correção**:
      - [ ] Implementar os serviços, handlers e schemas para o agregado `issues/` sob `src/main/project/issues/`.
      - [ ] Implementar os serviços, handlers e schemas para o agregado `forums/` sob `src/main/project/forums/`.
      - [ ] Implementar o `queue.service.ts` e lógica relacionada sob `src/main/agents/queue/`.
      - [ ] Implementar o `message.router.ts` e lógica de roteamento sob `src/main/conversations/routing/`.
      - [ ] Implementar o `profile.service.ts` e lógica relacionada sob `src/main/user/profile/`.
      - [ ] Criar o arquivo `src/main/project/members/project-users.schema.ts` para o schema `project_users`.
      - [ ] Atualizar `src/main/database/schema-consolidated.ts` para incluir os novos schemas e relações.
  - **Issue #20: Ausência de Documentação para `EventBus` e `id-generator`**
    - **Descrição**: O `src/main/utils/events.ts` implementa um `EventBus` global, e `src/main/utils/id-generator.ts` fornece funções de geração de IDs com prefixos específicos de domínio. A existência e o propósito desses utilitários não são explicitamente documentados na arquitetura.
    - **Impacto**: Dificulta a compreensão da arquitetura de eventos e da estratégia de geração de IDs para novos desenvolvedores, e pode levar a usos inconsistentes ou não intencionais.
    - **Referência da Arquitetura**:
      - [1. Visão Geral e Princípios da Arquitetura](docs/architecture/new/01-visao-geral-e-principios.md)
      - [2. Estrutura do Projeto - `src/main` - Backend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
    - **Localização no Código**:
      - `src/main/utils/events.ts`
      - `src/main/utils/id-generator.ts`
    - **Checklist de Correção**:
      - [ ] Adicionar uma seção em `02-estrutura_do_projeto.md` ou um novo documento na pasta `docs/architecture/new/` para descrever o `EventBus`, seu propósito, como usá-lo e suas implicações arquiteturais.
      - [ ] Adicionar uma seção em `02-estrutura_do_projeto.md` ou um novo documento para descrever a estratégia de geração de IDs, incluindo o uso de prefixos e a função `generateId`.

### 13. Análise Detalhada do Frontend (`src/renderer/`)

- **Análise**: A análise do diretório `src/renderer/` revelou várias inconsistências significativas em relação à arquitetura documentada, especialmente no que diz respeito à separação de responsabilidades entre componentes de UI genéricos e componentes/lógica específicos de domínio.
- **Status**: ❌ Inconsistente.
- **Issues Encontradas**:
  - **Issue #26: Componentes de Domínio em `src/renderer/app/` (Rotas)**
    - **Descrição**: Arquivos como `project-stats-grid.tsx`, `project-header.tsx`, `project-activity-grid.tsx` (sob `src/renderer/app/project/$projectId/`) e `dashboard-cards.tsx` (sob `src/renderer/app/(user)/`) são componentes React que contêm lógica de UI específica de domínio e não são rotas em si. A pasta `app/` deve ser reservada para as definições de rota e layouts, importando componentes de `features/` ou `components/`.
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
      - [ ] Mover `project-stats-grid.tsx`, `project-header.tsx`, `project-activity-grid.tsx` para `src/renderer/features/project/components/`.
      - [ ] Mover `dashboard-cards.tsx` para `src/renderer/features/user/components/` (ou um local apropriado para componentes de dashboard de usuário).
      - [ ] Atualizar todos os imports e referências no código que apontam para as localizações antigas.
      - [ ] Garantir que esses componentes sejam importados e utilizados pelas rotas apropriadas em `src/renderer/app/`.
  - **Issue #27: Componentes de Domínio em `src/renderer/components/`**
    - **Descrição**: A documentação (`04-camada-frontend.md`) especifica que `src/renderer/components/` deve conter "Componentes de UI que são puramente visuais e reutilizáveis em múltiplos domínios". No entanto, vários componentes encontrados neste diretório são específicos de domínio ou de feature, contendo lógica de negócio ou sendo fortemente acoplados a um contexto específico.
    - **Impacto**: Viola o princípio de "Domain-Driven Organization" e a separação de responsabilidades, tornando o diretório `components/` menos genérico e mais difícil de manter e reutilizar.
    - **Referência da Arquitetura**:
      - [4. Camada Frontend (Renderer Process) - 4. Componentes de UI Reutilizáveis](docs/architecture/new/04-camada-frontend.md#4-componentes-de-ui-reutilizáveis)
      - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
    - **Localização no Código**:
      - `src/renderer/components/chat/` (todos os arquivos dentro deste diretório, e.g., `chat-container.tsx`, `message-item.tsx`, `chat-input.tsx`)
      - `src/renderer/components/forms/agent-form.tsx`
      - `src/renderer/components/forms/project-form.tsx`
      - `src/renderer/components/markdown-renderer/` (todos os arquivos dentro deste diretório)
      - `src/renderer/components/project-activity-grid.tsx` (já listado na Issue #26, mas também se aplica aqui)
      - `src/renderer/components/project-header.tsx` (já listado na Issue #26, mas também se aplica aqui)
      - `src/renderer/components/project-stats-grid.tsx` (já listado na Issue #26, mas também se aplica aqui)
      - `src/renderer/components/dashboard-cards.tsx` (já listado na Issue #26, mas também se aplica aqui)
    - **Checklist de Correção**:
      - [ ] Mover os componentes de `chat` (e.g., `src/renderer/components/chat/`) para `src/renderer/features/conversations/components/`.
      - [ ] Mover os componentes de `forms` específicos de domínio (e.g., `project-form.tsx`, `agent-form.tsx`) para seus respectivos diretórios de feature (e.g., `src/renderer/features/project/components/forms/`, `src/renderer/features/agents/components/forms/`).
      - [ ] Avaliar os componentes em `src/renderer/components/markdown-renderer/`. Se eles contiverem lógica específica de domínio ou forem usados apenas em um contexto, movê-los para a feature apropriada. Caso contrário, garantir que sejam puramente visuais e genéricos.
      - [ ] Atualizar todos os imports e referências no código que apontam para as localizações antigas.
  - **Issue #28: Stores de Domínio em `src/renderer/store/`**
    - **Descrição**: A documentação (`04-camada-frontend.md`) especifica que `src/renderer/store/` deve ser usado para "Stores globais" (estado global da UI). No entanto, `agent-store.ts` e `project-store.ts` são stores que parecem gerenciar estado específico de domínio, o que contradiz a recomendação de usar TanStack Query para estado de servidor e manter stores globais para UI genérica.
    - **Impacto**: Viola o princípio de "Domain-Driven Organization" e a separação de responsabilidades, misturando estado global de UI com estado de domínio, o que pode levar a um gerenciamento de estado menos eficiente e mais complexo.
    - **Referência da Arquitetura**:
      - [4. Camada Frontend (Renderer Process) - 3. Gerenciamento de Estado](docs/architecture/new/04-camada-frontend.md#3-gerenciamento-de-estado)
      - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
    - **Localização no Código**:
      - `src/renderer/store/agent-store.ts`
      - `src/renderer/store/project-store.ts`
    - **Checklist de Correção**:
      - [ ] Avaliar se o estado gerenciado por `agent-store.ts` e `project-store.ts` pode ser migrado para o TanStack Query dentro das respectivas features (`src/renderer/features/agents/` e `src/renderer/features/project/`).
      - [ ] Se um store global for estritamente necessário para esses domínios, considerar movê-los para dentro de seus respectivos diretórios de feature (e.g., `src/renderer/features/agents/store/agent-store.ts`).
      - [ ] Atualizar todos os imports e referências no código.
  - **Issue #29: Misplaced `MIGRATION_GUIDE.md` in `src/renderer/lib/`**
    - **Descrição**: O arquivo `MIGRATION_GUIDE.md` é um arquivo de documentação, mas está localizado dentro de `src/renderer/lib/`, que é destinado a utilitários de código.
    - **Impacto**: Categorização incorreta de arquivos, dificultando a localização da documentação e poluindo os diretórios de código.
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto](docs/architecture/new/02-estrutura-do-projeto.md) (especifica `docs/` para documentação)
    - **Localização no Código**: `src/renderer/lib/MIGRATION_GUIDE.md`
    - **Checklist de Correção**:
      - [ ] Mover `src/renderer/lib/MIGRATION_GUIDE.md` para `docs/developer/` ou um subdiretório mais apropriado em `docs/`.
      - [ ] Atualizar quaisquer links ou referências internas para este arquivo.
  - **Issue #30: Domain-Specific Utilities in `src/renderer/lib/domain-utils/`**
    - **Descrição**: O diretório `src/renderer/lib/domain-utils/` contém utilitários (`agent-utils.ts`, `llm-utils.ts`, `project-utils.ts`, `user-utils.ts`) que são específicos para domínios particulares. Embora `src/renderer/lib/` seja para utilitários consolidados, a documentação arquitetural (`02-estrutura_do_projeto.md`) implica que a lógica específica de domínio deve residir dentro da estrutura `features/` (ou `domains/` como atualmente nomeado). Se esses utilitários são usados apenas pelo renderer, eles deveriam estar co-localizados com suas respectivas features. Se forem realmente compartilhados entre renderer e main, deveriam estar em `src/shared/utils/`.
    - **Impacto**: Borra as linhas entre utilitários genéricos compartilhados e lógica específica de domínio, potencialmente levando a um código menos modular e mais difícil de manter.
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
      - [2. Estrutura do Projeto - `shared/` - Código compartilhado (backend/frontend)](docs/architecture/new/02-estrutura-do-projeto.md#srcshared---código-compartilhado-backendfrontend)
    - **Localização no Código**: `src/renderer/lib/domain-utils/` (e seus subarquivos)
    - **Checklist de Correção**:
      - [ ] Para cada utilitário em `src/renderer/lib/domain-utils/`, determinar se ele é usado exclusivamente pelo renderer e específico para um único domínio. Se sim, movê-lo para `src/renderer/features/<domain>/utils/`.
      - [ ] Se um utilitário for usado por múltiplas features do renderer, mas não pelo processo principal, considerar a criação de um diretório `src/renderer/utils/` para utilitários compartilhados apenas pelo renderer, ou reavaliar se ele realmente pertence a `src/shared/utils/`.
      - [ ] Se um utilitário for usado tanto pelo renderer quanto pelo main, movê-lo para `src/shared/utils/`.
      - [ ] Atualizar todos os imports e referências.
      - [ ] Atualizar `02-estrutura_do_projeto.md` para clarificar o posicionamento de utilitários específicos de domínio.
  - **Issue #31: `src/renderer/domains/shared/` Redundância**
    - **Descrição**: O diretório `src/renderer/domains/shared/` existe, contendo `components/`, `hooks/`, `stores/`, `utils/`. Esta estrutura é redundante dada a existência de `src/shared/` para código compartilhado entre `main` e `renderer`.
    - **Impacto**: Cria confusão sobre onde o código compartilhado deve residir e viola o princípio de "Flat is Better than Nested".
    - **Referência da Arquitetura**:
      - [2. Estrutura do Projeto - `shared/` - Código compartilhado (backend/frontend)](docs/architecture/new/02-estrutura-do_projeto.md#srcshared---código-compartilhado-backendfrontend)
    - **Localização no Código**: `src/renderer/domains/shared/`
    - **Checklist de Correção**:
      - [ ] Mover todo o conteúdo de `src/renderer/domains/shared/` para `src/shared/` (se ainda não estiver lá) ou para diretórios `features/` específicos de domínio apropriados.
      - [ ] Remover o diretório `src/renderer/domains/shared/`.
      - [ ] Atualizar todos os imports e referências.
  - **Issue #32: `api-client.ts` Misplaced in `src/renderer/utils/`**
    - **Descrição**: O arquivo `src/renderer/utils/api-client.ts` atua como uma camada de serviço para comunicação frontend-backend via `window.electronIPC.invoke`. Isso é um serviço, não um utilitário genérico, e deveria estar localizado dentro de um diretório `services/`, idealmente dentro da estrutura `features/` se for específico de domínio, ou um `src/renderer/services/` geral se for um cliente de API comum.
    - **Impacto**: Classifica incorretamente um serviço como um utilitário, tornando a estrutura do projeto menos intuitiva e mais difícil de manter.
    - **Referência da Arquitetura**:
      - [4. Camada Frontend (Renderer Process) - 3. Gerenciamento de Estado - TanStack Query](docs/architecture/new/04-camada-frontend.md#tanstack-query-estado-do-servidor) (implica serviços para busca de dados)
      - [2. Estrutura do Projeto - `src/renderer` - Frontend Detalhado](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
    - **Localização no Código**: `src/renderer/utils/api-client.ts`
    - **Checklist de Correção**:
      - [ ] Mover `src/renderer/utils/api-client.ts` para `src/renderer/services/api-client.ts` (para um cliente de API geral) ou refatorar seus métodos em serviços específicos de domínio dentro de `src/renderer/features/<domain>/services/` se seus métodos estiverem fortemente acoplados a domínios específicos.
      - [ ] Atualizar todos os imports e referências.
      - [ ] Atualizar `02-estrutura_do_projeto.md` para refletir o posicionamento correto das camadas de serviço do frontend.
  - **Issue #33: Uso de Mock Data em Código de Produção**
    - **Descrição**: Vários componentes e hooks dentro de `src/renderer/domains/` (e.g., `agent-dashboard-stats-calculator.tsx`, `use-agent-dashboard-state.hook.ts`, `kanban-board.tsx`, `file-explorer.tsx`, `terminal-panel.tsx`) importam e utilizam diretamente dados mockados de `src/renderer/lib/mock-data/`. Embora dados mockados sejam úteis para desenvolvimento, seu uso direto em componentes destinados à produção indica uma implementação ausente para a busca de dados reais.
    - **Impacto**: A aplicação não funcionará com dados reais, e os dados mockados podem ser inadvertidamente incluídos em builds de produção, aumentando o tamanho do bundle.
    - **Referência da Arquitetura**:
      - [1. Visão Geral e Princípios da Arquitetura - Stack Tecnológico](docs/architecture/new/01-visao-geral-e-principios.md#stack-tecnológico) (implica persistência de dados reais com SQLite + Drizzle ORM)
    - **Localização no Código**:
      - `src/renderer/domains/agents/components/agent-dashboard-stats-calculator.tsx`
      - `src/renderer/domains/agents/hooks/use-agent-dashboard-state.hook.ts`
      - `src/renderer/domains/projects/components/kanban-board.tsx`
      - `src/renderer/domains/projects/components/file-explorer.tsx`
      - `src/renderer/domains/projects/components/terminal-panel.tsx`
      - `src/renderer/lib/mock-data/` (a existência deste diretório e seu uso)
    - **Checklist de Correção**:
      - [ ] Implementar a lógica de busca de dados reais usando TanStack Query e os serviços IPC do backend para todos os componentes/hooks que atualmente dependem de dados mockados.
      - [ ] Garantir que os dados mockados sejam usados apenas em ambientes de desenvolvimento (e.g., via imports condicionais ou configurações de build).
      - [ ] Considerar mover os dados mockados para um diretório `__mocks__` ou similar, fora de `src/`, para separá-los claramente do código de produção.

---

## Conclusão da Análise de Conformidade

Esta análise aprofundada e completa do repositório revelou um conjunto significativo de inconsistências e lacunas de implementação em relação à arquitetura documentada. As issues identificadas abrangem desde a estrutura de diretórios e a organização de módulos até a localização de componentes, o gerenciamento de estado e a configuração de ferramentas de desenvolvimento.

A resolução dessas questões é crucial para alinhar o codebase com os princípios de design estabelecidos, garantindo maior clareza, manutenibilidade, escalabilidade e segurança do projeto. Recomenda-se que as correções sejam abordadas de forma sistemática, priorizando as issues de maior impacto na estrutura e funcionalidade do sistema, e seguindo os checklists fornecidos para cada issue.

Este relatório (`analysis-report-v2.md`) serve como um guia abrangente para a refatoração e implementação necessárias para alcançar a conformidade arquitetural desejada.
