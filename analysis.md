### Análise Detalhada da Codebase e Plano de Implementação para o Projeto "Project Wiz"

**Data da Análise:** 11 de agosto de 2025
**Diretório de Trabalho:** `D:\Documentos\Pessoal\Github\project-wiz`

Este documento apresenta uma **análise funcional detalhada, linha a linha**, da codebase do projeto "Project Wiz". O objetivo é comparar rigorosamente a implementação atual com os requisitos e planos detalhados nos documentos `10-memory-schema-normalized.md`, `11-final-implementation-plan.md`, `prd.md` e `README.md`, identificando conformidades, discrepâncias e lacunas. A partir desta análise, será proposto um plano arquitetural detalhado e uma lista de tarefas sequenciadas para a implementação completa do sistema.

---

#### 1. Análise Funcional Detalhada dos Componentes Existentes

##### 1.1. Schema de Memória (`src/main/schemas/memory.schema.ts`)

**Documentação de Referência:** `docs/10-memory-schema-normalized.md` (seção "Tabela Principal de Memória") e `docs/prd.md` (seção "7.1 Tabelas Principais" e "2.4 Sistema de Memória").

**Análise do Código (Funcionalidade, Tipos, Controles):**

Este arquivo define a estrutura do banco de dados para o sistema de memória, utilizando o Drizzle ORM para SQLite. A abordagem é de normalização, separando o conteúdo da memória de suas relações com agentes e projetos.

