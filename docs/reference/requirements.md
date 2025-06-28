# Requisitos do Sistema - Project Wiz

Este documento detalha os Requisitos Funcionais (RF) e Não Funcionais (RNF) para o Project Wiz, com base na documentação funcional consolidada em `docs/funcional/`.

## 1. Requisitos Funcionais (RF)

### RF-GERAL: Visão Geral e Interação Principal ([Introdução ao Project Wiz](../../user/01-introduction.md))
*   **RF-GERAL-001:** O sistema deve permitir que usuários interajam com Agentes IA (configurados por Personas) através de uma interface de chat.
*   **RF-GERAL-002:** Agentes IA devem ser capazes de analisar solicitações do usuário, elaborar planos de ação (Jobs/Sub-Jobs) e definir critérios de "Definição de Pronto" (`validationCriteria`).
*   **RF-GERAL-003:** O sistema deve permitir que Agentes IA apresentem planos ao usuário para aprovação antes da execução.
*   **RF-GERAL-004:** Agentes IA devem executar Jobs de forma autônoma usando LLMs e `Tools`.
*   **RF-GERAL-005:** Agentes IA devem operar dentro de uma `working_directory` de projeto para tarefas de código, utilizando branches Git.
*   **RF-GERAL-006:** Agentes IA devem realizar auto-validação dos resultados dos Jobs contra os `validationCriteria`.
*   **RF-GERAL-007:** O sistema deve permitir que usuários acompanhem o progresso dos Jobs e recebam resultados.

### RF-PROJ: Gerenciamento de Projetos ([Core Concept: Gerenciando Projetos](../../user/core-concepts/projects.md))
*   **RF-PROJ-001:** O sistema deve permitir ao usuário criar novos projetos de software (com nome e descrição opcional).
*   **RF-PROJ-002:** Na criação de um projeto, o sistema (via `CreateProjectUseCase`) deve:
    *   Gerar um `ProjectId`.
    *   Criar uma estrutura de pastas base (ex: `<ProjectId>/source-code/`, `<ProjectId>/source-code/docs/`, `<ProjectId>/worktrees/`).
    *   Inicializar um repositório Git em `<ProjectId>/source-code/`.
    *   Persistir uma entidade `Project` e uma entidade `SourceCode` associada.
*   **RF-PROJ-003:** O sistema deve permitir a listagem e visualização dos projetos existentes e seus detalhes.
*   **RF-PROJ-004:** O projeto ativo deve fornecer contexto (working directory, Git repo) para os Agentes IA.
*   **RF-PROJ-005 (Futuro):** Agentes poderão interagir com metadados do projeto (issues internas, etc.) através de `Tools` específicas.

### RF-PERSONA: Gerenciamento de Personas e Agentes IA ([Core Concept: Personas e Agentes IA](../../user/core-concepts/personas-and-agents.md))
*   **RF-PERSONA-001:** O sistema deve permitir ao usuário criar templates de Persona (`AgentPersonaTemplate`) definindo Nome, Papel (Role), Objetivo (Goal), Backstory e `toolNames` permitidas (via `CreatePersonaUseCase`).
*   **RF-PERSONA-002:** O sistema deve permitir a criação de instâncias de `Agent` executáveis, vinculando um `AgentPersonaTemplate` a uma `LLMProviderConfig` e `temperature` (via `CreateAgentUseCase`).
*   **RF-PERSONA-003:** O sistema deve persistir `AgentPersonaTemplate` e `Agent`.
*   **RF-PERSONA-004:** A UI deve permitir listar e selecionar `AgentPersonaTemplate`.
*   **RF-PERSONA-005:** Cada `Agent` deve poder ter um `AgentInternalState` persistente para aprendizado e continuidade.
*   **RF-PERSONA-006:** O sistema deve suportar um `AgentRuntimeState` para informações transitórias de um Agente em execução.
*   **RF-PERSONA-007:** O sistema deve suportar a operação concorrente de múltiplos Agentes (via `WorkerService` por `role`).

### RF-AGENT-OP: Operação de Agentes IA ([Agent Operation Internals](./03-agent-operation-internals.md))
*   **RF-AGENT-OP-001:** O `GenericAgentExecutor` deve usar o LLM configurado para analisar solicitações e o `AgentInternalState` para contexto.
*   **RF-AGENT-OP-002:** O Agente (via `GenericAgentExecutor` e `TaskManagerTool`) deve ser capaz de criar um Job principal e Sub-Jobs com dependências.
*   **RF-AGENT-OP-003:** O Agente (via LLM) deve definir `validationCriteria` para Jobs, armazenados no `ActivityContext`.
*   **RF-AGENT-OP-004:** O Agente (via LLM) deve poder apresentar planos ao usuário para aprovação via chat.
*   **RF-AGENT-OP-005:** O `GenericAgentExecutor` deve processar Jobs, usando LLM e `Tools` do `ToolRegistry`.
*   **RF-AGENT-OP-006:** Para tarefas de código, Agentes devem usar `TerminalTool` para Git e `FileSystemTool` para arquivos na `working_directory` do projeto.
*   **RF-AGENT-OP-007:** O `GenericAgentExecutor` deve gerenciar `AgentJobState` (contendo `ActivityContext` com `conversationHistory` e `executionHistory`) dentro de `Job.data.agentState`.
*   **RF-AGENT-OP-008:** O `GenericAgentExecutor` deve suportar sumarização de `conversationHistory` longa.
*   **RF-AGENT-OP-009:** O `GenericAgentExecutor` deve suportar replanejamento em caso de erros significativos.
*   **RF-AGENT-OP-010:** O Agente (via LLM) deve realizar auto-validação contra `validationCriteria`.
*   **RF-AGENT-OP-011:** O Agente (via LLM e `MemoryTool`) deve poder atualizar seu conhecimento de longo prazo (`AgentInternalState` ou similar).
*   **RF-AGENT-OP-012:** O `GenericAgentExecutor` deve lidar com erros de `Tools` e LLM, e o sistema de Jobs deve suportar retentativas.

