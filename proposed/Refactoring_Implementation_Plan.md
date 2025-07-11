# Project Wiz: Plano de Refatoração e Implementação

Este documento detalha um plano de refatoração e implementação para o Project Wiz, baseado nos documentos de requisitos e arquitetura fornecidos na pasta `proposed`. O plano é estruturado em tarefas micro e acionáveis, organizadas hierarquicamente, com referências e especificações para facilitar a execução por um agente.

## 1. Fundação e Arquitetura Central

### 1.1 Configuração do Processo Electron (Main & Renderer)

*   **Objetivo:** Estabelecer a estrutura básica do Electron com processos Main e Renderer separados e configurados corretamente.
*   **Referência:** `System_Architecture.md` (Seção 1, 2, 3, 7), `Non_Functional_Requirements.md` (RNF7.1, RNF7.2, RNF7.3).
*   **Micro-tarefas:**
    *   [x] **1.1.1 Verificar `forge.config.cts` e `vite.*.config.mts`:**
        *   **Descrição:** Assegurar que as configurações do Electron Forge e Vite estão corretas para compilar e empacotar os processos Main e Renderer separadamente.
        *   **Como:** Revisar `forge.config.cts`, `vite.main.config.mts`, `vite.preload.config.mts`, `vite.renderer.config.mts` na raiz do projeto.
        *   **Verificação:** `npm run build` deve ser executado sem erros.
    *   [x] **1.1.2 Estrutura de Diretórios `src/main` e `src/renderer`:**
        *   **Descrição:** Confirmar que os diretórios `src/main` e `src/renderer` estão organizados conforme a arquitetura proposta.
        *   **Como:** Navegar pelos diretórios e verificar a presença de `bootstrap.ts`, `main.ts` em `src/main` e `main.tsx`, `index.html` em `src/renderer`.
        *   **Verificação:** Estrutura de pastas deve refletir a descrição em `AGENTS.md` e `System_Architecture.md`.

### 1.2 Camada de Comunicação IPC

*   **Objetivo:** Implementar a comunicação segura e tipada entre os processos Main e Renderer.
*   **Referência:** `System_Architecture.md` (Seção 5), `Non_Functional_Requirements.md` (RNF7.1), `AGENTS.md` (Estrutura do Repositório: `src/shared/ipc-types/`).
*   **Micro-tarefas:**
    *   [x] **1.2.1 Definir Tipos IPC em `src/shared/ipc-types/`:**
        *   **Descrição:** Criar interfaces TypeScript para canais IPC, payloads de requisição e resposta.
        *   **Como:**
            *   `src/shared/ipc-types/ipc-channels.ts`: Definir `enum` ou `const` para nomes de canais (ex: `IPC_CHANNELS.PROJECT.CREATE`).
            *   `src/shared/ipc-types/ipc-contracts.ts`: Definir interfaces para `IpcContract` para cada canal, especificando `Request` e `Response` types.
            *   `src/shared/ipc-types/ipc-payloads.ts`: Definir interfaces para os payloads específicos.
        *   **Verificação:** Tipos devem ser importáveis e utilizáveis em ambos os processos sem erros de compilação.
        *   [ ] **1.2.2 Implementar `ipcMain.handle` no Processo Principal:**
        *   **Descrição:** Implementar e refatorar os handlers IPC para estarem localizados dentro dos diretórios `infrastructure` de seus respectivos módulos, conforme a arquitetura proposta.
        *   **Como:** Mover os arquivos de handler existentes, criar os diretórios `infrastructure` se necessário, e atualizar os imports e a lógica de registro em `bootstrap.ts`.
        *   **Verificação:** A comunicação IPC deve funcionar corretamente e os handlers devem estar organizados modularmente.
    *   [ ] **1.2.2.1 Create Module Infrastructure Directories:**
        *   **Description:** Create `infrastructure` directories within each relevant module (e.g., `src/main/modules/forum/infrastructure/`).
        *   **How:** Use `mkdir` for each module that has an IPC handler.
        *   **Verificação:** Verify directory creation using `list_directory`.
    *   [ ] **1.2.2.2 Move IPC Handler Files:**
        *   **Description:** Move each IPC handler file from `src/main/ipc-handlers/` to its corresponding module's `infrastructure` directory.
        *   **How:** Use `mv` command for each file.
        *   **Verificação:** Verify file movement using `list_directory` in both old and new locations.
    *   [ ] **1.2.2.3 Update Imports in Handler Files:**
        *   **Description:** Adjust relative import paths within each moved IPC handler file to correctly reference `ipc-channels.ts` and `ipc-contracts.ts` in `src/shared/ipc-types/`.
        *   **How:** Read each handler file, identify incorrect import paths, and use `replace` to correct them.
        *   **Verificação:** Check file content after replacement.
    *   [ ] **1.2.2.4 Update Handler Registration in `bootstrap.ts`:**
        *   **Description:** Modify `src/main/bootstrap.ts` to import and call the `register*IpcHandlers` functions from their new module-specific locations.
        *   **How:** Read `bootstrap.ts`, identify old import/call lines, and use `replace` to update them.
        *   **Verificação:** Check file content after replacement.
    *   [ ] **1.2.2.5 Remove Central `ipc-handlers` Directory:**
        *   **Description:** Delete the now empty `src/main/ipc-handlers/` directory.
        *   **How:** Use `rmdir` command.
        *   **Verificação:** Verify directory removal using `list_directory`.
    *   [x] **1.2.3 Implementar `ipcRenderer.invoke` no Processo Renderer:**
        *   **Descrição:** Criar funções no Renderer para enviar requisições ao Main.
        *   **Como:** Utilizar `window.electron.ipcRenderer.invoke(channel, payload)`.
        *   **Verificação:** Funções no Renderer devem ser capazes de chamar os handlers no Main.

