# Requisitos do Sistema

Este documento detalha os Requisitos Funcionais (RF) e Não Funcionais (RNF) para o Project Wiz.

## 1. Requisitos Funcionais (RF)

Os Requisitos Funcionais são derivados da documentação consolidada em `docs/funcional/`.

### 1.1. Gerenciamento de Projetos (`docs/funcional/project-management.md`)
- **RF_PROJ_001:** O sistema deve permitir a criação de novos projetos.
    - **RF_PROJ_001.1:** A criação de projeto deve incluir a definição de um nome para o projeto.
    - **RF_PROJ_001.2:** A criação de projeto pode incluir uma descrição opcional.
    - **RF_PROJ_001.3 (Code):** Na criação, o sistema deve preparar uma estrutura de pastas base no sistema de arquivos, incluindo subdiretórios para código fonte (`source-code`), documentação (`docs`), e worktrees.
    - **RF_PROJ_001.4 (Code):** Na criação, o sistema deve inicializar um repositório Git no diretório `source-code` do projeto.
- **RF_PROJ_002:** O sistema deve permitir a listagem e visualização dos projetos existentes. (Implied by UI components like `project-list-page.tsx`)
- **RF_PROJ_003:** O sistema deve permitir a visualização dos detalhes de um projeto específico. (Implied by UI components like `project-detail-page.tsx`)
- **RF_PROJ_004 (Agent via ProjectTool - Documented, Gap in Code):** O sistema deve permitir que um Agente (Persona) salve ou atualize informações gerais de um projeto (ex: Nome, Descrição).
- **RF_PROJ_005 (Agent via ProjectTool - Documented, Gap in Code):** O sistema deve permitir que um Agente crie ou atualize canais de comunicação dentro de um projeto.
- **RF_PROJ_006 (Agent via ProjectTool - Documented, Gap in Code):** O sistema deve permitir que um Agente crie ou atualize tópicos de discussão no fórum de um projeto.
- **RF_PROJ_007 (Agent via ProjectTool - Documented, Gap in Code):** O sistema deve permitir que um Agente crie ou atualize issues (itens de trabalho, bugs) associadas a um projeto.

### 1.2. Gerenciamento de Personas (Agentes AI) (`docs/funcional/persona-agent-management.md`)
- **RF_PERSONA_001 (Code):** O sistema deve permitir a criação de novas Personas (Agentes AI).
    - **RF_PERSONA_001.1 (Code):** A criação de Persona deve incluir nome, papel (role), objetivo (goal) e história de fundo (backstory).
- **RF_PERSONA_002:** O sistema deve permitir a listagem e visualização das Personas existentes. (Implied by UI components like `persona-list.tsx`)
- **RF_PERSONA_003:** Cada Persona deve manter um `AgentInternalState` persistido, contendo no mínimo: `agentId`, `currentProjectId` (opcional), `currentIssueId` (opcional), `currentGoal` (opcional), `generalNotes` (opcional), `promisesMade` (opcional).

### 1.3. Gerenciamento de Jobs/Activities (`docs/funcional/job-activity-management.md`)
- **RF_JOB_001 (Code):** O sistema deve permitir a criação de Jobs/Activities.
    - **RF_JOB_001.1 (Code):** A criação de Job deve incluir um nome.
    - **RF_JOB_001.2 (Code):** A criação de Job pode incluir um payload (dados de entrada), tipo de atividade, política de retentativa, `ActivityContext` inicial, ID do Job pai, e IDs de Jobs relacionados.