### RF-JOB: Sistema de Jobs, Atividades e Fila ([Core Concept: Jobs e Automação](../../user/core-concepts/jobs-and-automation.md))
*   **RF-JOB-001:** O sistema deve usar a entidade `Job` para representar unidades de trabalho, com atributos como ID, `targetAgentRole`, `name`, `payload`, `data` (para `agentState` contendo `ActivityContext`), `status`, `priority`, `dependsOnJobIds`, `parentJobId`, `RetryPolicy`, timestamps e `result`.
*   **RF-JOB-002:** Agentes devem criar Jobs para si (Sub-Jobs) usando `TaskManagerTool` (que usa `CreateJobUseCase`).
*   **RF-JOB-003:** O sistema deve suportar filas implícitas por `targetAgentRole`.
*   **RF-JOB-004:** Jobs devem transitar por um ciclo de vida (`JobStatus` VO: `PENDING`, `ACTIVE`, `COMPLETED`, `FAILED`, `DELAYED`, `WAITING`).
*   **RF-JOB-005:** Um `WorkerService` (configurado por `handlesRole`) deve buscar Jobs e entregá-los ao `GenericAgentExecutor` para processamento.
*   **RF-JOB-006:** O sistema deve suportar priorização de Jobs (via atributo `priority` no `Job` e lógica no `IJobRepository`).
*   **RF-JOB-007:** O sistema deve respeitar dependências entre Jobs (`dependsOnJobIds`). A lógica de verificação deve estar no `IJobRepository` ou serviço de processamento.
*   **RF-JOB-008:** O sistema deve implementar um mecanismo de retentativa para Jobs falhos (`RetryPolicy` VO, gerenciado pelo `WorkerService`).
*   **RF-JOB-009:** Jobs devem poder ser explicitamente atrasados (`executeAfter` timestamp, status `DELAYED`).
*   **RF-JOB-010:** Todos os dados de Jobs devem ser persistidos em SQLite via Drizzle ORM (`IJobRepository`).
*   **RF-JOB-011:** A UI deve permitir o monitoramento básico do status dos Jobs.

### RF-LLM: Integração com LLM ([LLM Integration](./04-llm-integration.md))
*   **RF-LLM-001:** O sistema deve permitir a configuração de múltiplos provedores de LLM (`LLMProviderConfig` entidade, `CreateLLMProviderConfigUseCase`).
*   **RF-LLM-002:** Uma instância de `Agent` deve vincular um `AgentPersonaTemplate` a uma `LLMProviderConfig`.
*   **RF-LLM-003:** O `GenericAgentExecutor` deve usar o LLM configurado para o Agente para todas as operações de IA.
*   **RF-LLM-004:** Interações com LLM devem ser contextualizadas (prompt de sistema da Persona, `conversationHistory` do `ActivityContext`, descrição das `Tools`). Agentes podem usar `MemoryTool` para buscar contexto adicional do `AgentInternalState`.
*   **RF-LLM-005:** O LLM, através do `GenericAgentExecutor` e `ai-sdk`, deve poder solicitar a execução de `Tools` registradas no `ToolRegistry`.
*   **RF-LLM-006:** O sistema deve usar `ai-sdk` para abstrair a comunicação com diferentes APIs de LLM.