### 1.3 CQRS Dispatcher e Event Bus

*   **Objetivo:** Implementar o padrão CQRS para separação de comandos e queries, e um Event Bus para comunicação assíncrona entre módulos.
*   **Referência:** `AGENTS.md` (Arquitetura do Sistema: CQRS Dispatcher, Event Bus), `System_Architecture.md` (Seção 1).
*   **Micro-tarefas:**
    *   [ ] **1.3.1 Verificar `src/main/kernel/cqrs-dispatcher.ts`:**
        *   **Descrição:** Assegurar que o `CqrsDispatcher` está implementado para despachar `Commands` e `Queries` para seus respectivos handlers.
        *   **Como:** Revisar o arquivo existente.
        *   **Verificação:** O dispatcher deve ser capaz de registrar e invocar handlers.
    *   [ ] **1.3.2 Verificar `src/main/kernel/event-bus.ts`:**
        *   **Descrição:** Assegurar que o `EventBus` está implementado para permitir a publicação e subscrição de eventos.
        *   **Como:** Revisar o arquivo existente.
        *   **Verificação:** Eventos devem ser publicados e listeners devem ser notificados.

### 1.4 Tratamento de Erros

*   **Objetivo:** Implementar um sistema robusto de tratamento de erros com classes de erro personalizadas.
*   **Referência:** `Coding_and_Design_Best_Practices.md` (Seção 6), `src/main/errors/`.
*   **Micro-tarefas:**
    *   [ ] **1.4.1 Definir Classes de Erro Personalizadas:**
        *   **Descrição:** Utilizar as classes de erro existentes em `src/main/errors/` (`application.error.ts`, `domain.error.ts`, `not-found.error.ts`, `validation.error.ts`, `base.error.ts`).
        *   **Como:** Garantir que todas as operações que podem falhar lancem uma dessas classes de erro.
        *   **Verificação:** Erros devem ser capturados e tratados nas camadas apropriadas.

### 1.5 Logging

*   **Objetivo:** Integrar uma solução de logging eficiente para depuração e monitoramento.
*   **Referência:** `Coding_and_Design_Best_Practices.md` (Seção 6.3), `System_Architecture.md` (Seção 9).
*   **Micro-tarefas:**
    *   [ ] **1.5.1 Configurar Pino.js:**
        *   **Descrição:** Integrar Pino.js para logging no Processo Principal.
        *   **Como:** Instalar `pino` e `pino-pretty`. Configurar um logger global ou por módulo.
        *   **Verificação:** Logs devem ser gerados no console ou em arquivo, com diferentes níveis (info, debug, error).

## 2. Camada de Persistência de Dados

### 2.1 Configuração do SQLite e Drizzle ORM