- **RF_JOB_002 (Code):** O sistema deve gerenciar o ciclo de vida de um Job com os seguintes status: `PENDING`, `EXECUTING`, `FINISHED` (sucesso), `FAILED`, `DELAYED`, `WAITING`, `CANCELLED`. A entidade `Job` deve prover métodos para transitar entre esses estados.
- **RF_JOB_003 (Code):** O sistema deve suportar políticas de retentativa para Jobs, incluindo número máximo de tentativas e cálculo de delay para a próxima tentativa (backoff).
- **RF_JOB_004 (Code):** O sistema deve permitir que Jobs tenham dependências de outros Jobs. Um Job dependente não deve iniciar (`WAITING` status) até que todas as suas dependências estejam `FINISHED`.
- **RF_JOB_005 (Code):** Um Worker Pool deve gerenciar Workers para processamento concorrente de Jobs.
- **RF_JOB_006 (Code):** Um Worker deve obter Jobs da Queue, invocar a Persona (Agente) apropriada para processamento, e reportar o resultado (sucesso, falha, necessidade de delay) de volta à Queue.
- **RF_JOB_007 (Code):** A Persona (Agente) designada deve carregar seu `AgentInternalState` e o `ActivityContext` do Job.
- **RF_JOB_008 (Code):** A Persona (Agente) deve utilizar um LLM, junto com os contextos (`AgentInternalState` e `ActivityContext`), para decidir a próxima ação ou gerar conteúdo.
- **RF_JOB_009 (Code):** A Persona (Agente) deve ser capaz de atualizar o `ActivityContext` do Job com progresso, notas e resultados durante o processamento.
- **RF_JOB_010 (Code):** O estado dos Jobs/Activities e o `AgentInternalState` devem ser persistidos.
- **RF_JOB_011 (Code):** O sistema deve permitir o cancelamento de um Job que não esteja em estado final (`FINISHED`, `FAILED`, `CANCELLED`).
- **RF_JOB_012 (Code):** O sistema deve permitir a atualização de certos campos de um Job existente (ex: status, política de retentativa, contexto). Se o status for atualizado para `PENDING`, o Job deve ser adicionado à fila.
- **RF_JOB_013 (Code):** O `ActivityContext` de um Job deve conter no mínimo: `messageContent`, `sender`, `toolName` (opcional), `toolArgs` (opcional), `goalToPlan` (opcional), `plannedSteps` (opcional), `activityNotes` (opcional), `validationCriteria` (opcional), `validationResult` (opcional), e `activityHistory`.

### 1.4. Capacidades do Agente (Tools)

#### 1.4.1. Interação com Memória (`docs/funcional/tool-memory-interaction.md`)
- **RF_TOOL_MEM_001 (Documented, Gap in Code):** O Agente deve ser capaz de escrever (criar ou atualizar) registros em sua memória de longo prazo.
- **RF_TOOL_MEM_002 (Documented, Gap in Code):** O Agente deve ser capaz de deletar informações específicas de sua memória de longo prazo.

#### 1.4.2. Manipulação de Tarefas/Jobs (`docs/funcional/tool-task-job-manipulation.md`)
- **RF_TOOL_TASK_001 (Documented, Partially Covered by Use Cases):** O Agente deve ser capaz de visualizar/listar os Jobs em sua fila de execução.
- **RF_TOOL_TASK_002 (Documented, Partially Covered by Use Cases):** O Agente deve ser capaz de criar um novo Job ou atualizar um Job existente em sua fila.
- **RF_TOOL_TASK_003 (Documented, Partially Covered by Use Cases):** O Agente deve ser capaz de remover um Job (e suas sub-Jobs dependentes) de sua fila.
*(Nota: Use cases `CreateJobUseCase`, `UpdateJobUseCase`, `CancelJobUseCase` existem, mas a funcionalidade como uma "Tool" para o agente gerenciar sua própria fila não foi encontrada implementada como tal.)*

#### 1.4.3. Anotação Contextual (`docs/funcional/tool-contextual-annotation.md`)
- **RF_TOOL_ANN_001 (Documented, Gap in Code):** O Agente deve ser capaz de visualizar/listar anotações contextuais ativas.
- **RF_TOOL_ANN_002 (Documented, Partially Covered by ActivityContext):** O Agente deve ser capaz de criar ou atualizar uma anotação contextual. (`ActivityContext` possui `activityNotes`).
- **RF_TOOL_ANN_003 (Documented, Gap in Code):** O Agente deve ser capaz de remover uma anotação contextual.
*(Nota: `ActivityContext` inclui `activityNotes`. A funcionalidade como uma "Tool" discreta para o agente não foi encontrada.)*