- **`memoryTable` (Tabela Principal de Memória):**
  - **`id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID())`**:
    - **Funcionalidade:** Identificador único para cada entrada de memória. `crypto.randomUUID()` garante IDs universais e únicos, essenciais para referências em outras tabelas.
    - **Tipo de Dado:** `TEXT` (string UUID).
    - **Controle:** `primaryKey()` impõe unicidade e indexação. `$defaultFn()` automatiza a geração do ID.
  - **`content: text("content").notNull()`**:
    - **Funcionalidade:** Armazena o texto bruto da memória (ex: "O agente X aprendeu a usar a ferramenta Y").
    - **Tipo de Dado:** `TEXT` (string).
    - **Controle:** `notNull()` garante que toda entrada de memória tenha conteúdo.
  - **`// embedding: text("embedding"), // Removed - vec0 handles embeddings separately`**:
    - **Funcionalidade:** Este comentário é crucial. Indica que a responsabilidade de armazenar embeddings (representações vetoriais do texto para busca semântica) foi delegada a uma extensão `vec0` do SQLite, conforme o `prd.md`. Isso evita a duplicação de dados e otimiza o armazenamento de vetores.
    - **Integração:** Implica que o `MemoryService` ou outro serviço será responsável por gerar e interagir com `vec0` para gerenciar esses embeddings.
  - **`createdBy: text("created_by").notNull().references(() => usersTable.id)`**:
    - **Funcionalidade:** Registra qual usuário (ou agente, já que agentes são usuários no sistema) criou esta entrada de memória.
    - **Tipo de Dado:** `TEXT` (string UUID, referenciando `usersTable.id`).
    - **Controle:** `notNull()` garante a autoria. `references(() => usersTable.id)` impõe integridade referencial, garantindo que o `createdBy` seja um ID de usuário válido.
  - **`createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('subsec') \* 1000)`)`**:
    - **Funcionalidade:** Timestamp da criação da memória, essencial para ordenação cronológica e para o `MemoryService` recuperar memórias mais recentes.
    - **Tipo de Dado:** `INTEGER` (timestamp em milissegundos).
    - **Controle:** `notNull()` e `default()` garantem que o timestamp seja sempre registrado automaticamente.
  - **Índices (`createdByIdx`, `createdAtIdx`):**
    - **Funcionalidade:** Otimizam a performance de consultas que filtram ou ordenam por criador ou data de criação.
- **Tabelas de Ligação (`agentMemoryTable`, `teamMemoryTable`, `projectMemoryTable`):**
  - **Funcionalidade:** Estas tabelas implementam o conceito de "memória por nível" (`agent`, `team`, `project`) através de relações muitos-para-muitos entre `memoryTable` e `usersTable` (para agentes) ou `projectsTable` (para equipes/projetos).
  - **`memoryId` e `agentId`/`projectId`:**
    - **Funcionalidade:** Chaves estrangeiras que ligam uma entrada de memória a um agente, equipe ou projeto específico.
    - **Tipo de Dado:** `TEXT` (string UUID).
    - **Controle:** `notNull()` garante a ligação. `references(..., { onDelete: "cascade" })` é um controle crucial: se uma memória principal, um usuário/agente ou um projeto for excluído, as entradas correspondentes nessas tabelas de ligação também serão automaticamente removidas, mantendo a integridade e evitando "memórias órfãs", conforme `10-memory-schema-normalized.md`.
  - **`pk: primaryKey({ columns: [...] })`:**
    - **Funcionalidade:** Define uma chave primária composta, garantindo que uma mesma memória não possa ser associada múltiplas vezes ao mesmo agente/projeto no mesmo nível.
  - **Índices (`agentIdx`, `projectIdx`):**
    - **Funcionalidade:** Otimizam a busca por todas as memórias associadas a um agente ou projeto específico.
- **Tipos Exportados (`SelectMemory`, `InsertMemory`, etc.):**
  - **Funcionalidade:** Fornecem tipagem forte para as operações de banco de dados com Drizzle ORM, melhorando a segurança e a legibilidade do código que interage com esses schemas.

**Conclusão para `src/main/schemas/memory.schema.ts`:**
Em suma, o schema de memória (`src/main/schemas/memory.schema.ts`) está **totalmente em conformidade** com a documentação. Sua implementação é robusta, normalizada e segue as melhores práticas de banco de dados, garantindo integridade referencial e performance. A decisão de externalizar os embeddings para `vec0` é um ponto chave de integração arquitetural, alinhada com o `prd.md`.

##### 1.2. Serviço de Memória (`src/worker/services/memory.service.ts`)

**Documentação de Referência:** `docs/10-memory-schema-normalized.md` (seção "Service para Gerenciar Memória") e `docs/prd.md` (seções "2.4 Sistema de Memória" e "7.2 Vector Search (vec0)").

**Análise do Código (Funcionalidade, Tipos, Controles, Integrações):**

Este serviço é a interface principal para interagir com o sistema de memória, encapsulando a lógica de persistência e recuperação, incluindo a busca semântica.

- **Importações e Configuração Inicial:**
  - **`createDatabaseConnection`, `getDatabase`**:
    - **Funcionalidade:** Estabelece a conexão com o banco de dados SQLite.
    - **Integração:** Conecta o serviço ao banco de dados. O segundo parâmetro `false` em `createDatabaseConnection(true, false)` indica que a extensão `vec0` não é carregada diretamente por este serviço, mas sim pelo `VectorService`.
  - **Tabelas de Memória (`memoryTable`, etc.):**
    - **Funcionalidade:** Permite que o serviço interaja com as definições de schema.
  - **`VectorService`**:
    - **Funcionalidade:** Este é o ponto de integração com a funcionalidade de embeddings e busca vetorial (`vec0`). O `MemoryService` delega a geração e armazenamento/busca de embeddings ao `VectorService`.
    - **Integração:** Acoplamento direto com o `VectorService` para operações de IA/vetoriais.
  - **`getLogger`**:
    - **Funcionalidade:** Ferramenta para logging, essencial para depuração e monitoramento do fluxo de memória.
- **`MemoryLevel` Type:**
  - **Funcionalidade:** Define os níveis de granularidade da memória (`agent`, `team`, `project`), controlando como a memória é categorizada e armazenada nas tabelas de ligação.
- **`static async save(content, level, createdBy, context)` Método:**
  - **Funcionalidade:** Persiste uma nova entrada de memória no banco de dados.
  - **Fluxo de Dados:**
    1.  Gera um `memoryId` (UUID).
    2.  Insere `id`, `content`, `createdBy`, `createdAt` na `memoryTable`.
    3.  **Integração `vec0`:** Tenta gerar um embedding para o `content` usando `VectorService.generateEmbedding(content)` e armazena-o via `VectorService.storeEmbedding(memoryId, embeddingVector)`.
        - **Controle:** Um bloco `try-catch` envolve a operação de embedding. Se falhar (ex: modelo de embedding indisponível), um `logger.warn` é emitido, mas a operação de salvamento da memória _continua_ sem o embedding. Isso garante que a memória seja salva mesmo que a funcionalidade de busca semântica não esteja disponível para ela.
    4.  Com base no `level` (`agent`, `team`, `project`), insere o `memoryId` e o `agentId`/`projectId` correspondente na tabela de ligação apropriada (`agentMemoryTable`, `teamMemoryTable`, `projectMemoryTable`).
  - **Tipos de Dados:** `content` (string), `level` (enum `MemoryLevel`), `createdBy` (string UUID), `context` (objeto com `agentId` ou `projectId` - string UUID). Retorna `Promise<string>` (o `memoryId`).
  - **Controles:** Validações `if (!context.agentId)` ou `if (!context.projectId)` garantem que o `context` necessário para cada nível de memória seja fornecido, lançando erros se ausente.
- **`static async getByLevel(level, context, limit)` Método:**
  - **Funcionalidade:** Recupera entradas de memória de um nível específico, com suporte opcional a busca semântica.
  - **Fluxo de Dados:**
    1.  Constrói uma query Drizzle ORM para selecionar `id`, `content` e `createdAt` da `memoryTable`, realizando um `innerJoin` com a tabela de ligação correta (`agentMemoryTable`, `teamMemoryTable`, `projectMemoryTable`) e filtrando pelo `agentId` ou `projectId` do `context`.
    2.  **Controle:** Se `context.query` não for fornecido, o método retorna as memórias mais recentes (limitadas por `limit`) ordenadas por `createdAt`.
    3.  **Integração `vec0` (Busca Semântica):** Se `context.query` for fornecido:
        - Gera um embedding para a `query` do usuário usando `VectorService.generateEmbedding(context.query)`.
        - Usa `VectorService.findSimilar(queryEmbedding, limit, 0.3)` para encontrar IDs de memória e suas distâncias de similaridade.
        - Filtra as memórias inicialmente recuperadas para incluir apenas as que têm embeddings similares.
        - Calcula um score de `similarity` (1 - distância) e ordena os resultados por este score.
        - **Controle:** Um bloco `try-catch` lida com falhas na busca semântica, retornando as memórias mais recentes como fallback.
  - **Tipos de Dados:** `level` (enum `MemoryLevel`), `context` (objeto com `agentId` ou `projectId` - string UUID, e `query` opcional - string), `limit` (number). Retorna `Promise<Array<{ id: string; content: string; createdAt: Date; similarity?: number }>>`.
- **`static async getRelevantMemories(agentId, projectId, query, limit)` Método:**
  _ **Funcionalidade:** Orquestra a recuperação de memórias relevantes de todos os níveis (`agent`, `team`, `project`) para um dado agente e projeto, com suporte a busca semântica.
  _ **Fluxo de Dados:** 1. Chama `getByLevel` para memórias do agente. 2. Se `projectId` for fornecido, chama `getByLevel` para memórias de equipe e projeto em paralelo usando `Promise.all`. 3. Divide o `limit` igualmente entre os níveis de memória (`Math.ceil(limit / 3)`). \* **Tipos de Dados:** `agentId` (string UUID), `projectId` (string UUID, opcional), `query` (string, opcional), `limit` (number). Retorna `Promise<{ agent: Array<...>, team: Array<...>, project: Array<...> }>`.n
  **Conclusão para `src/worker/services/memory.service.ts`:**
  Em síntese, o `MemoryService` (`src/worker/services/memory.service.ts`) está **altamente em conformidade** com a documentação. Ele implementa a lógica de persistência e recuperação de memória por níveis, e sua integração com o `VectorService` para embeddings e busca semântica é um ponto forte, demonstrando a capacidade de lidar com conhecimento contextual avançado. Os controles de validação e os fallbacks para busca semântica garantem a robustez do serviço.

##### 1.3. Schema de Jobs (`src/worker/schemas/job.schema.ts`)

**Documentação de Referência:** `docs/11-final-implementation-plan.md` (seção "3.2 Jobs Schema (Renomeado)") e `docs/prd.md` (seções "7.1 Tabelas Principais" e "2.2 Sistema de Jobs/Tasks").

**Análise do Código (Funcionalidade, Tipos, Controles):**

Este arquivo define a estrutura da tabela de jobs, que é o coração do sistema de agendamento e execução de tarefas.

- **`export const jobsTable = sqliteTable("llm_jobs", ...)`**:
  - **Funcionalidade:** Define a tabela que armazenará todos os jobs do sistema.
  - **Discrepância:** O nome da tabela é `"llm_jobs"`. A documentação (`11-final-implementation-plan.md`) exige que seja `"jobs"`. Esta é uma **inconsistência direta** que afeta a clareza e a conformidade com o plano.
- **`id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID())`**:
  - **Funcionalidade:** Identificador único para cada job.
  - **Tipo de Dado:** `TEXT` (string UUID).
  - **Controle:** `primaryKey()` e `defaultFn()` garantem unicidade e geração automática.
- **`name: text("name").notNull()`**:
  - **Funcionalidade:** Define o tipo ou nome do job (ex: "dispatcher", "management", "work"). Essencial para o `JobRouter` e processadores.
  - **Tipo de Dado:** `TEXT` (string).
  - **Controle:** `notNull()` garante que todo job tenha um tipo.
- **`data: text("data").notNull()`**:
  - **Funcionalidade:** Armazena os dados específicos do job em formato JSON (ex: `messageId`, `projectId` para um job de dispatcher).
  - **Tipo de Dado:** `TEXT` (string JSON).
  - **Controle:** `notNull()` garante que todo job tenha dados associados.
- **`opts: text("opts")`**:
  - **Funcionalidade:** Armazena opções adicionais do job (ex: `delay`, `attempts`, `priority`), também em JSON.
  - **Tipo de Dado:** `TEXT` (string JSON, opcional).
- **`priority: integer("priority").notNull().default(0)`**:
  - **Funcionalidade:** Define a prioridade de execução do job. Jobs com maior prioridade são processados antes.
  - **Tipo de Dado:** `INTEGER`.
  - **Controle:** `notNull()` e `default(0)` garantem um valor padrão.
- **`status: text("status").$type<...>().notNull().default("waiting")`**:
  - **Funcionalidade:** Indica o estado atual do job no ciclo de vida (`waiting`, `active`, `completed`, `failed`, `delayed`, `paused`).
  - **Tipo de Dado:** `TEXT` (enum string).
  - **Controle:** `$type<...>()` fornece segurança de tipo para os estados. `notNull()` e `default("waiting")` garantem um estado inicial.
- **`progress`, `attempts`, `maxAttempts`, `delay`**:
  - **Funcionalidade:** Gerenciam o progresso, número de tentativas, limite de tentativas e atraso na execução do job. Essenciais para o sistema de retry e agendamento.
  - **Tipo de Dado:** `INTEGER`.
  - **Controle:** Valores padrão garantem inicialização.
- **`parentJobId: text("parent_job_id").references((): any => jobsTable.id, { onDelete: "set null", })`**:
  - **Funcionalidade:** Permite a criação de uma hierarquia de jobs (jobs filhas de jobs mães).
  - **Tipo de Dado:** `TEXT` (string UUID).
  - **Controle:** `references(..., { onDelete: "set null" })` garante que, se um job pai for excluído, o `parentJobId` dos jobs filhos seja definido como `NULL`, mantendo os filhos, mas desvinculando-os do pai.
- **`dependencyCount: integer("dependency_count").notNull().default(0)`**:
  - **Funcionalidade:** Usado para gerenciar dependências entre jobs, indicando quantos jobs dependentes ainda precisam ser concluídos antes que este job possa prosseguir.
  - **Tipo de Dado:** `INTEGER`.
- **`result`, `failureReason`, `stacktrace`**:
  - **Funcionalidade:** Armazenam o resultado da execução do job, a razão da falha e o stacktrace em caso de erro. Essenciais para depuração e auditoria.
  - **Tipo de Dado:** `TEXT` (string JSON para `result`).
- **Timestamps (`createdAt`, `processedOn`, `finishedOn`):**
  - **Funcionalidade:** Registram os momentos chave no ciclo de vida do job, cruciais para monitoramento, performance e ordenação.
  - **Tipo de Dado:** `INTEGER` (timestamp em milissegundos).
- **Índices:**
  - **Funcionalidade:** Otimizam a performance de consultas comuns no sistema de fila (ex: buscar jobs `waiting` com alta prioridade, buscar jobs por `parentJobId`).
  - **Discrepância:** Os nomes dos índices usam o prefixo `llm_jobs_` (ex: `llm_jobs_queue_processing_idx`), o que é uma consequência da não renomeação da tabela. Isso também precisará ser corrigido para alinhar com o plano.
- **Tipos Exportados (`SelectJob`, `InsertJob`, `JobStatus`, `JobData`, `JobOptions`, `JobResult`):**
  - **Funcionalidade:** Fornecem tipagem forte para as operações de banco de dados e para a manipulação de dados de jobs no código, melhorando a segurança e a legibilidade.

**Conclusão para `src/worker/schemas/job.schema.ts`:**
Em resumo, o schema de jobs (`src/worker/schemas/job.schema.ts`) é **funcionalmente completo e bem projetado** para um sistema de fila e execução de tarefas, com suporte a prioridade, status, retries e hierarquia. Contudo, a **não conformidade no nome da tabela (`"llm_jobs"` em vez de `"jobs"`) e nos prefixos dos índices** representa uma discrepância clara em relação ao plano de implementação e exige correção.

---

#### 2. Análise Funcional Detalhada dos Componentes Ausentes

Esta seção descreve os componentes que são cruciais para a arquitetura do sistema conforme a documentação, mas que **não foram encontrados** na codebase. Para cada um, será detalhada sua funcionalidade esperada, tipos de dados, integrações e controles, conforme o plano.

##### 2.1. Processadores de Jobs

**Documentação de Referência:** `docs/11-final-implementation-plan.md` (seção "FASE 1: Processadores de Jobs") e `docs/prd.md` (seções "2.2 Sistema de Jobs/Tasks", "3.1 Dispatcher Inteligente").

Estes são os "cérebros" que executam a lógica de negócios principal do sistema de agentes.

- **`src/worker/processors/dispatcher-processor.ts`**
  - **Funcionalidade Esperada:** Analisar mensagens de entrada (do usuário ou de outros agentes) e decidir qual(is) agente(s) deve(m) responder ou ser acionado(s). Previne o "flood" de mensagens e orquestra o início do trabalho.
  - **Fluxo de Dados Esperado:**
    1.  Recebe um `DispatcherJobData` (contendo `messageId`, `messageContent`, `projectId`, `channelId`, `authorId`).
    2.  Consulta o banco de dados para obter agentes do projeto e o provedor LLM mais barato (ex: Deepseek).
    3.  Usa um modelo LLM (via `generateObject` do Vercel AI SDK) com um prompt que inclui a mensagem, agentes disponíveis e autor.
    4.  O LLM gera um objeto com `selectedUsers` (IDs dos agentes), `waitForUser` (booleano) e `delaySeconds` (número).
    5.  Cria jobs de gerenciamento (`managementQueue.add`) para os `selectedUsers`, com um atraso (`delay`) se `waitForUser` for verdadeiro.
  - **Tipos de Dados Esperados:**
    - Entrada: `DispatcherJobData` (interface com `messageId: string`, `messageContent: string`, `projectId: string`, `channelId: string`, `authorId: string`).
    - Saída: Objeto com `selectedUsers: string[]`, `waitForUser?: boolean`, `delaySeconds?: number`.
  - **Integrações Esperadas:** `QueueClient` (para `management` queue), `loadProvider` (para LLM), `getDatabase` (para agentes e provedores), Vercel AI SDK (`generateObject`).
  - **Controles Esperados:** Validação da existência do provedor LLM. Lógica condicional para `delay` na criação de jobs.

- **`src/worker/processors/management-processor.ts`**
  - **Funcionalidade Esperada:** Coordena as ações de um agente em um nível mais alto, sem executar código diretamente. Traduz intenções em tarefas de trabalho ou comunicação.
  - **Fluxo de Dados Esperado:**
    1.  Recebe um `ManagementJobData` (contendo `agentId`, `projectId`, `messageId` opcional, `type` de job, `context` opcional).
    2.  Obtém informações do agente e seu provedor LLM.
    3.  Se `messageId` presente, recupera o conteúdo da mensagem para contexto.
    4.  Define um conjunto de "tools" que o LLM pode chamar:
        - `createTask`: Cria um job de trabalho (`workQueue.add`) com descrição e prioridade.
        - `sendMessage`: Envia uma mensagem para o canal do projeto.
        - `reviewProjectStatus`: Consulta o status de jobs ativas.
    5.  Usa um modelo LLM (via `generateText` do Vercel AI SDK) com um `system` prompt (papel do agente) e um `prompt` (tipo e contexto da tarefa), permitindo que o LLM chame as "tools" definidas.
  - **Tipos de Dados Esperados:**
    - Entrada: `ManagementJobData` (interface com `agentId: string`, `projectId: string`, `messageId?: string`, `type: 'analyze_message' | 'periodic_checkin' | 'review_project'`, `context?: any`).
    - Saída: Resultado da execução do LLM (texto gerado ou chamadas de ferramentas).
  - **Integrações Esperadas:** `QueueClient` (para `work` queue), `loadProvider` (para LLM), `getDatabase` (para agentes, provedores, mensagens), Vercel AI SDK (`generateText`, `tool`).
  - **Controles Esperados:** Validação da existência do agente. Lógica para recuperar contexto da mensagem. Definição clara das ferramentas disponíveis para o LLM.

- **`src/worker/processors/work-processor.ts`**
  - **Funcionalidade Esperada:** Executa as tarefas de trabalho reais, interagindo com o sistema de arquivos e o sistema de memória. Opera dentro de um `worktree` Git isolado.
  - **Fluxo de Dados Esperado:**
    1.  Recebe um `WorkJobData` (contendo `agentId`, `projectId`, `description`, `parentJobId` opcional, `worktreePath` opcional).
    2.  Obtém informações do agente e seu provedor LLM.
    3.  **Gerenciamento de Worktree:** Se `worktreePath` não for fornecido, herda do job pai ou cria um novo `worktree` usando `gitManager.createWorktree`.
    4.  Define um conjunto de "tools" que o LLM pode chamar:
        - `readFile`, `writeFile`, `listFiles`: Interagem com o sistema de arquivos dentro do `worktree`.
        - `createChildJobs`: Cria sub-tarefas, pausando o job pai.
        - `addNote`: Adiciona anotações temporárias ao job.
        - `saveMemory`: Salva conhecimento na memória usando `MemoryService.save`.
    5.  Carrega memórias relevantes (`agent`, `team`, `project`) usando `MemoryService.getRelevantMemories` para fornecer contexto ao LLM.
    6.  Usa um modelo LLM (via `generateText` do Vercel AI SDK) com um `system` prompt (papel do agente e memórias relevantes) e um `prompt` (descrição da tarefa), permitindo que o LLM chame as "tools" definidas.
    7.  **Integração Git:** Após a conclusão do job (se for um job principal e o LLM parar), o `gitManager.commitChanges` é chamado, e um job de merge é enfileirado para o sistema.
  - **Tipos de Dados Esperados:**
    - Entrada: `WorkJobData` (interface com `agentId: string`, `projectId: string`, `description: string`, `parentJobId?: string`, `worktreePath?: string`).
    - Saída: Resultado da execução do LLM, incluindo o `worktreePath`.
  - **Integrações Esperadas:** `QueueClient` (para `work` e `system` queues), `loadProvider` (para LLM), `getDatabase` (para agentes, provedores, jobs), `MemoryService`, `gitManager`, Vercel AI SDK (`generateText`, `tool`), `path`, `fs/promises`.
  - **Controles Esperados:** Lógica para herdar/criar worktree. Pausar/retomar jobs pais. Gerenciamento de arquivos dentro do worktree. Commit e merge automáticos após a conclusão do job principal.

##### 2.2. Git Manager

**Documentação de Referência:** `docs/11-final-implementation-plan.md` (seção "FASE 2: Serviços Auxiliares") e `docs/prd.md` (seções "2.1 Estrutura de Projetos", "12.2 Gestão de Worktrees").

Este serviço encapsula todas as operações Git, garantindo que os agentes interajam com o repositório de forma controlada e segura, utilizando worktrees para isolamento.

- **`src/worker/services/git-manager.ts`**
  - **Funcionalidade Esperada:** Gerenciar worktrees (criação, remoção), realizar commits, e integrar branches de trabalho na branch principal.
  - **Métodos Esperados:**
    - **`createWorktree(projectId: string, jobId: string): Promise<string>`**:
      - **Funcionalidade:** Cria um novo worktree Git para um job específico dentro do diretório do projeto. Isso isola as mudanças do job.
      - **Integração:** Utiliza `simple-git`.
      - **Controle:** Cria uma nova branch (`job-${jobId}`) para o worktree.
    - **`removeWorktree(worktreePath: string): Promise<void>`**:
      - **Funcionalidade:** Remove um worktree Git.
      - **Integração:** Utiliza `simple-git`.
    - **`commitChanges(worktreePath: string, message: string): Promise<boolean>`**:
      - **Funcionalidade:** Adiciona todas as mudanças no worktree e cria um commit com a mensagem fornecida.
      - **Integração:** Utiliza `simple-git`.
      - **Controle:** Verifica se há arquivos para commitar antes de prosseguir.
    - **`mergeToMain(projectPath: string, jobBranch: string): Promise<void>`**:
      - **Funcionalidade:** Faz o merge de uma branch de job na branch `main` do projeto e, em seguida, exclui a branch de job.
      - **Integração:** Utiliza `simple-git`.
    - **`getConflicts(worktreePath: string): Promise<string[]>`**:
      - **Funcionalidade:** Retorna uma lista de arquivos em conflito após uma operação de merge.
      - **Integração:** Utiliza `simple-git`.
  - **Tipos de Dados Esperados:** Caminhos (string), mensagens (string), listas de arquivos (string[]).
  - **Integrações Esperadas:** `simple-git` (biblioteca para interagir com Git).
  - **Controles Esperados:** Lidar com diretórios de projetos e worktrees. Logs para operações Git.

##### 2.3. Job Router

**Documentação de Referência:** `docs/11-final-implementation-plan.md` (seção "FASE 4: Integração").

Este componente é o orquestrador que direciona os jobs recebidos para o processador correto com base no tipo de job.

- **`src/worker/processors/job-router.ts`**
  - **Funcionalidade Esperada:** Receber um job e encaminhá-lo para o processador (`dispatcherProcessor`, `managementProcessor`, `workProcessor`) correspondente ao seu `job.name`.
  - **Fluxo de Dados Esperado:**
    1.  Recebe um objeto `Job` (do schema de jobs).
    2.  Usa um mapa ou `switch` para encontrar o processador associado ao `job.name`.
    3.  Chama a função do processador com o objeto `Job`.
  - **Tipos de Dados Esperados:** Entrada: `Job` (interface do schema de jobs).
  - **Integrações Esperadas:** `dispatcherProcessor`, `managementProcessor`, `workProcessor` (importações diretas).
  - **Controles Esperados:** Lançar um erro se o tipo de job for desconhecido. Logs para roteamento de jobs.

##### 2.4. Message Job Creator

**Documentação de Referência:** `docs/11-final-implementation-plan.md` (seção "FASE 4: Integração").

Este serviço atua como o ponto de entrada para o sistema de jobs, convertendo eventos de criação de mensagens em jobs de dispatcher.

- **`src/main/services/message-job-creator.ts`**
  - **Funcionalidade Esperada:** Escutar eventos de criação de mensagens (`message:created`) e, para cada nova mensagem, criar e adicionar um job do tipo `dispatcher` à fila.
  - **Fluxo de Dados Esperado:**
    1.  Inicializa uma instância de `QueueClient` para a fila `dispatcher`.
    2.  No método `initialize()`, subscreve-se ao evento `message:created` do `eventBus`.
    3.  Quando o evento é disparado, extrai os dados relevantes da mensagem (`messageId`, `messageContent`, `projectId`, `channelId`, `authorId`).
    4.  Adiciona um novo job à fila `dispatcher` com esses dados.
  - **Tipos de Dados Esperados:** Entrada: Objeto de evento com `message` (contendo `id`, `content`, `projectId`, `channelId`, `authorId`).
  - **Integrações Esperadas:** `eventBus` (para escutar eventos), `QueueClient` (para adicionar jobs à fila `dispatcher`).
  - **Controles Esperados:** Tratamento de erros ao adicionar jobs à fila. Logs para criação de jobs.

---

#### 3. Arquitetura Detalhada do Sistema e Fluxo de Dados

A arquitetura do "Project Wiz" é baseada em um sistema de agentes autônomos que interagem com o código e entre si através de um sistema de jobs e memória.

**Componentes Principais:**

1.  **Frontend (Electron/React):** Interface do usuário (Discord-like) para interação com projetos e agentes.
2.  **Main Process (Node.js):** Gerencia a aplicação Electron, IPC, e serviços de alto nível como `MessageJobCreator`.
3.  **Worker Process (Node.js):** Processa os jobs em segundo plano, contendo a lógica dos agentes e serviços auxiliares.
4.  **Banco de Dados (SQLite com Drizzle ORM):** Armazena dados de projetos, usuários, mensagens, jobs e memória.
5.  **Vector Search (vec0):** Extensão SQLite para busca semântica de embeddings.
6.  **LLM Providers:** Modelos de linguagem (via Vercel AI SDK) usados pelos agentes e pelo dispatcher.
7.  **Git (simple-git):** Gerenciamento de repositórios e worktrees.

**Fluxo de Dados Principal (Mensagem do Usuário -> Ação do Agente):**

1.  **Mensagem do Usuário:**
    - O usuário envia uma mensagem através do Frontend.
    - A mensagem é salva no Banco de Dados (`messagesTable`).
    - Um evento `message:created` é disparado pelo `eventBus`.
2.  **Criação do Job de Dispatcher (`MessageJobCreator`):**
    - O `MessageJobCreator` (no Main Process) escuta o evento `message:created`.
    - Ele cria um job do tipo `dispatcher` e o adiciona à fila `dispatcher` (via `QueueClient`).
3.  **Processamento do Job de Dispatcher (`DispatcherProcessor`):**
    - Um Worker (no Worker Process) pega o job `dispatcher` da fila.
    - O `DispatcherProcessor` analisa a mensagem, consulta agentes disponíveis e usa um LLM (via `loadProvider` e `generateObject`) para decidir qual(is) agente(s) deve(m) ser acionado(s).
    - Ele cria um ou mais jobs do tipo `management` e os adiciona à fila `management` (via `QueueClient`), possivelmente com um `delay` se for para esperar a resposta do usuário.
4.  **Processamento do Job de Management (`ManagementProcessor`)::**
    - Um Worker pega um job `management` da fila.
    - O `ManagementProcessor` usa um LLM (via `loadProvider` e `generateText`) para que o agente decida o que fazer (ex: criar uma tarefa de trabalho, enviar uma mensagem).
    - O LLM pode chamar "tools" como `createTask` (que adiciona um job `work` à fila `work`) ou `sendMessage` (que insere uma mensagem no banco de dados).
5.  **Processamento do Job de Work (`WorkProcessor`):**
    - Um Worker pega um job `work` da fila.
    - O `WorkProcessor` gerencia um `worktree` Git isolado para o job (criando-o via `gitManager.createWorktree` se necessário, ou herdando do pai).
    - O LLM do agente (via `loadProvider` e `generateText`) recebe a descrição da tarefa e memórias relevantes (via `MemoryService.getRelevantMemories`).
    - O LLM chama "tools" para interagir com o sistema de arquivos (`readFile`, `writeFile`, `listFiles`), criar sub-tarefas (`createChildJobs`), ou salvar conhecimento (`saveMemory` via `MemoryService.save`).
    - **Iteração:** Cada job de trabalho executa em "steps" (`maxSteps: 1` no `generateText`), retornando à fila após cada step para permitir o multitasking.
6.  **Conclusão do Job de Work e Integração Git:**
    - Quando um job `work` principal é concluído, o `WorkProcessor` usa `gitManager.commitChanges` para commitar as alterações no `worktree`.
    - Um job do tipo `merge_worktree` é adicionado a uma fila `system` (via `QueueClient`).
7.  **Merge e Limpeza Git (`GitManager` e System Queue):**
    - Um processador na fila `system` (não detalhado nos docs, mas implícito) usaria `gitManager.mergeToMain` para integrar as mudanças na branch principal do projeto.
    - `gitManager.removeWorktree` seria usado para limpar o worktree após o merge.
8.  **Sistema de Memória (`MemoryService` e `vec0`):**
    - O `MemoryService` é usado pelos processadores (principalmente `WorkProcessor`) para salvar e recuperar conhecimento.
    - Ele interage com o `VectorService` para gerar e armazenar embeddings em `vec0` e para realizar buscas semânticas, fornecendo contexto relevante aos agentes.

**Controles e Considerações Chave:**

- **Priorização de Jobs:** Jobs de gerenciamento têm prioridade sobre jobs de trabalho.
- **Hierarquia de Jobs:** Jobs pais podem pausar e criar jobs filhos que compartilham o mesmo `worktree`.
- **Isolamento de Trabalho:** Worktrees Git garantem que as mudanças de um job não interfiram em outros trabalhos.
- **Resiliência:** Retries para jobs falhos. Fallbacks para busca semântica.
- **Contexto para LLMs:** Memórias relevantes (agente, equipe, projeto) e contexto da mensagem são fornecidos aos LLMs.
- **Comunicação:** Agentes podem enviar mensagens para canais ou DMs.
- **Autonomia:** Agentes podem se auto-gerenciar e realizar check-ins periódicos.

---

#### 4. Plano de Implementação Detalhado (Tasks e Subtasks para um Dev Júnior)

Este plano é sequenciado logicamente, com tarefas e subtarefas claras, como se fossem executadas por um desenvolvedor júnior.

**Fase 1: Preparação e Base de Dados**

- **Task 1.1: Alinhar o Schema de Jobs**
  - **Objetivo:** Renomear a tabela de jobs para `jobs` e corrigir os nomes dos índices para refletir essa mudança, conforme `11-final-implementation-plan.md`.
  - **Subtasks:**
    - **1.1.1:** Abrir `src/worker/schemas/job.schema.ts`.
    - **1.1.2:** Localizar `sqliteTable("llm_jobs", ...)` e mudar `"llm_jobs"` para `"jobs"`.
    - **1.1.3:** Localizar todas as definições de `index(...)` dentro do `jobsTable` (ex: `index("llm_jobs_queue_processing_idx")`).
    - **1.1.4:** Para cada índice, remover o prefixo `llm_` do nome (ex: `index("jobs_queue_processing_idx")`).
    - **1.1.5:** Salvar o arquivo.
    - **1.1.6:** (Opcional, mas recomendado) Executar o comando de migração do Drizzle ORM para gerar um novo arquivo de migração que reflita essa mudança no banco de dados. (Ex: `drizzle-kit generate:sqlite` ou similar, dependendo da configuração do projeto).
    - **1.1.7:** (Opcional, mas recomendado) Aplicar a migração no banco de dados de desenvolvimento.

**Fase 2: Serviços Auxiliares Essenciais**

- **Task 2.1: Implementar o Git Manager**
  - **Objetivo:** Criar o serviço que encapsula todas as operações Git, utilizando `simple-git`, conforme `11-final-implementation-plan.md`.
  - **Subtasks:**
    - **2.1.1:** Criar o arquivo `src/worker/services/git-manager.ts`.
    - **2.1.2:** Adicionar as importações necessárias: `import simpleGit, { SimpleGit } from 'simple-git';`, `import path from 'path';`, `import { getLogger } from '@/shared/services/logger/config';`.
    - **2.1.3:** Definir a classe `GitManager` com um construtor que inicializa `projectsDir` (ex: `process.env.PROJECTS_DIR || path.join(process.cwd(), 'projects')`).
    - **2.1.4:** Implementar o método `async createWorktree(projectId: string, jobId: string): Promise<string>`:
      - Calcular `projectPath` e `worktreePath`.
      - Inicializar `simpleGit(projectPath)`.
      - Executar `git.raw(['worktree', 'add', worktreePath, '-b', `job-${jobId}`])`.
      - Retornar `worktreePath`.
    - **2.1.5:** Implementar o método `async removeWorktree(worktreePath: string): Promise<void>`:
      - Inicializar `simpleGit(path.dirname(path.dirname(worktreePath)))` (para o repositório principal).
      - Executar `git.raw(['worktree', 'remove', worktreePath])`.
    - **2.1.6:** Implementar o método `async commitChanges(worktreePath: string, message: string): Promise<boolean>`:
      - Inicializar `simpleGit(worktreePath)`.
      - Obter `status = await git.status()`.
      - Se `status.files.length === 0`, retornar `false`.
      - Executar `await git.add('.')`.
      - Executar `await git.commit(message)`.
      - Retornar `true`.
    - **2.1.7:** Implementar o método `async mergeToMain(projectPath: string, jobBranch: string): Promise<void>`:
      - Inicializar `simpleGit(projectPath)`.
      - Executar `await git.checkout('main')`.
      - Executar `await git.merge([jobBranch])`.
      - Executar `await git.branch(['-d', jobBranch])`.
    - **2.1.8:** Implementar o método `async getConflicts(worktreePath: string): Promise<string[]>`:
      - Inicializar `simpleGit(worktreePath)`.
      - Obter `status = await git.status()`.
      - Retornar `status.conflicted`.
    - **2.1.9:** Exportar uma instância da classe: `export const gitManager = new GitManager();`.
    - **2.1.10:** Adicionar logs (`logger.info`) nas operações do `GitManager`.

**Fase 3: Processadores de Jobs (Coração do Sistema)**

- **Task 3.1: Implementar o Dispatcher Processor**
  - **Objetivo:** Criar o processador que roteia mensagens para agentes, conforme `11-final-implementation-plan.md`.
  - **Subtasks:**
    - **3.1.1:** Criar o arquivo `src/worker/processors/dispatcher-processor.ts`.
    - **3.1.2:** Adicionar importações: `generateObject`, `z`, `eq`, `and`, `QueueClient`, `loadProvider`, `getDatabase`, `usersTable`, `projectMembersTable`, `providersTable`, `JobFunction`, `Job`.
    - **3.1.3:** Definir a interface `DispatcherJobData`.
    - **3.1.4:** Implementar `export const dispatcherProcessor: JobFunction<DispatcherJobData, any> = async (job: Job<DispatcherJobData>) => { ... }`.
    - **3.1.5:** Dentro da função, obter `db`, `messageContent`, `projectId`, `authorId` do `job.data`.
    - **3.1.6:** Consultar `projectMembersTable` e `usersTable` para obter `projectAgents` (tipo `agent`).
    - **3.1.7:** Consultar `providersTable` para obter `dispatcherProvider` (ex: `name: 'deepseek'`). Lançar erro se não encontrado.
    - **3.1.8:** Carregar o modelo LLM usando `loadProvider`.
    - **3.1.9:** Chamar `generateObject` com o modelo, prompt (incluindo mensagem, agentes, autor) e schema (`z.object({ selectedUsers: z.array(z.string()), waitForUser: z.boolean().optional(), delaySeconds: z.number().optional().default(15) })`).
    - **3.1.10:** Criar uma instância de `QueueClient('management')`.
    - **3.1.11:** Iterar sobre `result.object.selectedUsers` e adicionar jobs à fila `management` com `agentId`, `projectId`, `messageId`, `type: 'analyze_message'`, e `delay` condicional.
    - **3.1.12:** Retornar `result.object`.

- **Task 3.2: Implementar o Management Processor**
  - **Objetivo:** Criar o processador que coordena as ações de alto nível dos agentes, conforme `11-final-implementation-plan.md`.
  - **Subtasks:**
    - **3.2.1:** Criar o arquivo `src/worker/processors/management-processor.ts`.
    - **3.2.2:** Adicionar importações: `generateText`, `tool`, `z`, `eq`, `QueueClient`, `loadProvider`, `getDatabase`, `messagesTable`, `agentsTable`, `providersTable`, `jobsTable`, `JobFunction`, `Job`.
    - **3.2.3:** Definir a interface `ManagementJobData`.
    - **3.2.4:** Implementar `export const managementProcessor: JobFunction<ManagementJobData, any> = async (job: Job<ManagementJobData>) => { ... }`.
    - **3.2.5:** Obter `db`, `agentId`, `projectId`, `messageId`, `type` do `job.data`.
    - **3.2.6:** Consultar `agentsTable` e `providersTable` para obter `agent` e `provider` do agente. Lançar erro se não encontrado.
    - **3.2.7:** Se `messageId` existir, consultar `messagesTable` para obter o `context` da mensagem.
    - **3.2.8:** Definir o objeto `tools` com `createTask`, `sendMessage`, `reviewProjectStatus` usando `tool({ description, parameters, execute })`.
      - `createTask.execute`: Adicionar job à fila `work` com `QueueClient('work')`.
      - `sendMessage.execute`: Inserir mensagem na `messagesTable`.
      - `reviewProjectStatus.execute`: Consultar `jobsTable` para jobs ativas.
    - **3.2.9:** Carregar o modelo LLM usando `loadProvider`.
    - **3.2.10:** Chamar `generateText` com o modelo, `system` prompt (papel do agente), `prompt` (tipo e contexto), e o objeto `tools`.
    - **3.2.11:** Retornar o resultado do `generateText`.

- **Task 3.3: Implementar o Work Processor**
  - **Objetivo:** Criar o processador que executa as tarefas de trabalho reais, conforme `11-final-implementation-plan.md`.
  - **Subtasks:**
    - **3.3.1:** Criar o arquivo `src/worker/processors/work-processor.ts`.
    - **3.3.2:** Adicionar importações: `generateText`, `tool`, `z`, `eq`, `path`, `fs/promises`, `QueueClient`, `loadProvider`, `getDatabase`, `agentsTable`, `providersTable`, `jobsTable`, `MemoryService`, `gitManager`, `JobFunction`, `Job`.
    - **3.3.3:** Definir a interface `WorkJobData`.
    - **3.3.4:** Implementar `export const workProcessor: JobFunction<WorkJobData, any> = async (job: Job<WorkJobData>) => { ... }`.
    - **3.3.5:** Obter `db`, `agentId`, `projectId`, `description`, `parentJobId` do `job.data`.
    - **3.3.6:** Consultar `agentsTable` e `providersTable` para obter `agent` e `provider`. Lançar erro se não encontrado.
    - **3.3.7:** Implementar a lógica de gerenciamento de `worktreePath`: herdar do pai ou criar novo com `gitManager.createWorktree`.
    - **3.3.8:** Definir o objeto `tools` com `readFile`, `writeFile`, `listFiles`, `createChildJobs`, `addNote`, `saveMemory` usando `tool({ description, parameters, execute })`.
      - `readFile.execute`: Usar `fs.readFile` com `path.join(worktreePath!, filePath)`.
      - `writeFile.execute`: Usar `fs.writeFile` com `path.join(worktreePath!, filePath)` e `fs.mkdir` recursivo.
      - `listFiles.execute`: Usar `fs.readdir` com `path.join(worktreePath!, dirPath)`.
      - `createChildJobs.execute`: Pausar job pai (`jobsTable`), criar jobs filhos na fila `work` com `QueueClient('work')`, passando `worktreePath`.
      - `addNote.execute`: Atualizar `result` do job na `jobsTable` com anotações.
      - `saveMemory.execute`: Chamar `MemoryService.save`.
    - **3.3.9:** Carregar memórias relevantes usando `MemoryService.getRelevantMemories`.
    - **3.3.10:** Carregar o modelo LLM usando `loadProvider`.
    - **3.3.11:** Chamar `generateText` com o modelo, `system` prompt (papel do agente e memórias), `prompt` (descrição da tarefa), e o objeto `tools`.
    - **3.3.12:** Se for um job principal (`!parentJobId`) e `result.finishReason === 'stop'`:
      - Chamar `gitManager.commitChanges(worktreePath!, ...)`
      - Adicionar job de merge à fila `system` com `QueueClient('system')`.
    - **3.3.13:** Retornar o resultado do `generateText` e `worktreePath`.

**Fase 4: Orquestração e Ponto de Entrada**

- **Task 4.1: Implementar o Job Router**
  - **Objetivo:** Criar o componente que direciona os jobs para o processador correto, conforme `11-final-implementation-plan.md`.
  - **Subtasks:**
    - **4.1.1:** Criar o arquivo `src/worker/processors/job-router.ts`.
    - **4.1.2:** Adicionar importações: `getLogger`, `dispatcherProcessor`, `managementProcessor`, `workProcessor`, `Job`, `JobFunction`.
    - **4.1.3:** Definir um objeto `processors` mapeando nomes de job para funções de processador.
    - **4.1.4:** Implementar `export async function routeJob(job: Job): Promise<any> { ... }`.
    - **4.1.5:** Dentro da função, obter o processador de `processors[job.name]`.
    - **4.1.6:** Se o processador não for encontrado, lançar um erro.
    - **4.1.7:** Chamar o processador com o `job` e retornar o resultado.

- **Task 4.2: Implementar o Message Job Creator**
  - **Objetivo:** Criar o serviço que inicia o fluxo de jobs a partir de novas mensagens, conforme `11-final-implementation-plan.md`.
  - **Subtasks:**
    - **4.2.1:** Criar o arquivo `src/main/services/message-job-creator.ts`.
    - **4.2.2:** Adicionar importações: `eventBus`, `QueueClient`, `getLogger`.
    - **4.2.3:** Definir a classe `MessageJobCreator`.
    - **4.2.4:** No construtor, inicializar `dispatcherQueue = new QueueClient('dispatcher')`.
    - **4.2.5:** Implementar o método `initialize(): void`:
      - Subscrever-se a `eventBus.on('message:created', async ({ message }) => { ... })`.
      - Dentro do callback, adicionar um job à `dispatcherQueue` com os dados da mensagem (`messageId`, `messageContent`, `projectId`, `channelId`, `authorId`).
      - Adicionar tratamento de erros (`try-catch`) e logs.

**Fase 5: Testes e Validação (Após a Implementação de Todas as Fases Anteriores)**

- **Task 5.1: Testes de Unidade e Integração**
  - **Objetivo:** Garantir que cada componente funcione isoladamente e que as integrações entre eles estejam corretas.
  - **Subtasks:**
    - **5.1.1:** Escrever testes de unidade para cada método do `GitManager`.
    - **5.1.2:** Escrever testes de unidade para cada processador (`dispatcher`, `management`, `work`), mockando as dependências externas (LLMs, filas, banco de dados).
    - **5.1.3:** Escrever testes de integração para o `JobRouter` e `MessageJobCreator`.
    - **5.1.4:** Executar todos os testes e corrigir quaisquer falhas.

- **Task 5.2: Teste End-to-End do Fluxo Principal**
  - **Objetivo:** Validar o fluxo completo do sistema, desde a entrada de uma mensagem até a execução de uma tarefa de trabalho e o commit no Git.
  - **Subtasks:**
    - **5.2.1:** Configurar um ambiente de teste com banco de dados limpo e repositório Git.
    - **5.2.2:** Iniciar os workers e o main process.
    - **5.2.3:** Simular o envio de uma mensagem (ex: via API ou diretamente no banco de dados se não houver UI).
    - **5.2.4:** Monitorar as filas de jobs (`dispatcher`, `management`, `work`, `system`) para verificar o progresso dos jobs.
    - **5.2.5:** Verificar a criação de worktrees no sistema de arquivos.
    - **5.2.6:** Verificar os commits no repositório Git do projeto.
    - **5.2.7:** Verificar as entradas de memória criadas no banco de dados.
    - **5.2.8:** Identificar e depurar quaisquer problemas no fluxo.
