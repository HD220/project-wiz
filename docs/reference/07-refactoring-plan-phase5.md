# Plano de Refatoração de Código - Fase 5

Este documento detalha o plano iterativo para a reescrita completa do código da aplicação (Fase 5), com foco na adesão à Clean Architecture, Object Calisthenics, e outras boas práticas definidas na documentação técnica. O novo código será desenvolvido em `src_refactored/`.

## Objetivos Principais da Fase 5:
1.  Reescrever toda a aplicação a partir do zero em `src_refactored/`.
2.  Garantir que a nova implementação do frontend seja visualmente idêntica à original, seguindo `../../developer/04-visual-style-guide.md`.
3.  Assegurar que todo o código siga estritamente a arquitetura definida em `./01-software-architecture.md`.
4.  Aplicar rigorosamente todas as 9 regras do Object Calisthenics e boas práticas gerais (SOLID, DRY, KISS, Código Limpo).
5.  Desenvolver testes unitários e de integração para garantir a correção e manutenibilidade do novo código.
6.  Após a conclusão e verificação da nova implementação, remover o código legado de `src/` e `src2/`.
7.  Mover o código refatorado de `src_refactored/` para `src/`.

## Estratégia de Implementação Iterativa:

A implementação será dividida nas seguintes sub-fases principais:

### Sub-fase 5.A: Implementação da Camada de Domínio (`src_refactored/core/domain/`)
O foco é construir o coração do sistema com lógica de negócios pura, entidades ricas e VOs.

1.  **Estruturas Comuns do Domínio:**
    *   `common/value-objects/base.vo.ts`: `AbstractValueObject` com método `equals`. (Completo)
    *   `common/value-objects/identity.vo.ts`: `Identity` VO para UUIDs. (Completo)
    *   `common/errors.ts`: `DomainError` e outras exceções customizadas do domínio.
    *   `shared/result.ts`: Tipo `Result` para retornos de operações. (Completo, em `src_refactored/shared/`)
2.  **Agregado de Projeto (Project & SourceCode):** (Completo)
    *   VOs: `ProjectId`, `ProjectName`, `ProjectDescription`.
    *   Entidade: `Project`.
    *   VOs: `RepositoryId`, `RepositoryPath`, `RepositoryDocsPath`.
    *   Entidade: `SourceCode`.
    *   Ports: `IProjectRepository`, `ISourceCodeRepository` em `core/domain/project/ports/` e `core/domain/source-code/ports/`.
3.  **Agregado de Configuração LLM (LLMProviderConfig):** (Completo)
    *   VOs: `LLMProviderConfigId`, `LLMProviderConfigName`, `LLMProviderId` (identificador do tipo de provedor), `LLMApiKey`, `BaseUrl`.
    *   Entidade: `LLMProviderConfig`.
    *   Ports: `ILLMProviderConfigRepository` em `core/domain/llm-provider-config/ports/`.
4.  **Agregado de Agente (AgentPersonaTemplate, Agent, AgentInternalState):** (Completo)
    *   VOs para `AgentPersonaTemplate`: `PersonaId`, `PersonaName`, `PersonaRole`, `PersonaGoal`, `PersonaBackstory`, `ToolNames` (coleção).
    *   Estrutura/VO: `AgentPersonaTemplate`.
    *   Ports: `IAgentPersonaTemplateRepository` em `core/domain/agent/ports/`.
    *   VOs para `Agent`: `AgentId`, `AgentTemperature`.
    *   Entidade: `Agent` (vincula `AgentPersonaTemplate` e `LLMProviderConfig`).
    *   Ports: `IAgentRepository` em `core/domain/agent/ports/`.
    *   VOs para `AgentInternalState`: `CurrentProjectId`, `CurrentGoal`, `GeneralNotesCollection`.
    *   Entidade: `AgentInternalState` (vinculada a `AgentId`).
    *   Ports: `IAgentInternalStateRepository` em `core/domain/agent/ports/`.
5.  **Agregado de Job (Job & ActivityContext):** (Completo)
    *   VOs para `Job`: `JobId`, `JobName`, `JobStatus`, `JobPriority`, `JobTimestamp`, `AttemptCount`, `MaxAttempts`, `RetryPolicy` (com `BackoffType`, `RetryDelay`), `JobDependsOn`, `TargetAgentRole`, `RelatedActivityIds`.
    *   VOs para `ActivityContext`: `ActivityType`, `ActivityHistoryEntry` (com `HistoryEntryRole`, `EntryContent`), `ActivityHistory` (coleção), `ActivityNotes` (coleção), `MessageContent`, `Sender`, `ToolName`, `GoalToPlan`, `PlannedStepsCollection`, `ValidationCriteriaCollection`, `ValidationStatus`.
    *   VO Composto: `ActivityContext`.
    *   Tipos Compartilhados: `job-processing.types.ts` (para `AgentJobState`, `ExecutionHistoryEntry`, `AgentExecutorResult`).
    *   Entidade: `Job` (contendo `payload`, `result`, e `data` para `AgentJobState`).
    *   Ports: `IJobRepository` em `core/domain/job/ports/`.
