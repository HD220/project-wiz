# Checklist de Implementação - Project Wiz Refatoração

Este documento serve como um checklist detalhado para a implementação das diretrizes arquiteturais e de refatoração definidas no `PROPOSAL.md`. Ele será atualizado e gerenciado conforme o progresso das tarefas.

---

## Fase 1: Fundações do Backend (Maior Impacto no Boilerplate)

### Objetivo:

Eliminar o boilerplate e padronizar as operações de persistência e a comunicação IPC no Processo Principal.

### Tarefas:

#### 1.1. Implementar `BaseRepository` Genérico

- [x] Criar o arquivo `src/main/persistence/base.repository.ts`.
- [x] Implementar a classe abstrata `BaseRepository` com métodos `findById`, `save`, `findAll`, `delete`.
- [x] Garantir que `mapToDomainEntity` seja um método abstrato protegido.
- [x] Adicionar aliases de importação no `tsconfig.json` para `@persistence`.

#### 1.2. Refatorar Repositórios Existentes

- [x] Identificar todos os repositórios existentes (ex: `drizzle-project.repository.ts`, `drizzle-user-settings.repository.ts`).
- [x] Para cada repositório:
  - [x] Estender `BaseRepository`.
  - [x] Remover a implementação duplicada dos métodos CRUD.
  - [x] Implementar `mapToDomainEntity` para o mapeamento específico da entidade.
  - [x] Atualizar importações para usar aliases.

#### 1.3. Implementar Factory `createIpcHandler`

- [x] Criar o arquivo `src/main/kernel/ipc-handler-utility.ts`.
- [x] Implementar a função `createIpcHandler` que encapsula `ipcMain.handle`, `try/catch`, despacho para `CqrsDispatcher` e formatação de resposta.
- [x] Adicionar aliases de importação no `tsconfig.json` para `@kernel`.

#### 1.4. Refatorar IPC Handlers Existentes

- [x] Identificar todos os arquivos de IPC Handlers (ex: `src/main/modules/*/ipc-handlers/*.ipc-handlers.ts`).
- [x] Refatorar `src/main/modules/project-management/index.ts` para usar `createIpcHandler`.
- [x] Refatorar `src/main/modules/automatic-persona-hiring/index.ts` para usar `createIpcHandler`.
- [x] Refatorar `src/main/modules/code-analysis/index.ts` para usar `createIpcHandler`.
- [x] Refatorar `src/main/modules/direct-messages/index.ts` para usar `createIpcHandler`.
- [x] Refatorar `src/main/modules/filesystem-tools/application/ipc-handlers.ts` para usar `createIpcHandler`.
  - [x] Refatorar `handleListDirectory`.
  - [x] Refatorar `handleReadFile`.
  - [x] Refatorar `handleSearchFileContent`.
  - [x] Refatorar `handleWriteFile`.
  - [x] Consolidar chamadas em `registerFilesystemHandlers`.
- [x] Refatorar `src/main/modules/forum/index.ts` para usar `createIpcHandler`.
  - [x] Refatorar `handleForumCreateTopic`.
  - [x] Refatorar `handleForumListTopics`.
  - [x] Refatorar `handleForumListPosts`.
  - [x] Refatorar `handleForumCreatePost`.
  - [x] Consolidar chamadas `createIpcHandler` em `registerForumModule` e remover as funções `handleForumX` individuais.
- [x] Refatorar `src/main/modules/git-integration/application/ipc-handlers.ts` para usar `createIpcHandler`.
  - [x] Refatorar `GIT_INTEGRATION_CLONE` handler.
  - [x] Refatorar `GIT_INTEGRATION_INITIALIZE` handler.
  - [x] Refatorar `GIT_INTEGRATION_PULL` handler.
- [x] Refatorar `src/main/modules/llm-integration/index.ts` para usar `createIpcHandler`.
  - [x] Refatorar `handleLlmConfigSave`.
  - [x] Refatorar `handleLlmConfigGet`.
  - [x] Refatorar `handleLlmConfigList`.
  - [x] Refatorar `handleLlmConfigRemove`.
  - [x] Consolidar chamadas em `registerLlmIntegrationModule`.