*   **Objetivo:** Configurar o banco de dados SQLite e o Drizzle ORM para interação com os dados.
*   **Referência:** `Database_Structure_and_Data_Modeling.md` (Seção 1, 3), `System_Architecture.md` (Seção 2, 4).
*   **Micro-tarefas:**
    *   [ ] **2.1.1 Verificar `drizzle.config.ts`:**
        *   **Descrição:** Assegurar que o arquivo de configuração do Drizzle está correto.
        *   **Como:** Revisar `drizzle.config.ts` na raiz do projeto.
        *   **Verificação:** `npm run db:generate` e `npm run db:migrate` devem funcionar.
    *   [ ] **2.1.2 Verificar `src/main/persistence/db.ts`:**
        *   **Descrição:** Assegurar que a conexão com o banco de dados SQLite está configurada corretamente.
        *   **Como:** Revisar o arquivo.
        *   **Verificação:** A aplicação deve ser capaz de se conectar ao banco de dados.

### 2.2 Definição do Esquema do Banco de Dados (`schema.ts`)

*   **Objetivo:** Definir todas as tabelas e seus atributos usando o Drizzle ORM.
*   **Referência:** `Database_Structure_and_Data_Modeling.md` (Seção 2, 3).
*   **Micro-tarefas:**
    *   [ ] **2.2.1 Implementar `projects` Schema:**
        *   **Descrição:** Definir a tabela `projects` em `src/main/persistence/schema.ts` com `id`, `name`, `description`, `localPath`, `remoteUrl`, `createdAt`, `updatedAt`.
        *   **Como:** Adicionar o código TypeScript para a tabela `projects` conforme o exemplo em `Database_Structure_and_Data_Modeling.md`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `projects`.
    *   [ ] **2.2.2 Implementar `agents` Schema:**
        *   **Descrição:** Definir a tabela `agents` em `src/main/persistence/schema.ts` com `id`, `name`, `role`, `profile`, `backstory`, `objective`, `description`, `llmModel`, `configJson`, `isBuiltIn`, `createdAt`, `updatedAt`.
        *   **Como:** Adicionar o código TypeScript para a tabela `agents`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `agents`.
    *   [ ] **2.2.3 Implementar `tasks` Schema:**
        *   **Descrição:** Definir a tabela `tasks` com `id`, `projectId`, `assignedAgentId`, `title`, `description`, `status`, `priority`, `type`, `dueDate`, `createdAt`, `updatedAt`.
        *   **Como:** Adicionar o código TypeScript para a tabela `tasks`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `tasks`.
    *   [ ] **2.2.4 Implementar `messages` Schema:**
        *   **Descrição:** Definir a tabela `messages` com `id`, `projectId`, `senderId`, `senderType`, `channelId`, `content`, `timestamp`, `isRead`.
        *   **Como:** Adicionar o código TypeScript para a tabela `messages`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `messages`.
    *   [ ] **2.2.5 Implementar `channels` Schema:**
        *   **Descrição:** Definir a tabela `channels` com `id`, `projectId`, `name`, `type`, `createdAt`, `updatedAt`.
        *   **Como:** Adicionar o código TypeScript para a tabela `channels`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `channels`.
    *   [ ] **2.2.6 Implementar `issues` Schema:**
        *   **Descrição:** Definir a tabela `issues` com `id`, `projectId`, `title`, `description`, `status`, `priority`, `assignedToAgentId`, `createdByUserId`, `createdAt`, `updatedAt`.
        *   **Como:** Adicionar o código TypeScript para a tabela `issues`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `issues`.
    *   [ ] **2.2.7 Implementar `sprints` Schema:**
        *   **Descrição:** Definir a tabela `sprints` com `id`, `projectId`, `name`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt`.
        *   **Como:** Adicionar o código TypeScript para a tabela `sprints`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `sprints`.
    *   [ ] **2.2.8 Implementar `sprint_issues` Schema:**
        *   **Descrição:** Definir a tabela `sprint_issues` com `sprintId`, `issueId`.
        *   **Como:** Adicionar o código TypeScript para a tabela `sprint_issues`.
        *   **Verificação:** `npm run db:generate` deve criar uma migração para a tabela `sprint_issues`.

### 2.3 Gerenciamento de Migrações

*   **Objetivo:** Garantir que as alterações no esquema do banco de dados sejam versionadas e aplicadas corretamente.
*   **Referência:** `Database_Structure_and_Data_Modeling.md` (Seção 4).
*   **Micro-tarefas:**
    *   [ ] **2.3.1 Gerar e Aplicar Migrações:**
        *   **Descrição:** Após cada alteração no `schema.ts`, gerar uma nova migração e aplicá-la.
        *   **Como:** Executar `npm run db:generate` e `npm run db:migrate`.
        *   **Verificação:** O banco de dados (`project-wiz.db`) deve ser atualizado com as novas tabelas/colunas.

### 2.4 Implementação do Repositório Base

*   **Objetivo:** Criar uma classe base para repositórios que forneça métodos CRUD comuns.
*   **Referência:** `src/main/persistence/base.repository.ts`.
*   **Micro-tarefas:**
    *   [ ] **2.4.1 Verificar `BaseRepository`:**
        *   **Descrição:** Assegurar que `src/main/persistence/base.repository.ts` fornece métodos genéricos para operações de persistência.
        *   **Como:** Revisar o arquivo existente.
        *   **Verificação:** Outros repositórios devem ser capazes de estender `BaseRepository`.

## 3. Implementação dos Módulos Principais

### 3.1 Módulo de Gerenciamento de Projetos (`project-management`)

*   **Objetivo:** Implementar a criação, clonagem e persistência de projetos.
*   **Referência:** `Functional_Requirements.md` (RF4.1, RF4.2, RF4.3, RF4.4), `Detailed_Use_Cases.md` (Caso de Uso 1, 4), `Database_Structure_and_Data_Modeling.md` (Tabela `projects`).
*   **Micro-tarefas:**
    *   [ ] **3.1.1 Criar Projeto (Git Init):**
        *   **Descrição:** Implementar a lógica para criar um novo projeto, incluindo a inicialização de um repositório Git vazio.
        *   **Como:**
            *   Criar `src/main/modules/project-management/application/commands/create-project.command.ts` e seu handler.
            *   No handler, usar `filesystem-tools` para criar o diretório e `git-integration` para `git init`.
            *   Persistir o projeto no banco de dados via `project-management/persistence/project.repository.ts`.
        *   **Verificação:** Um novo diretório deve ser criado com um `.git` dentro, e o projeto deve ser salvo no DB.
    *   [ ] **3.1.2 Clonar Projeto (Git Clone):**
        *   **Descrição:** Implementar a lógica para clonar um repositório Git remoto existente.
        *   **Como:**
            *   Criar `src/main/modules/project-management/application/commands/clone-project.command.ts` e seu handler.
            *   No handler, usar `git-integration` para `git clone`.
            *   Persistir o projeto no banco de dados.
        *   **Verificação:** O repositório remoto deve ser clonado localmente e salvo no DB.
    *   [ ] **3.1.3 Persistência do Projeto:**
        *   **Descrição:** Implementar o repositório para a entidade `Project`.
        *   **Como:** Criar `src/main/modules/project-management/persistence/project.repository.ts` estendendo `BaseRepository`.
        *   **Verificação:** Operações CRUD para projetos devem funcionar.

### 3.2 Módulo de Gerenciamento de Personas (`persona-management`)

*   **Objetivo:** Implementar a definição, criação e persistência de agentes (personas).
*   **Referência:** `Functional_Requirements.md` (RF2.3, RF2.6), `Database_Structure_and_Data_Modeling.md` (Tabela `agents`).
*   **Micro-tarefas:**
    *   [ ] **3.2.1 Definição e Persistência do Agente:**
        *   **Descrição:** Implementar a entidade `Agent` e seu repositório.
        *   **Como:**
            *   Criar `src/main/modules/persona-management/domain/agent.entity.ts`.
            *   Criar `src/main/modules/persona-management/persistence/agent.repository.ts`.
            *   Implementar comandos/queries para criar/recuperar agentes.
        *   **Verificação:** Agentes devem ser criados e salvos no DB com suas personas.
    *   [ ] **3.2.2 Assistente de Usuário Built-in:**
        *   **Descrição:** Garantir que um agente "built-in" esteja sempre disponível.
        *   **Como:** Na inicialização da aplicação, verificar se o agente built-in existe no DB; se não, criá-lo.
        *   **Verificação:** O assistente de usuário deve estar sempre presente e acessível.

### 3.3 Módulo de Integração LLM (`llm-integration`)

*   **Objetivo:** Gerenciar a configuração e interação com diferentes provedores de LLM.
*   **Referência:** `System_Architecture.md` (Seção 2, 4), `Functional_Requirements.md` (RF1.8).
*   **Micro-tarefas:**
    *   [ ] **3.3.1 Configuração do Provedor LLM:**
        *   **Descrição:** Permitir que o usuário configure chaves de API e modelos de LLM.
        *   **Como:**
            *   Criar `src/main/modules/llm-integration/application/commands/configure-llm-provider.command.ts`.
            *   Persistir configurações em `user-settings` ou diretamente no DB.
        *   **Verificação:** Configurações devem ser salvas e carregadas.
    *   [ ] **3.3.2 Interação com a API LLM:**
        *   **Descrição:** Implementar a camada de infraestrutura para chamar as APIs dos LLMs.
        *   **Como:**
            *   Criar `src/main/modules/llm-integration/infrastructure/openai.client.ts` e `deepseek.client.ts` (ou similar).
            *   Usar `@ai-sdk/openai`, `@ai-sdk/deepseek`.
        *   **Verificação:** Agentes devem ser capazes de fazer chamadas para os LLMs e receber respostas.

### 3.4 Módulo de Ferramentas do Sistema de Arquivos (`filesystem-tools`)

*   **Objetivo:** Fornecer operações seguras para leitura, escrita, criação e listagem de arquivos/diretórios.
*   **Referência:** `Functional_Requirements.md` (RF3.3), `LLM_Agent_Implementation_Guide.md` (Seção 2).
*   **Micro-tarefas:**
    *   [ ] **3.4.1 Ler/Escrever Arquivo:**
        *   **Descrição:** Implementar comandos/queries para ler e escrever conteúdo de arquivos.
        *   **Como:**
            *   Criar `src/main/modules/filesystem-tools/application/commands/write-file.command.ts` e `queries/read-file.query.ts`.
            *   Usar módulos Node.js como `fs`.
        *   **Verificação:** Arquivos devem ser lidos e escritos corretamente.
    *   [ ] **3.4.2 Criar Diretório:**
        *   **Descrição:** Implementar comando para criar novos diretórios.
        *   **Como:** Criar `src/main/modules/filesystem-tools/application/commands/create-directory.command.ts`.
        *   **Verificação:** Diretórios devem ser criados.
    *   [ ] **3.4.3 Listar Diretório:**
        *   **Descrição:** Implementar query para listar o conteúdo de um diretório.
        *   **Como:** Criar `src/main/modules/filesystem-tools/application/queries/list-directory.query.ts`.
        *   **Verificação:** O conteúdo do diretório deve ser listado.

### 3.5 Módulo de Integração Git (`git-integration`)

*   **Objetivo:** Gerenciar operações Git, incluindo `worktree`, branches, commits e merges.
*   **Referência:** `Functional_Requirements.md` (RF4.5, RF4.6, RF4.7), `Detailed_Flowcharts.md` (Fluxo 3), `LLM_Agent_Implementation_Guide.md` (Seção 4).
*   **Micro-tarefas:**
    *   [ ] **3.5.1 Gerenciamento de Git Worktree (Nível de Sistema):**
        *   **Descrição:** O sistema deve criar e gerenciar `git worktrees` para cada tarefa de agente.
        *   **Como:**
            *   Criar `src/main/modules/git-integration/application/commands/create-worktree.command.ts` e `remove-worktree.command.ts`.
            *   Usar `run_shell_command` para executar `git worktree add` e `git worktree remove`.
        *   **Verificação:** Worktrees devem ser criados e removidos com sucesso.
    *   [ ] **3.5.2 Operações Git (Add, Commit, Merge):**
        *   **Descrição:** Implementar comandos para `git add`, `git commit`, `git checkout -b`, `git merge`.
        *   **Como:**
            *   Criar comandos como `add-changes.command.ts`, `commit-changes.command.ts`, `create-branch.command.ts`, `merge-branch.command.ts`.
            *   Usar `run_shell_command` para executar os comandos Git.
        *   **Verificação:** Operações Git devem ser executadas corretamente.

### 3.6 Módulo de Execução de Comandos Shell (`shell-command-execution`)

*   **Objetivo:** Fornecer um mecanismo seguro e controlado para agentes executarem comandos de shell.
*   **Referência:** `Functional_Requirements.md` (RF3.4, RF3.5, RF3.6), `Detailed_Use_Cases.md` (Caso de Uso 5), `LLM_Agent_Implementation_Guide.md` (Seção 3), `Non_Functional_Requirements.md` (RNF2.2).
*   **Micro-tarefas:**
    *   [ ] **3.6.1 Execução Segura de Comandos:**
        *   **Descrição:** Implementar a execução de comandos de shell com validação e restrições de diretório.
        *   **Como:**
            *   Criar `src/main/modules/shell-command-execution/application/commands/execute-shell-command.command.ts`.
            *   Usar `child_process` do Node.js.
            *   Implementar lógica de segurança para validar comandos e diretórios.
        *   **Verificação:** Comandos devem ser executados, e tentativas de acesso não autorizado devem ser bloqueadas.
    *   [ ] **3.6.2 Captura de Saída:**
        *   **Descrição:** Capturar `stdout`, `stderr` e `exit code` dos comandos executados.
        *   **Como:** Retornar esses valores no resultado do comando.
        *   **Verificação:** A saída dos comandos deve ser corretamente capturada.

## 4. Autonomia e Interação do Agente

### 4.1 Gerenciamento da Fila de Tarefas do Agente

*   **Objetivo:** Implementar um sistema de fila de tarefas para cada agente.
*   **Referência:** `Functional_Requirements.md` (RF3.1), `Detailed_Flowcharts.md` (Fluxo 4), `Non_Functional_Requirements.md` (RNF8.3).
*   **Micro-tarefas:**
    *   [ ] **4.1.1 Fila de Tarefas por Agente:**
        *   **Descrição:** Criar uma estrutura de dados (ou usar uma biblioteca) para gerenciar filas de tarefas para cada agente.
        *   **Como:** Pode ser um array simples no início, ou uma fila mais robusta se necessário.
        *   **Verificação:** Tarefas devem ser adicionadas e processadas sequencialmente por agente.

### 4.2 Interpretação e Decomposição de Tarefas

*   **Objetivo:** Capacitar agentes a interpretar requisições do usuário e decompor tarefas complexas.
*   **Referência:** `LLM_Agent_Implementation_Guide.md` (Seção 1).
*   **Micro-tarefas:**
    *   [ ] **4.2.1 Compreensão da Intenção:**
        *   **Descrição:** Agente deve usar LLM para extrair intenção e requisitos de mensagens do usuário.
        *   **Como:** Enviar prompt ao LLM com a mensagem do usuário e pedir para identificar intenção, arquivo, local, conteúdo, etc.
        *   **Verificação:** LLM deve retornar uma estrutura de dados com a intenção da tarefa.
    *   [ ] **4.2.2 Decomposição de Tarefas:**
        *   **Descrição:** Agente deve usar LLM para quebrar tarefas complexas em subtarefas menores.
        *   **Como:** Enviar prompt ao LLM com a tarefa principal e pedir uma lista de subtarefas.
        *   **Verificação:** LLM deve retornar uma lista de subtarefas acionáveis.

### 4.3 Comunicação do Agente (Baseada em Persona)

*   **Objetivo:** Garantir que os agentes se comuniquem de forma humanizada, seguindo suas personas.
*   **Referência:** `LLM_Agent_Implementation_Guide.md` (Seção 1.4, 5.1), `Functional_Requirements.md` (RF2.6).
*   **Micro-tarefas:**
    *   [ ] **4.3.1 Geração de Respostas com Persona:**
        *   **Descrição:** Agente deve usar LLM para gerar respostas que reflitam sua persona (nome, papel, tom de voz).
        *   **Como:** Incluir informações da persona no prompt do LLM ao gerar respostas.
        *   **Verificação:** Respostas do agente devem ser consistentes com sua persona.
    *   [ ] **4.3.2 Atualizações de Status:**
        *   **Descrição:** Agente deve enviar atualizações de progresso para os canais de comunicação.
        *   **Como:** Usar o módulo `direct-messages` ou `forum` para enviar mensagens via IPC para o Renderer.
        *   **Verificação:** Mensagens de status do agente devem aparecer na UI.

### 4.4 Geração de Documentação por Agentes

*   **Objetivo:** Capacitar agentes a gerar e atualizar documentação.
*   **Referência:** `Functional_Requirements.md` (RF7.1, RF7.2), `LLM_Agent_Implementation_Guide.md` (Seção 6).
*   **Micro-tarefas:**
    *   [ ] **4.4.1 Gerar/Atualizar `README.md`:**
        *   **Descrição:** Agente deve ser capaz de criar ou atualizar o `README.md` do projeto.
        *   **Como:** Usar LLM para gerar conteúdo Markdown e `filesystem-tools` para escrever o arquivo.
        *   **Verificação:** `README.md` deve ser criado/atualizado no diretório do projeto.

## 5. Desenvolvimento da Interface do Usuário (UI)

### 5.1 Layout Estilo Discord

*   **Objetivo:** Criar uma interface de usuário com layout similar ao Discord.
*   **Referência:** `Functional_Requirements.md` (RF1.1), `Product_Requirements_Document.md` (Seção 4).
*   **Micro-tarefas:**
    *   [ ] **5.1.1 Estrutura Básica do Layout:**
        *   **Descrição:** Implementar a estrutura de três colunas (servidores/projetos, canais, área de chat).
        *   **Como:** Usar React e Tailwind CSS para construir os componentes de layout.
        *   **Verificação:** Layout deve ser visualmente similar ao Discord.

### 5.2 Visualização de Projetos e Canais

*   **Objetivo:** Permitir ao usuário visualizar e selecionar projetos e seus canais.
*   **Referência:** `Functional_Requirements.md` (RF1.2, RF1.3).
*   **Micro-tarefas:**
    *   [ ] **5.2.1 Lista de Projetos:**
        *   **Descrição:** Exibir uma lista de projetos disponíveis.
        *   **Como:** Fazer uma query IPC para o Main Process para obter a lista de projetos do DB.
        *   **Verificação:** Projetos salvos no DB devem aparecer na lista.
    *   [ ] **5.2.2 Lista de Canais:**
        *   **Descrição:** Exibir os canais associados ao projeto selecionado.
        *   **Como:** Fazer uma query IPC para o Main Process para obter os canais do projeto.
        *   **Verificação:** Canais devem ser exibidos ao selecionar um projeto.

### 5.3 Entrada e Exibição de Mensagens

*   **Objetivo:** Permitir ao usuário enviar mensagens e exibir mensagens recebidas.
*   **Referência:** `Functional_Requirements.md` (RF1.4, RF1.5).
*   **Micro-tarefas:**
    *   [ ] **5.3.1 Campo de Entrada de Mensagens:**
        *   **Descrição:** Implementar um campo de texto para o usuário digitar mensagens.
        *   **Como:** Componente React com `onChange` e `onSubmit` para enviar mensagens via IPC.
        *   **Verificação:** Usuário deve conseguir digitar e enviar mensagens.
    *   [ ] **5.3.2 Exibição de Mensagens:**
        *   **Descrição:** Exibir mensagens do usuário e dos agentes no chat.
        *   **Como:** Componente React que escuta eventos IPC do Main Process para novas mensagens.
        *   **Verificação:** Mensagens devem aparecer no chat em tempo real.

### 5.4 Exibição de Status do Agente

*   **Objetivo:** Exibir visualmente a tarefa atual que um agente está executando.
*   **Referência:** `Functional_Requirements.md` (RF2.6), `LLM_Agent_Implementation_Guide.md` (Seção 5.2).
*   **Micro-tarefas:**
    *   [ ] **5.4.1 Indicador de Status do Agente:**
        *   **Descrição:** Adicionar um indicador visual (ex: "digitando...", "executando tarefa X") ao lado do nome do agente.
        *   **Como:** Main Process deve enviar eventos IPC com o status do agente, e o Renderer deve atualizar a UI.
        *   **Verificação:** O status do agente deve ser visível na UI.

### 5.5 Visualizador de Documentação

*   **Objetivo:** Permitir ao usuário visualizar a documentação gerada pelos agentes.
*   **Referência:** `Functional_Requirements.md` (RF1.6, RF7.2), `Detailed_Use_Cases.md` (Caso de Uso 3).
*   **Micro-tarefas:**
    *   [ ] **5.5.1 Renderização de Markdown:**
        *   **Descrição:** Implementar um componente para renderizar conteúdo Markdown.
        *   **Como:** Usar bibliotecas como `react-markdown`, `remark-gfm`, `rehype-highlight`.
        *   **Verificação:** Arquivos Markdown devem ser exibidos corretamente na UI.
    *   [ ] **5.5.2 Navegação de Documentos:**
        *   **Descrição:** Permitir ao usuário selecionar e visualizar diferentes documentos.
        *   **Como:** UI deve listar documentos (ex: `README.md`) e, ao clicar, fazer uma query IPC para ler o arquivo.
        *   **Verificação:** Usuário deve conseguir abrir e ler documentos.

### 5.6 UI de Configuração de System Prompt

*   **Objetivo:** Permitir ao usuário visualizar e alterar os system prompts dos agentes.
*   **Referência:** `Functional_Requirements.md` (RF1.8).
*   **Micro-tarefas:**
    *   [ ] **5.6.1 Interface de Edição de Prompts:**
        *   **Descrição:** Criar uma seção na UI para listar e editar system prompts.
        *   **Como:** Componente React que faz query/comando IPC para o Main Process para gerenciar prompts.
        *   **Verificação:** Usuário deve conseguir ver e modificar prompts.

## 6. Testes e Garantia de Qualidade

### 6.1 Testes de Unidade

*   **Objetivo:** Garantir a correção da lógica de domínio e casos de uso.
*   **Referência:** `Conceptual_Test_Plan.md` (Seção 3.1), `Coding_and_Design_Best_Practices.md` (Seção 5).
*   **Micro-tarefas:**
    *   [ ] **6.1.1 Escrever Testes para Entidades de Domínio:**
        *   **Descrição:** Testar a lógica de negócio pura das entidades (ex: `Project`, `Agent`).
        *   **Como:** Usar Vitest em `src/main/modules/*/domain/*.test.ts`.
        *   **Verificação:** Testes devem cobrir a lógica central.
    *   [ ] **6.1.2 Escrever Testes para Casos de Uso (Application Layer):**
        *   **Descrição:** Testar os comandos e queries da camada de aplicação.
        *   **Como:** Usar Vitest em `src/main/modules/*/application/**/*.test.ts`.
        *   **Verificação:** Casos de uso devem funcionar conforme o esperado.

### 6.2 Testes de Integração

*   **Objetivo:** Testar a interação entre módulos, IPC, DB e execução de shell.
*   **Referência:** `Conceptual_Test_Plan.md` (Seção 3.1), `Coding_and_Design_Best_Practices.md` (Seção 5.1).
*   **Micro-tarefas:**
    *   [ ] **6.2.1 Testar Comunicação IPC:**
        *   **Descrição:** Testar se as mensagens IPC são enviadas e recebidas corretamente entre Main e Renderer.
        *   **Como:** Escrever testes que simulam interações UI -> Main e Main -> UI.
        *   **Verificação:** Comunicação IPC deve ser robusta.
    *   [ ] **6.2.2 Testar Interação com Banco de Dados:**
        *   **Descrição:** Testar operações de persistência (CRUD) com o Drizzle ORM.
        *   **Como:** Escrever testes que interagem com os repositórios.
        *   **Verificação:** Dados devem ser salvos e recuperados corretamente.
    *   [ ] **6.2.3 Testar Execução de Comandos Shell:**
        *   **Descrição:** Testar a execução segura de comandos de shell e a captura de saída.
        *   **Como:** Escrever testes que chamam o módulo `shell-command-execution`.
        *   **Verificação:** Comandos devem ser executados com segurança e a saída deve ser capturada.

### 6.3 Linting e Type Checking

*   **Objetivo:** Manter a qualidade do código e garantir a correção de tipos.
*   **Referência:** `Coding_and_Design_Best_Practices.md` (Seção 4.2), `Conceptual_Test_Plan.md` (Seção 5).
*   **Micro-tarefas:**
    *   [ ] **6.3.1 Executar ESLint:**
        *   **Descrição:** Rodar o linter para identificar problemas de estilo e potenciais erros.
        *   **Como:** `npm run lint`.
        *   **Verificação:** O código deve estar em conformidade com as regras do ESLint.
    *   [ ] **6.3.2 Executar Type Check:**
        *   **Descrição:** Verificar erros de tipagem com TypeScript.
        *   **Como:** `npm run type-check`.
        *   **Verificação:** Não deve haver erros de tipagem no projeto.

Este plano fornece uma base sólida para a implementação do Project Wiz, garantindo que todos os requisitos sejam abordados de forma sistemática e que o código seja de alta qualidade e manutenível. Cada micro-tarefa é projetada para ser acionável e verificável, permitindo um progresso claro e eficiente.