6.  **Interfaces de Ferramentas (Tools):**
    *   `core/tools/tool.interface.ts`: Interface `IAgentTool` (genérica).
    *   `core/ports/tools/*`: Interfaces específicas para cada ferramenta principal se necessário (ex: `terminal-tool.interface.ts`), embora `IAgentTool` com Zod schemas seja o padrão. (Revisitar necessidade de interfaces específicas vs. apenas `IAgentTool`).
7.  **Outras Entidades/VOs de Domínio:**
    *   `User`, `Annotation`, `MemoryItem`, `Queue` (entidade para metadados da fila, se houver, além dos Jobs).
    *   VOs associados.
    *   Ports de Repositório correspondentes.

### Sub-fase 5.B: Implementação da Camada de Aplicação (`src_refactored/core/application/`)
Foco em orquestrar o domínio para realizar tarefas específicas.

1.  **Estruturas Comuns da Aplicação:**
    *   `common/executable.ts`: Interface `Executable` para Casos de Uso.
2.  **Portas para Adaptadores da Infraestrutura:**
    *   `core/ports/adapters/file-system.interface.ts`: `IFileSystem`. (Completo)
    *   `core/ports/adapters/version-control-system.interface.ts`: `IVersionControlSystem`. (Completo)
    *   `core/ports/adapters/job-queue.interface.ts`: `IJobQueue` (para enfileirar e obter jobs).
    *   `core/ports/adapters/llm.interface.ts`: `ILLMAdapter` (para interagir com LLMs via AI SDK).
    *   (Outras portas conforme necessário, ex: `INotificationService`).
3.  **Casos de Uso:**
    *   Para cada funcionalidade principal (CRUD e operações de processo):
        *   `CreateProjectUseCase` (Implementado).
        *   `ListProjectsUseCase`, `GetProjectDetailsUseCase`, `UpdateProjectUseCase`.
        *   `CreateLLMProviderConfigUseCase`.
        *   `CreatePersonaTemplateUseCase` (baseado no antigo `CreatePersonaUseCase`).
        *   `CreateAgentUseCase`.
        *   `SaveAgentInternalStateUseCase`, `LoadAgentInternalStateUseCase`.
        *   `CreateJobUseCase`.
        *   `ProcessJobUseCase` (ou lógica similar dentro do `GenericAgentExecutor` / `WorkerService`). Este é um caso de uso complexo que envolve o loop do agente.
        *   `UpdateJobUseCase`, `CancelJobUseCase`, `RetryJobUseCase`, `ListJobsUseCase`.
        *   Casos de Uso para `AnnotationTool`, `MemoryTool` (já existem no legado, adaptar para novos VOs/Entidades).
    *   Cada UseCase terá:
        *   Arquivo de schema Zod para Input/Output (`*.schema.ts`).
        *   Arquivo de implementação do UseCase (`*.use-case.ts`).
4.  **Serviços de Aplicação:**
    *   `GenericAgentExecutor`: Implementação de `IAgentExecutor` (porta em `core/ports/agent/`). Orquestra a interação do LLM com `Tools` para processar um `Job`.
    *   `WorkerService`: Gerencia o polling de Jobs de uma fila (identificada por `role`) e delega para o `GenericAgentExecutor`.
    *   (Potencial) `QueueService`: Serviço de mais alto nível para interagir com a `IJobQueue` (se a interface `IJobQueue` for muito baixo nível).

### Sub-fase 5.C: Implementação da Camada de Infraestrutura (`src_refactored/infrastructure/`)
Implementações concretas das portas definidas nas camadas de Core.

1.  **Persistência (Drizzle ORM + SQLite):**
    *   `infrastructure/persistence/drizzle/schemas/`: Schemas Drizzle para todas as entidades persistidas (`Project`, `SourceCode`, `LLMProviderConfig`, `AgentPersonaTemplate` (se DB), `Agent`, `AgentInternalState`, `Job`, `User`, `Annotation`, `MemoryItem`).
    *   `infrastructure/persistence/drizzle/repositories/`: Implementações concretas de todas as interfaces de repositório (ex: `DrizzleProjectRepository`, `DrizzleJobRepository`).
    *   Configuração Drizzle e migrações.
2.  **Adaptadores de Fila:**
    *   `infrastructure/queue/sqlite-job-queue.adapter.ts`: Implementação de `IJobQueue` usando o `DrizzleJobRepository` para simular uma fila baseada no status e prioridade dos Jobs.
3.  **Worker Pool:**
    *   `infrastructure/worker-pool/child-process-worker-pool.service.ts`: Implementação de um pool de workers usando processos filhos Node.js. Inclui `job-processor.worker.ts` como ponto de entrada para o processo filho.