- [x] Refatorar `src/main/modules/persona-management/index.ts` para usar `createIpcHandler`.
  - [x] Refatorar `handlePersonaRefineSuggestion`.
  - [x] Refatorar `handlePersonaCreate`.
  - [x] Refatorar `handlePersonaList`.
  - [x] Refatorar `handlePersonaRemove`.
  - [x] Consolidar chamadas em `registerPersonaManagementModule`.
- [x] Refatorar `src/main/modules/user-settings/index.ts` para usar `createIpcHandler`.
  - [x] Refatorar `USER_SETTINGS_SAVE` handler.
  - [x] Refatorar `USER_SETTINGS_GET` handler.
  - [x] Refatorar `USER_SETTINGS_LIST` handler.

---

## Fase 2: Experiência do Frontend

### Objetivo:

Simplificar o gerenciamento de estado assíncrono e a interação com o backend nos componentes React.

### Tarefas:

#### 2.1. Criar Hooks `useIpcQuery` e `useIpcMutation`

- [x] Criar o arquivo `src/renderer/hooks/use-ipc-query.hook.ts`.
- [x] Implementar `useIpcQuery` utilizando `@tanstack/react-query` para chamadas de leitura.
- [x] Criar o arquivo `src/renderer/hooks/use-ipc-mutation.hook.ts`.
- [x] Implementar `useIpcMutation` utilizando `@tanstack/react-query` para chamadas de escrita.
- [x] Garantir que ambos os hooks gerenciem `isLoading`, `isError`, `data` e `error` automaticamente.
- [x] Adicionar aliases de importação no `tsconfig.json` para `@renderer`.

#### 2.2. Refatorar Componentes da UI para Usar os Novos Hooks

- [x] Identificar componentes da UI que interagem diretamente com `window.electronIPC.invoke`.
- [x] Para cada componente:
  - [x] Substituir chamadas diretas por `useIpcQuery` ou `useIpcMutation`.
  - [x] Remover lógica manual de `useState` para `loading`, `error`, `data`.
  - [x] Atualizar importações para usar aliases e tipos nomeados.

##### 2.2.1. Refatorar `src/renderer/features/direct-messages/components/chat-window.tsx`

- [x] Refatorar listagem de mensagens para usar `useIpcQuery`.
- [x] Refatorar envio de mensagens para usar `useIpcMutation`.

##### 2.2.2. Refatorar `src/renderer/features/persona-creation-wizard/hooks/use-persona-submission.ts`

- [x] Refatorar `PERSONA_REFINE_SUGGESTION` para usar `useIpcMutation`.
- [x] Refatorar `PERSONA_CREATE` para usar `useIpcMutation`.
- [x] Remover lógica manual de `try-catch` e `onFinally`.

##### 2.2.3. Refatorar `src/renderer/features/project-management/components/create-project-modal.tsx`

- [x] Refatorar `PROJECT_CREATE` para usar `useIpcMutation`.
- [x] Remover lógica manual de `useState` para `loading` e `error`.
- [x] Remover lógica manual de `try-catch`.

##### 2.2.4. Refatorar `src/renderer/features/project-management/components/project-sidebar.tsx`

- [x] Refatorar listagem de projetos para usar `useIpcQuery`.
- [x] Refatorar remoção de projetos para usar `useIpcMutation`.
- [x] Remover lógica manual de `useState` para `loading` e `error`.
- [x] Remover lógica manual de `try-catch`.

##### 2.2.5. Refatorar `src/renderer/hooks/use-forum.ts`

- [x] Refatorar `loadTopicsHelper` para usar `useIpcQuery`.
- [x] Refatorar `createTopicHelper` para usar `useIpcMutation`.
- [x] Refatorar `createPostHelper` para usar `useIpcMutation`.
- [x] Refatorar `getPostsForTopicHelper` para usar `useIpcQuery`.
- [x] Integrar os novos hooks diretamente no `useForum` e remover as funções auxiliares.
- [x] Remover lógica manual de `useState` para `loading`, `error` e `topics`.
- [x] Remover lógica manual de `try-catch`.