#### 1.4.4. Operações de Filesystem (`docs/funcional/tool-filesystem-operations.md`)
- **RF_TOOL_FS_001 (Documented, Gap in Code):** O Agente deve ser capaz de ler o conteúdo de um arquivo especificado.
- **RF_TOOL_FS_002 (Documented, Gap in Code):** O Agente deve ser capaz de escrever ou sobrescrever conteúdo em um arquivo especificado.
- **RF_TOOL_FS_003 (Documented, Gap in Code):** O Agente deve ser capaz de mover ou renomear um arquivo.
- **RF_TOOL_FS_004 (Documented, Gap in Code):** O Agente deve ser capaz de deletar um arquivo.
- **RF_TOOL_FS_005 (Documented, Gap in Code):** O Agente deve ser capaz de listar o conteúdo (arquivos e subdiretórios) de um diretório especificado.
- **RF_TOOL_FS_006 (Documented, Gap in Code):** O Agente deve ser capaz de criar um novo diretório.
- **RF_TOOL_FS_007 (Documented, Gap in Code):** O Agente deve ser capaz de mover ou renomear um diretório.
- **RF_TOOL_FS_008 (Documented, Gap in Code):** O Agente deve ser capaz de deletar um diretório.
*(Nota: `CreateProjectUseCase` realiza algumas operações de criação de diretório, mas não como uma ferramenta genérica para agentes.)*

#### 1.4.5. Comandos de Terminal (`docs/funcional/tool-terminal-commands.md`)
- **RF_TOOL_TERM_001 (Documented, Gap in Code):** O Agente deve ser capaz de executar um comando shell especificado e receber sua saída.

#### 1.4.6. Interação com Dados do Projeto (`docs/funcional/tool-project-data-interaction.md`)
- (Estes são os mesmos RF_PROJ_004 a RF_PROJ_007, listados aqui para completude da seção de Tools)
- **RF_TOOL_PROJ_001 (Documented, Gap in Code):** O Agente deve ser capaz de salvar ou atualizar informações gerais de um projeto (ex: Nome, Descrição) via `ProjectTool`.
- **RF_TOOL_PROJ_002 (Documented, Gap in Code):** O Agente deve ser capaz de criar ou atualizar canais de comunicação dentro de um projeto via `ProjectTool`.
- **RF_TOOL_PROJ_003 (Documented, Gap in Code):** O Agente deve ser capaz de criar ou atualizar tópicos de discussão no fórum de um projeto via `ProjectTool`.
- **RF_TOOL_PROJ_004 (Documented, Gap in Code):** O Agente deve ser capaz de criar ou atualizar issues (itens de trabalho, bugs) associadas a um projeto via `ProjectTool`.

#### 1.4.7. Mensagens (`docs/funcional/tool-messaging.md`)
- **RF_TOOL_MSG_001 (Documented, Gap in Code):** O Agente deve ser capaz de enviar uma mensagem direta para um usuário específico.
- **RF_TOOL_MSG_002 (Documented, Gap in Code):** O Agente deve ser capaz de enviar uma mensagem para um canal designado dentro de um projeto.
- **RF_TOOL_MSG_003 (Documented, Gap in Code):** O Agente deve ser capaz de postar uma mensagem em um tópico específico no fórum de um projeto.

#### 1.4.8. Busca (`SearchTool` - encontrada em código como placeholder)
- **RF_TOOL_SEARCH_001 (Code - Placeholder):** O Agente deve ter acesso a uma ferramenta de busca (`SearchTool`). (A implementação atual é um placeholder).