4.  **Adaptadores de Ferramentas (Tools):**
    *   `infrastructure/tools/`: Implementações concretas para cada `IAgentTool`:
        *   `FileSystemToolAdapter` (implementando `IFileSystem` e expondo `IAgentTool`s).
        *   `TerminalToolAdapter` (implementando `IVersionControlSystem` para Git e expondo `IAgentTool`s para comandos genéricos).
        *   `AnnotationToolAdapter` (usando `AnnotationUseCases`).
        *   `MemoryToolAdapter` (usando `MemoryUseCases`).
        *   `TaskManagerToolAdapter` (usando `JobUseCases` como `CreateJobUseCase`, `ListJobsUseCase`).
    *   `ToolRegistry`: Registro central para todas as `IAgentTool`s.
5.  **Adaptadores LLM:**
    *   `infrastructure/llm/ai-sdk-llm.adapter.ts`: Implementação de `ILLMAdapter` usando `ai-sdk` para interagir com provedores configurados.
6.  **Injeção de Dependência (InversifyJS):**
    *   `infrastructure/ioc/inversify.config.ts`: Configuração do container DI para todas as camadas, especialmente para serviços de aplicação e adaptadores de infraestrutura.
7.  **Configuração:**
    *   Carregamento de configurações de `config/` (ex: `agent-executor.config.json`).

### Sub-fase 5.D: Implementação da Camada de Apresentação (UI e Electron)

1.  **Electron Main & Preload (`src_refactored/presentation/electron/` ou similar):**
    *   Ponto de entrada `main.ts`: Configuração da aplicação Electron, criação de janelas.
    *   `preload.ts`: Exposição segura de funcionalidades IPC para o Renderer.
    *   Manipuladores IPC: Recebem mensagens da UI, invocam Casos de Uso da Camada de Aplicação (via DI), retornam resultados.
2.  **Frontend React (`src_refactored/infrastructure/frameworks/react/`):**
    *   **Estrutura de Pastas:** `pages/`, `components/`, `hooks/`, `contexts/`, `services/` (para chamadas IPC), `styles/`, `lib/`, `assets/`.
    *   **Componentes de UI:** Reimplementar todos os componentes de UI (`components/ui/` e específicos de features) seguindo `docs/tecnico/guia_de_estilo_visual.md` (ShadCN/Tailwind).
    *   **Páginas/Roteamento:** Configurar rotas (TanStack Router) e implementar todas as páginas.
    *   **Gerenciamento de Estado:** (Zustand, Jotai, ou Context API para estado global/local complexo).
    *   **Interação IPC:** Serviços ou hooks para comunicação com o processo Electron Main.
    *   **Internacionalização (i18n):** LinguiJS.
    *   **Formulários:** React Hook Form com Zod.

### Sub-fase 5.E: Testes
*   **Unitários (Vitest):** Para Value Objects, Entidades (lógica de negócios), Casos de Uso (mockando repositórios/adaptadores), componentes de UI puros.
*   **Integração (Vitest):**
    *   Repositórios com banco de dados em memória (SQLite).
    *   Serviços de Aplicação com suas dependências (mockando apenas o mais externo, ex: LLM).
    *   Interação entre `GenericAgentExecutor` e `Tools` (mockando LLM efilesystem/terminal real ou fakes).
*   **E2E (Playwright/Spectron para Electron):** Para fluxos críticos da UI e interação com o backend.
*   **Cobertura de Teste:** Definir metas de cobertura.

### Sub-fase 5.F: Remoção de Código Legado e Migração
1.  **Verificação Completa:** Após `src_refactored/` estar completo e todos os testes passarem.
2.  **Análise de `src/` e `src2/`:** Identificar todo código que foi substituído.
3.  **Backup (Opcional):** Criar um branch ou tag do estado atual antes da remoção.
4.  **Exclusão:** Remover os diretórios `src/` e `src2/` (ou seus conteúdos relevantes). Manter arquivos de configuração raiz, `migrations/`, `config/`.
5.  **Movimentação:** Renomear/Mover `src_refactored/` para `src/`.
6.  **Ajustes Finais:** Atualizar caminhos em `tsconfig.json`, `package.json` scripts, `vite.config.mts`, etc., se necessário.
7.  **Teste Final Completo:** Executar todos os testes novamente.

## Considerações Gerais Durante a Implementação:
*   **Commits Incrementais:** Commits pequenos e focados, referenciando esta issue/plano.
*   **Revisão de Código:** Aderência aos padrões (Clean Arch, OC) deve ser verificada.
*   **Documentação:** Manter `docs/funcional/` e `docs/tecnico/` atualizados se decisões de design mudarem ou detalhes precisarem ser adicionados.

*(Este plano será usado como guia e poderá sofrer pequenos ajustes conforme a implementação avança e novos insights são obtidos.)*