---

## Fase 3: Arquitetura e Automação

### Objetivo:

Desacoplar os módulos do `bootstrap` central e automatizar seu registro, além de otimizar a definição de entidades.

### Tarefas:

#### 3.1. Implementar Carregamento Automático de Módulos

- [x] Definir a convenção de `index.ts` com `registerModule` em `src/main/modules/<module-name>/`.
- [x] Modificar `src/main/bootstrap.ts` para registrar módulos explicitamente em um loop.
- [x] Mover a lógica de inicialização de módulos dos `src/main/initializers/` para dentro dos respectivos `index.ts` dos módulos.
  - [x] Mover `initializeProjectManagement` para `src/main/modules/project-management/index.ts`.
  - [x] Mover `initializeDirectMessages` para `src/main/modules/direct-messages/index.ts`.
  - [x] Mover `initializeUserSettings` para `src/main/modules/user-settings/index.ts`.
  - [x] Mover `initializePersonaManagement` para `src/main/modules/persona-management/index.ts`.
  - [x] Mover `initializeLlmIntegration` para `src/main/modules/llm-integration/index.ts`.
  - [x] Mover `initializeCodeAnalysis` para `src/main/modules/code-analysis/index.ts`.
  - [x] Mover `initializeAutomaticPersonaHiring` para `src/main/modules/automatic-persona-hiring/index.ts`.

#### 3.2. Refatorar `BaseEntity` para Remover Getters Manuais

- [x] Analisar a `BaseEntity` e as entidades existentes.
- [x] Implementar uma solução (ex: `Proxy` ou `Object.defineProperty`) na `BaseEntity` para gerar getters automaticamente para as propriedades.
- [x] Remover os getters manuais de todas as entidades de domínio.
  - [x] Refatorar `src/main/modules/direct-messages/domain/direct-message.entity.ts`.
  - [x] Refatorar `src/main/modules/forum/domain/forum-post.entity.ts`.
  - [x] Refatorar `src/main/modules/forum/domain/forum-topic.entity.ts`.
  - [x] Refatorar `src/main/modules/llm-integration/domain/llm-config.entity.ts`.
  - [x] Refatorar `src/main/modules/persona-management/domain/persona.entity.ts`.
  - [x] Refatorar `src/main/modules/project-management/domain/project.entity.ts`.
  - [x] Refatorar `src/main/modules/user-settings/domain/user-setting.entity.ts`.
  - [x] Refatorar `src/main/modules/code-analysis/domain/project-stack.entity.ts`.

---

## Fase 4: Polimento e Garantia de Qualidade

### Objetivo:

Garantir a consistência e a aplicação dos novos padrões de forma automática e robusta.

### Tarefas:

#### 4.1. Desenvolver Regras de ESLint Customizadas

- [x] Criar regras de ESLint para:
  - [x] Proibir o uso direto de `ipcMain.handle` (forçar `createIpcHandler`).
  - [x] Proibir o uso direto de `window.electronIPC.invoke` (forçar `useIpcQuery`/`useIpcMutation`).
- [x] Integrar as novas regras no `eslint.config.js`.

#### 4.2. Introduzir Hierarquia de Erros Customizados