### 1.5. Integração com LLM (`docs/funcional/llm-integration.md`)
- **RF_LLM_001 (Code):** O sistema deve permitir que Agentes utilizem LLMs para raciocínio e tomada de decisão, utilizando o `AgentInternalState` e o `ActivityContext`.
- **RF_LLM_002 (Code):** Tarefas específicas executadas por Agentes devem poder interagir com LLMs para gerar conteúdo, analisar informações ou determinar passos.
- **RF_LLM_003 (Documented, Partially Implemented):** O sistema deve permitir que o LLM solicite o uso de Tools disponíveis. O resultado da Tool deve ser retornado ao LLM. (A `AgentService` passa uma lista (atualmente hardcoded) de tools e um LLM para a task. O mecanismo detalhado de seleção e invocação pela LLM não foi totalmente explorado no código).
- **RF_LLM_004 (Code - Found `CreateLLMProviderConfigUseCase`):** O sistema deve permitir a configuração de provedores de LLM (ex: API keys, modelos).

### 1.6. Interface do Usuário (`docs/funcional/user-interface.md`)
- **RF_UI_001 (Code):** A UI deve permitir a visualização, criação e gerenciamento de projetos.
- **RF_UI_002 (Code):** A UI deve permitir a definição, configuração (onboarding) e listagem/monitoramento de Personas.
- **RF_UI_003 (Code):** A UI deve permitir a criação, atribuição e acompanhamento do progresso de Jobs/Activities.
- **RF_UI_004 (Code):** A UI deve fornecer meios para comunicação entre usuários e Personas (ex: chat).
- **RF_UI_005 (Code):** A UI deve apresentar um tema inspirado no Discord, com modos claro e escuro. (Confirmado por `globals.css` e análise de componentes).

### 1.7. Gerenciamento de Usuários (Baseado em `CreateUserUseCase`)
- **RF_USER_001 (Code):** O sistema deve permitir a criação de usuários. (Detalhes do que constitui um "usuário" - e.g. apenas um ID, ou com profile - não foram explorados).

## 2. Requisitos Não Funcionais (RNF)

Estes são baseados nos RNF do `product-requirements.md` original e na natureza do projeto.

- **RNF_PERF_001 (Performance):** O sistema deve processar um volume significativo de Jobs/Activities de forma eficiente, minimizando a latência na resposta da UI e na execução de tarefas dos agentes.
- **RNF_REL_001 (Confiabilidade):** O sistema deve ser resiliente a falhas. Jobs devem ser processados corretamente ou marcados como falha após as retentativas configuradas. Deve haver integridade dos dados para estados de Jobs e Agentes.
- **RNF_SCALE_001 (Escalabilidade):** A arquitetura deve permitir a escalabilidade do WorkerPool (potencialmente horizontal) para lidar com um aumento no número de Jobs e Agentes ativos.
- **RNF_MAINT_001 (Manutenibilidade):** O código deve ser claro, modular, bem documentado (código e documentação externa) e seguir rigorosamente os princípios da Clean Architecture e Object Calisthenics para facilitar a manutenção e evolução.
- **RNF_TEST_001 (Testabilidade):** A nova implementação deve ser projetada para ser facilmente testável em todas as camadas (unitário, integração, E2E onde aplicável). (Nota: ADR005 menciona que testes novos serão criados após a implementação da nova arquitetura).
- **RNF_USAB_001 (Usabilidade):** A interface do usuário deve ser intuitiva e fácil de usar, especialmente para configurar Personas, gerenciar projetos e monitorar Jobs, minimizando a curva de aprendizado.
- **RNF_SEC_001 (Segurança):**
    - **RNF_SEC_001.1:** Dados sensíveis (ex: API keys para LLMs) devem ser armazenados e gerenciados de forma segura.
    - **RNF_SEC_001.2:** Se Tools como `TerminalTool` ou `FilesystemTool` forem implementadas, devem operar dentro de limites de segurança apropriados para evitar ações maliciosas ou destrutivas.
- **RNF_EXT_001 (Extensibilidade):** O sistema deve ser projetado para facilitar a adição de novas Tools para Agentes e, potencialmente, novos tipos de Agentes ou Tasks.
- **RNF_RES_001 (Consumo de Recursos):** Sendo uma aplicação desktop (Electron), o consumo de recursos (CPU, memória) deve ser otimizado para não impactar negativamente a máquina do usuário.