### RF-TOOL: Ferramentas de Agente ([Agent Tools](./05-agent-tools.md))
*   **RF-TOOL-001:** O sistema deve fornecer um `ToolRegistry` para registrar e executar `IAgentTool`s.
*   **RF-TOOL-002:** Cada `IAgentTool` deve ter `name`, `description`, `parameters` (Zod schema) e `execute` método.
*   **RF-TOOL-003 (Implícito):** Comunicação Agente-Usuário via chat da UI.
*   **RF-TOOL-004 (Terminal):** Deve existir uma `TerminalTool` (`terminal.executeCommand`) para executar comandos de shell, incluindo operações Git.
*   **RF-TOOL-005 (FileSystem):** Deve existir uma `FileSystemTool` com operações como `fileSystem.readFile`, `fileSystem.writeFile`, `fileSystem.listDirectory`, `fileSystem.createDirectory`, `fileSystem.removeDirectory`, `fileSystem.moveFile`, `fileSystem.moveDirectory`.
*   **RF-TOOL-006 (Annotation):** Deve existir uma `AnnotationTool` (`annotation.save`, `annotation.list`, `annotation.remove`) para gerenciamento de anotações.
*   **RF-TOOL-007 (Memory):** Deve existir uma `MemoryTool` (`memory.save`, `memory.search` com busca semântica, `memory.remove`) para persistência e recuperação de conhecimento do agente.
*   **RF-TOOL-008 (TaskManager):** Deve existir uma `TaskManagerTool` (`taskManager.saveJob`, `taskManager.listJobs`, `taskManager.removeJob`) para agentes gerenciarem Jobs.
*   **RF-TOOL-009 (Futuro):** `ProjectDataTool` para interação com metadados internos do Project Wiz.
*   **RF-TOOL-010 (Futuro):** `SendMessageToAgentTool` para comunicação inter-agente.

### RF-UI: Interface de Usuário e UX ([Visão Geral da Interface do Usuário](../../user/03-interface-overview.md))
*   **RF-UI-001:** O sistema deve ser uma aplicação desktop Electron com UI React.
*   **RF-UI-002:** Interação primária com Agentes via interface de chat (`ChatThread`).
*   **RF-UI-003:** Chat deve suportar renderização Markdown (`MarkdownRenderer`).
*   **RF-UI-004:** UI para listar, criar e visualizar detalhes de Projetos (`ProjectListPage`, `ProjectDetailPage`).
*   **RF-UI-005:** UI para listar e selecionar `AgentPersonaTemplate` (`PersonaList`).
*   **RF-UI-006:** UI para configurar provedores de LLM (`llm-config-form.tsx`).
*   **RF-UI-007:** UI para acompanhar status/progresso de Jobs (`activity-list-item.tsx`, `user-dashboard.tsx`).
*   **RF-UI-008:** Layout inspirado no Discord (Sidebars, área de conteúdo principal).
*   **RF-UI-009:** Suporte a temas claro/escuro.
*   **RF-UI-010:** Suporte à autenticação de usuário.
*   **RF-UI-011:** Suporte à internacionalização (i18n com LinguiJS).

## 2. Requisitos Não Funcionais (RNF)

*   **RNF-COD-001 (Qualidade de Código):** Todo o novo código deve ser escrito em TypeScript.
*   **RNF-COD-002 (Object Calisthenics):** Todo o novo código deve aderir estritamente às 9 regras do Object Calisthenics (ADR-006).
*   **RNF-COD-003 (Manutenibilidade):** A arquitetura deve ser modular (Clean Architecture) e em camadas para facilitar a manutenção e evolução. Utilizar Injeção de Dependência (InversifyJS) no backend.
*   **RNF-COD-004 (Testabilidade):** O código deve ser altamente testável. Cobertura de testes unitários e de integração deve ser priorizada (Vitest).
*   **RNF-SEC-001 (Segurança de Chaves):** Chaves de API de LLM e outras credenciais sensíveis devem ser armazenadas e gerenciadas de forma segura (ex: variáveis de ambiente, não hardcoded).
*   **RNF-SEC-002 (Segurança de Terminal):** A `TerminalTool` deve ter considerações de segurança para prevenir abusos (ex: logging, operar dentro do CWD do projeto, sandboxing se possível).
*   **RNF-SEC-003 (Segurança de Chat):** Conteúdo Markdown no chat deve ser sanitizado para prevenir XSS.
*   **RNF-USA-001 (Usabilidade):** A interface do usuário deve ser intuitiva e fácil de usar.
*   **RNF-USA-002 (Feedback ao Usuário):** O sistema deve fornecer feedback claro e constante ao usuário.
*   **RNF-PER-001 (Performance da UI):** A interface do usuário deve ser responsiva e fluida.
*   **RNF-PER-002 (Performance do Backend):** O processamento de Jobs e as interações com LLM devem ser eficientes. O sistema de filas e workers deve ser capaz de lidar com carga de trabalho razoável para uma aplicação desktop.
*   **RNF-EXT-001 (Extensibilidade de Tools):** O framework de `Tools` deve facilitar a adição de novas `Tools`.
*   **RNF-EXT-002 (Extensibilidade de Personas):** A configuração de `AgentPersonaTemplate` deve ser flexível.
*   **RNF-I18N-001 (Internacionalização):** A UI deve suportar internacionalização (LinguiJS confirmado).
*   **RNF-REL-001 (Confiabilidade da Fila):** O sistema de Jobs e Filas deve ser confiável, com persistência de estado em SQLite.
*   **RNF-CMP-001 (Compatibilidade Visual):** A nova implementação do frontend deve ser visualmente idêntica à pré-implementação, conforme o [Guia de Estilo Visual](../../developer/04-visual-style-guide.md).
*   **RNF-TEC-001 (Manutenção Tecnológica):** As tecnologias definidas no `package.json` são mandatórias e devem ser mantidas.

Estes requisitos servirão como base para o desenvolvimento e validação da nova implementação do Project Wiz.