- [x] Criar classes de erro customizadas em `src/main/errors/` (ex: `ApplicationError`, `DomainError`, `NotFoundError`, `ValidationError`).
- [x] Atualizar a factory `createIpcHandler` para utilizar e mapear esses novos tipos de erro.
- [ ] #### 4.2.3. Refatorar a lógica de erro nas camadas de Application e Domain para lançar esses novos tipos de erro
    - [x] Refatorar erros na camada de Application (Commands e Queries):
        - [x] `src/main/modules/automatic-persona-hiring/application/commands/hire-personas-automatically.command.ts`
        - [x] `src/main/modules/code-analysis/application/queries/analyze-project-stack.query.ts`
        - [x] `src/main/modules/direct-messages/application/commands/send-message.command.ts`
        - [x] `src/main/modules/direct-messages/application/queries/list-messages.query.ts`
        - [x] `src/main/modules/filesystem-tools/application/commands/write-file.command.ts`
        - [x] `src/main/modules/filesystem-tools/application/queries/list-directory.query.ts`
        - [x] `src/main/modules/filesystem-tools/application/queries/read-file.query.ts`
        - [x] `src/main/modules/filesystem-tools/application/queries/search-file-content.query.ts`
        - [x] `src/main/modules/forum/application/commands/create-forum-post.command.ts`
        - [x] `src/main/modules/forum/application/commands/create-forum-topic.command.ts`
        - [x] `src/main/modules/forum/application/commands/remove-forum-post.command.ts`
        - [x] `src/main/modules/forum/application/commands/remove-forum-topic.command.ts`
        - [x] `src/main/modules/forum/application/commands/update-forum-post.command.ts`
        - [x] `src/main/modules/forum/application/commands/update-forum-topic.command.ts`
        - [x] `src/main/modules/forum/application/queries/get-forum-post.query.ts`
        - [x] `src/main/modules/forum/application/queries/get-forum-topic.query.ts`
        - [x] `src/main/modules/forum/application/queries/list-forum-posts.query.ts`
        - [x] `src/main/modules/forum/application/queries/list-forum-topics.query.ts`
        - [x] `src/main/modules/git-integration/application/commands/clone-repository.command.ts`
        - [x] `src/main/modules/git-integration/application/commands/initialize-repository.command.ts`
        - [x] `src/main/modules/git-integration/application/commands/pull-repository.command.ts`
        - [x] `src/main/modules/llm-integration/application/commands/remove-llm-config.command.ts`
        - [x] `src/main/modules/llm-integration/application/commands/save-llm-config.command.ts`
        - [x] `src/main/modules/llm-integration/application/queries/get-llm-config.query.ts`
        - [x] `src/main/modules/llm-integration/application/queries/list-llm-configs.query.ts`
        - [x] `src/main/modules/persona-management/application/commands/create-persona.command.ts`
        - [x] `src/main/modules/persona-management/application/commands/refine-persona-suggestion.handler.ts`
        - [x] `src/main/modules/persona-management/application/commands/remove-persona.command.ts`
        - [x] `src/main/modules/persona-management/application/queries/get-persona.query.ts`
        - [x] `src/main/modules/persona-management/application/queries/list-personas.query.ts`
        - [x] `src/main/modules/project-management/application/commands/create-project.command.ts`
        - [x] `src/main/modules/project-management/application/commands/remove-project.command.ts`
        - [x] `src/main/modules/project-management/application/queries/list-projects.query.ts`
        - [x] `src/main/modules/user-settings/application/commands/save-user-setting.command.ts`
        - [x] `src/main/modules/user-settings/application/queries/get-user-setting.query.ts`
        - [x] `src/main/modules/user-settings/application/queries/list-user-settings.query.ts`
    - [x] Refatorar erros na camada de Domain (Services):
        - [x] `src/main/modules/filesystem-tools/domain/filesystem.service.ts`
        - [x] `src/main/modules/git-integration/domain/git.service.ts`
        - [x] `src/main/modules/llm-integration/application/services/llm-service.ts`
        - [x] `src/main/modules/llm-integration/infrastructure/openai-llm.adapter.ts`
    - [x] Refatorar erros na camada de Persistence (Repositories):
        - [x] `src/main/modules/direct-messages/persistence/drizzle-direct-message.repository.ts`
        - [x] `src/main/modules/forum/persistence/drizzle-forum-post.repository.ts`
        - [x] `src/main/modules/forum/persistence/drizzle-forum-topic.repository.ts`
        - [x] `src/main/modules/llm-integration/persistence/drizzle-llm-config.repository.ts`