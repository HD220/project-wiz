# Project Wiz Architectural Blueprint

## 1. Introdução

Este documento descreve a arquitetura proposta para o Projeto Wiz, uma aplicação desktop inovadora construída com ElectronJS. O objetivo é criar uma arquitetura sob medida que não apenas atenda aos requisitos funcionais complexos do projeto – gerenciamento de Agentes IA/Personas, Jobs, Ferramentas, Projetos, integração com LLMs e automação de fluxos de trabalho – mas também priorize a simplicidade, a experiência de desenvolvimento (DX), a manutenibilidade, a testabilidade e a extensibilidade. Esta arquitetura visa fornecer uma base sólida e flexível para o crescimento e evolução do Projeto Wiz.

## 2. Princípios Fundamentais e Influências

A arquitetura do Projeto Wiz é guiada pelos seguintes princípios e influências:

*   **Design Orientado ao Domínio (DDD):** Aplicar princípios de DDD (Entidades, Value Objects, Agregados, Repositórios, Serviços de Domínio) dentro dos módulos de negócios centrais para modelar com precisão o domínio complexo de agentes IA, jobs e projetos.
*   **Desenvolvimento Orientado por Comportamento (BDD):** Os cenários de comportamento do sistema (conforme identificados na Fase 1.2) servem como direcionadores para o design das interações entre os componentes.
*   **Modularidade:** O sistema é decomposto em módulos coesos e com baixo acoplamento, permitindo desenvolvimento e manutenção mais fáceis.
*   **Separação Clara de Processos Electron (Main/Renderer):** Respeitar e alavancar a arquitetura de múltiplos processos do Electron, garantindo que a lógica de UI (Renderer) seja distinta da lógica de negócios e do core (Main).
*   **Comunicação Explícita via IPC:** Interações entre os processos Main e Renderer são realizadas através de mecanismos de Comunicação Inter-Processos (IPC) bem definidos e, idealmente, tipados.
*   **Simplicidade e Pragmatismo:** Embora influenciada por padrões robustos, a arquitetura busca evitar complexidade desnecessária, favorecendo soluções pragmáticas que melhorem a DX e a manutenibilidade.
*   **Testabilidade:** Projetar módulos e componentes de forma que possam ser testados isoladamente (unitariamente) e em conjunto (integração).
*   **Extensibilidade:** A arquitetura deve facilitar a adição de novas Personas, Ferramentas, tipos de Jobs e funcionalidades com o mínimo de atrito.
*   **MVVM-like para UI:** A interação entre a UI (React) e a lógica do renderer será inspirada no padrão Model-View-ViewModel para uma clara separação de preocupações na camada de apresentação.
*   **Eventos para Desacoplamento Seletivo:** Utilizar um sistema de eventos no processo principal para desacoplar componentes e para notificar a UI sobre mudanças de estado assíncronas.

## 3. Estrutura Arquitetural Proposta

A arquitetura proposta é um **Monolito Modular Híbrido** para o processo principal do Electron, com uma interface de UI reativa no processo renderer.

### 3.1. Visão Geral de Alto Nível

O sistema é dividido nos seguintes módulos principais:

*   **Processo Main (Node.js):**
    1.  `ElectronMainBridge`: Gateway de IPC e interface para o processo renderer.
    2.  `ProjectWorkspace`: Gerencia projetos e seus recursos.
    3.  `PersonaManagement`: Gerencia configurações de Personas (agentes IA).
    4.  `JobOrchestration`: Gerencia o ciclo de vida e execução de Jobs.
    5.  `CoreAIServices`: Lógica de execução de agentes, ferramentas e interação com LLMs.
*   **Processo Renderer (Chromium - UI):**
    6.  `UserInterface`: Componentes React (Views), lógica de apresentação e estado da UI (ViewModels).

![Conceptual Diagram - Placeholder: A diagram would show Renderer (UserInterface with Views/ViewModels) talking via IPC to Main (ElectronMainBridge), which then routes to other Main modules (ProjectWorkspace, PersonaManagement, JobOrchestration, CoreAIServices). CoreAIServices might use LLMs externally. JobOrchestration might use a Job Queue internally. Main modules can use a Main Event Bus for internal communication or to send events to UI via the Bridge.]

### 3.2. Descrição Detalhada dos Módulos e Componentes

#### 3.2.1. Processo Main

*   **`ElectronMainBridge`**
    *   **Responsabilidades:**
        1.  **Gateway IPC:** Único ponto de entrada para todas as chamadas IPC do processo Renderer. Implementa handlers para canais IPC específicos.
        2.  **Validação e Delegação:** Valida DTOs recebidos e delega chamadas para os serviços apropriados nos módulos de negócios (`ProjectWorkspace`, `PersonaManagement`, `JobOrchestration`).
        3.  **Formatação de Resposta:** Formata respostas dos serviços do main em DTOs para o Renderer.
        4.  **Transmissão de Eventos para UI:** Assina eventos relevantes do `MainEventBus` e os transmite para o `UserInterface` via `webContents.send()`.
    *   **Princípio Chave:** Deve ser "magro", sem lógica de negócios própria.

*   **`ProjectWorkspace`** (Potencial Contexto Delimitado DDD)
    *   **Responsabilidades:**
        1.  CRUD para Entidades `Project` e `ProjectResource`.
        2.  Gerenciar configurações e metadados a nível de projeto.
    *   **Componentes DDD:** `Project` (Agregado Raiz), `ProjectResource` (Entidade), `ProjectRepository` (Interface e Implementação), Serviços de Aplicação (ex: `ProjectService`).

*   **`PersonaManagement`** (Potencial Contexto Delimitado DDD)
    *   **Responsabilidades:**
        1.  CRUD para Entidades `Persona` (configurações de agente).
        2.  Gerenciar `LLMProviderConfig` e o armazenamento seguro de chaves API.
    *   **Componentes DDD:** `Persona` (Agregado Raiz), `LLMProviderConfig` (Entidade), `PersonaRepository`, Serviços de Aplicação (ex: `PersonaConfigService`).

*   **`JobOrchestration`** (Potencial Contexto Delimitado DDD)
    *   **Responsabilidades:**
        1.  Receber, validar e enfileirar requisições de Jobs.
        2.  Gerenciar o ciclo de vida e transições de estado dos Jobs (ex: pendente, rodando, erro, completo).
        3.  Persistir dados e resultados dos Jobs.
        4.  Coordenar com `CoreAIServices` para a execução efetiva do trabalho do agente.
        5.  Publicar eventos de mudança de status de Job no `MainEventBus`.
    *   **Componentes DDD:** `Job` (Agregado Raiz), `JobRepository`, Serviços de Aplicação (ex: `JobSubmissionService`, `JobQueueService`, `AgentRunnerService`), `WorkflowDefinition` (Entidade, se aplicável).

*   **`CoreAIServices`** (Potencial Contexto Delimitado DDD)
    *   **Responsabilidades:**
        1.  Executar a lógica de um agente ativo (instância em memória de uma `Persona`) ao processar um Job.
        2.  Gerenciar o registro, carregamento e execução de `Tool`s.
        3.  Abstrair e gerenciar interações com diferentes provedores de LLM.
        4.  Publicar eventos detalhados de execução (opcional, para logging/tracing avançado).
    *   **Componentes DDD:** `Agent` (Entidade representando o agente em execução), `Tool` (Interface/Abstração com implementações concretas), `ToolRegistry`, `LLMService`, Serviços de Domínio (ex: `ToolExecutorService`).

*   **`MainEventBus`** (Componente Compartilhado no Main)
    *   **Responsabilidade:** Um simples `EventEmitter` do Node.js para permitir comunicação desacoplada entre os módulos do processo main e para que o `ElectronMainBridge` possa capturar eventos para a UI.

#### 3.2.2. Processo Renderer

*   **`UserInterface`**
    *   **Responsabilidades:**
        1.  Renderizar a interface do usuário utilizando componentes React (Views).
        2.  Gerenciar o estado da UI e a lógica de apresentação através de ViewModels.
        3.  Capturar interações do usuário e delegá-las para os ViewModels como comandos.
        4.  Comunicar-se com o `ElectronMainBridge` via IPC (através de wrappers tipados) para enviar requisições e receber dados/atualizações.
    *   **Componentes (MVVM-like):**
        *   **Views (Componentes React):** Responsáveis pela apresentação visual. Ligam-se aos ViewModels para dados e ações.
        *   **ViewModels:** Contêm a lógica de apresentação e o estado para suas Views correspondentes. Ex: `ProjectListViewModel`, `JobStatusViewModel`. Eles invocam funções do wrapper IPC para interagir com o processo main.
        *   **IPC Wrappers:** Módulos que abstraem as chamadas `ipcRenderer.invoke` e `ipcRenderer.on` com interfaces tipadas.

### 3.3. Estrutura de Diretórios Refinada Proposta

```
project-wiz/
├── src/
│   ├── main/                       # Processo Principal Electron
│   │   ├── bridge/                 # ElectronMainBridge: Handlers IPC, validação DTO
│   │   │   └── index.ts
│   │   │
│   │   ├── modules/                # Módulos de negócio core (Contextos Delimitados)
│   │   │   ├── project_workspace/
│   │   │   │   ├── application/    # Serviços (IProjectService)
│   │   │   │   ├── domain/         # Entidades (Project), Repositórios (IProjectRepository), VOs
│   │   │   │   └── index.ts        # API pública do módulo
│   │   │   │
│   │   │   ├── persona_management/ # Estrutura similar: application, domain, index
│   │   │   ├── job_orchestration/  # Estrutura similar: application, domain, index
│   │   │   └── core_ai_services/   # Estrutura similar: application, domain (ferramentas, runtime agente), index
│   │   │
│   │   ├── shared_kernel/          # Código compartilhado entre módulos do main (ex: BaseEntity, EventBus) - usar com moderação
│   │   ├── config/                 # Configuração da app, setup do BD
│   │   └── main.ts                 # Ponto de entrada, fiação dos módulos, init do event bus global
│   │
│   ├── renderer/                   # Processo Renderer (Módulo UserInterface)
│   │   ├── views/                  # Componentes React (Views)
│   │   ├── view_models/            # ViewModels (lógica UI, estado, chamadas para bridge IPC)
│   │   ├── components/             # Componentes React compartilhados/burros
│   │   ├── ipc/                    # Invocadores e listeners IPC tipados para ViewModels
│   │   ├── App.tsx                 # Componente raiz React
│   │   └── renderer.ts             # Ponto de entrada do Renderer
│   │
│   └── shared_types/               # DTOs, Enums, tipos simples para IPC e contratos inter-processos
│
├── package.json
└── ...
```

### 3.4. Detalhamento das Interfaces dos Módulos (Contratos API)

Esta seção detalha os contratos API, incluindo assinaturas de métodos e Data Transfer Objects (DTOs), para interações chave entre os módulos do processo principal do Projeto Wiz. Estes contratos definem como os módulos se comunicam e os dados que trocam.

---

#### Tipos Básicos Compartilhados

```typescript
type IsoDateString = string; // Representa uma data no formato ISO 8601 (ex: "2023-10-26T10:00:00Z")
type FilePath = string;     // Representa um caminho de sistema de arquivos local
```

---

#### 3.4.1. `ElectronMainBridge` <-> `JobOrchestration`

*   **Módulo:** `ElectronMainBridge` (Handler IPC) chama `JobOrchestration` (Serviço de Aplicação)

##### 3.4.1.1. Atribuindo um Novo Job

*   **Assinatura do Método (em `JobOrchestration`'s `IJobSubmissionService`):**
    ```typescript
    interface IJobSubmissionService {
      submitJob(params: AssignJobParams): Promise<AssignJobResult>;
    }
    ```
*   **DTOs:**
    ```typescript
    interface AssignJobParams {
      projectId: string;
      personaId: string;
      jobDescription: string; // Descrição fornecida pelo usuário ou objetivo para o job
      inputParameters: Record<string, any>; // ex: { specFilePath: "path/to/spec.txt", targetFunction: "doSomething" }
      priority?: 'low' | 'normal' | 'high';
    }

    interface AssignJobResult {
      jobId: string;
      status: 'queued' | 'pending' | 'error'; // Status inicial após submissão
      message?: string; // Mensagem opcional, ex: detalhes do erro se submissão falhou
    }
    ```

##### 3.4.1.2. Solicitando Status do Job

*   **Assinatura do Método (em `JobOrchestration`'s `IJobQueryService`):**
    ```typescript
    interface IJobQueryService {
      getJobStatus(jobId: string): Promise<JobStatusDto | null>;
    }
    ```
*   **DTO:**
    ```typescript
    type JobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

    interface JobStatusDto {
      jobId: string;
      status: JobStatus;
      jobDescription: string;
      submittedAt: IsoDateString;
      startedAt?: IsoDateString;
      completedAt?: IsoDateString;
      progress?: { // Detalhes opcionais de progresso
        percentage?: number; // 0-100
        currentStep?: string;
      };
      resultPreview?: string; // ex: primeiras linhas do código gerado, ou caminho para arquivo de saída
      errorInfo?: {
        message: string;
        details?: string;
      };
    }
    ```

---

#### 3.4.2. `ElectronMainBridge` <-> `ProjectWorkspace`

*   **Módulo:** `ElectronMainBridge` (Handler IPC) chama `ProjectWorkspace` (Serviço de Aplicação)

##### 3.4.2.1. Criando um Novo Projeto

*   **Assinatura do Método (em `ProjectWorkspace`'s `IProjectService`):**
    ```typescript
    interface IProjectService {
      createProject(params: CreateProjectParams): Promise<ProjectDto>;
    }
    ```
*   **DTOs:**
    ```typescript
    interface CreateProjectParams {
      name: string;
      description?: string;
      // userId?: string; // Se projetos são específicos do usuário
    }

    interface ProjectDto {
      id: string;
      name: string;
      description?: string;
      createdAt: IsoDateString;
      // resourcePaths?: FilePath[]; // Lista de arquivos/pastas chave associados
      // jobCount?: number;
    }
    ```

##### 3.4.2.2. Carregando um Projeto

*   **Assinatura do Método (em `ProjectWorkspace`'s `IProjectService`):**
    ```typescript
    interface IProjectService {
      loadProject(projectId: string): Promise<ProjectDto | null>;
    }
    ```
    *(DTO de Resposta é `ProjectDto` como definido acima)*

---

#### 3.4.3. `ElectronMainBridge` <-> `PersonaManagement`

*   **Módulo:** `ElectronMainBridge` (Handler IPC) chama `PersonaManagement` (Serviço de Aplicação)

##### 3.4.3.1. Criando uma Persona

*   **Assinatura do Método (em `PersonaManagement`'s `IPersonaConfigService`):**
    ```typescript
    interface IPersonaConfigService {
      createPersona(params: CreatePersonaParams): Promise<PersonaDto>;
    }
    ```
*   **DTOs:**
    ```typescript
    interface LLMConfigParams { // Parte de CreatePersonaParams
      providerId: string; // ex: "openai", "anthropic"
      modelId: string;    // ex: "gpt-4", "claude-2"
      apiKeyRef?: string;  // Referência a uma chave API armazenada de forma segura, não a chave em si
      parameters?: Record<string, any>; // ex: { temperature: 0.7, maxTokens: 2000 }
    }

    interface CreatePersonaParams {
      name: string;
      description?: string;
      systemPrompt: string;
      enabledToolIds: string[]; // IDs de ferramentas disponíveis para esta persona
      llmConfig: LLMConfigParams;
      isPublic?: boolean;
    }

    interface PersonaDto {
      id: string;
      name: string;
      description?: string;
      systemPrompt: string;
      enabledToolIds: string[];
      llmConfig: LLMConfigParams; // Pode ser uma versão simplificada para exibição
      createdAt: IsoDateString;
      isPublic: boolean;
    }
    ```

##### 3.4.3.2. Obtendo Detalhes da Persona

*   **Assinatura do Método (em `PersonaManagement`'s `IPersonaConfigService`):**
    ```typescript
    interface IPersonaConfigService {
      getPersonaDetails(personaId: string): Promise<PersonaDto | null>;
    }
    ```
    *(DTO de Resposta é `PersonaDto` como definido acima)*

---

#### 3.4.4. `JobOrchestration` <-> `CoreAIServices`

*   **Módulo:** `JobOrchestration` (AgentRunnerService) chama `CoreAIServices` (AgentExecutor)

##### 3.4.4.1. Solicitando Execução de uma Tarefa de Agente para um Job

*   **Assinatura do Método (em `CoreAIServices`'s `IAgentExecutorService`):**
    ```typescript
    interface IAgentExecutorService {
      executeAgentTask(params: AgentTaskParams): Promise<AgentTaskResult>;
    }
    ```
*   **DTOs:**
    ```typescript
    interface PersonaConfigSnapshotDto { // Snapshot da config da persona no momento da execução do job
      id: string;
      name: string;
      systemPrompt: string;
      enabledToolIds: string[];
      llmConfig: LLMConfigParams; // Config completa necessária para execução
    }

    interface ProjectContextSnapshotDto { // Snapshot do contexto de projeto relevante
      id: string;
      name: string;
      // Potencialmente caminhos de arquivos de projeto específicos ou configurações relevantes para o job
      projectFiles?: { name: string, path: FilePath }[];
    }

    interface AgentTaskParams {
      jobId: string;
      jobDescription: string;
      inputParameters: Record<string, any>; // Inputs para o próprio job
      personaConfig: PersonaConfigSnapshotDto;
      projectContext?: ProjectContextSnapshotDto; // Opcional, se job precisa de contexto a nível de projeto
    }

    interface AgentTaskResult {
      jobId: string;
      status: 'completed' | 'failed';
      outputData?: any; // Pode ser texto, dados estruturados, caminho para arquivos de saída
      errorInfo?: {
        message: string;
        details?: string;
        toolFailures?: { toolId: string, error: string }[];
      };
      executionLogs?: string[]; // Logs chave da execução do agente
    }
    ```

---

#### 3.4.5. `JobOrchestration` <-> `PersonaManagement` (Recuperação de Dados)

*   **Módulo:** `JobOrchestration` (Serviço de Aplicação) chama `PersonaManagement` (Serviço de Aplicação)

##### 3.4.5.1. Obtendo Configuração da Persona para um Job

*   **Assinatura do Método (em `PersonaManagement`'s `IPersonaQueryService` ou `IPersonaConfigService`):**
    ```typescript
    interface IPersonaQueryService {
      getPersonaConfigForJob(personaId: string): Promise<PersonaConfigSnapshotDto | null>;
    }
    ```
    *(DTO de Resposta é `PersonaConfigSnapshotDto` como definido na seção 3.4.4.1. Este DTO é adaptado para necessidades de execução, potencialmente diferente do `PersonaDto` completo usado pela bridge da UI.)*

---

#### 3.4.6. `JobOrchestration` <-> `ProjectWorkspace` (Recuperação de Dados)

*   **Módulo:** `JobOrchestration` (Serviço de Aplicação) chama `ProjectWorkspace` (Serviço de Aplicação)

##### 3.4.6.1. Obtendo Contexto do Projeto para um Job

*   **Assinatura do Método (em `ProjectWorkspace`'s `IProjectQueryService` ou `IProjectService`):**
    ```typescript
    interface IProjectQueryService {
      getProjectContextForJob(projectId: string): Promise<ProjectContextSnapshotDto | null>;
    }
    ```
    *(DTO de Resposta é `ProjectContextSnapshotDto` como definido na seção 3.4.4.1. Contém apenas a informação do projeto relevante para a execução do job.)*

---

## 3.5. Modelos de Dados das Entidades Centrais

Esta seção detalha os modelos de dados para as entidades de domínio centrais: `Project`, `Persona` e `Job`. Estes modelos especificam atributos chave, tipos de dados e relacionamentos, alinhando-se com os princípios DDD e suportando os contratos API previamente definidos. Embora Value Objects (VOs) sejam encorajados em uma implementação DDD para atributos como IDs ou tipos de string complexos com invariantes, os DTOs usados em contratos API (e representados aqui) frequentemente usarão seus tipos primitivos subjacentes para simplicidade na transferência de dados.

---

### Tipos Básicos Compartilhados (Reiterado para Contexto)

```typescript
type IsoDateString = string; // Representa uma data no formato ISO 8601 (ex: "2023-10-26T10:00:00Z")
type FilePath = string;     // Representa um caminho de sistema de arquivos local
```

---

### 3.5.1. Entidade `Project`

Representa o espaço de trabalho de um usuário, agrupando jobs, personas e recursos relacionados.

*   **Módulo Proprietário:** `ProjectWorkspace`

```typescript
// --- Definição da Entidade Project ---

// Para modelagem de domínio interna, ProjectId pode ser um Value Object.
// Para DTOs, uma string (UUID) é tipicamente usada.
type ProjectId = string; // UUID

interface Project {
  id: ProjectId;
  name: string; // Poderia ser ProjectNameVO no modelo de domínio
  description?: string; // Opcional, poderia ser ProjectDescriptionVO
  // projectPath: FilePath; // Caminho raiz para arquivos específicos do projeto, se aplicável

  // Timestamps
  createdAt: IsoDateString;
  updatedAt: IsoDateString;

  // Relacionamentos (representados por IDs para baixo acoplamento em DTOs/persistência)
  // Entidades Job e Persona reais são gerenciadas por seus respectivos módulos.
  // Estes poderiam ser buscados sob demanda ou gerenciados via uma tabela/documento de ligação.
  // Para simplicidade na própria entidade Project, podemos não armazenar listas diretas de IDs de Job/Persona aqui,
  // mas sim consultar Jobs por projectId, e potencialmente ter uma lista de IDs de Persona explicitamente
  // configuradas ou 'favoritas' para este projeto.

  // Exemplo: Personas frequentemente usadas ou configuradas para este projeto
  configuredPersonaIds?: PersonaId[];

  // Exemplo: Usuário que possui/criou o projeto, se aplicável
  // ownerUserId?: UserId;
}
```

**Notas sobre a Entidade `Project`:**

*   **IDs:** `id` seria um identificador único, potencialmente um UUID. Em um modelo de domínio rico, `ProjectId` poderia ser um Value Object (`class ProjectId { constructor(readonly value: string) {...} }`).
*   **Nome/Descrição:** Embora mostrados como `string`, na camada de domínio de `ProjectWorkspace`, estes poderiam ser Value Objects (`ProjectNameVO`, `ProjectDescriptionVO`) aplicando regras de validação (ex: comprimento, caracteres permitidos).
*   **Relacionamentos:**
    *   Um `Project` não precisa necessariamente armazenar uma lista de todos os seus `Job` IDs diretamente em seu próprio documento/linha se a entidade `Job` armazena um `projectId`. Isso evita arrays grandes e simplifica a consulta de jobs para um projeto.
    *   `configuredPersonaIds` é um exemplo de como um projeto pode manter o controle de personas específicas relevantes para ele, sem implicar posse direta da entidade Persona.

---

### 3.5.2. Entidade `Persona`

Define a configuração e capacidades de um agente IA.

*   **Módulo Proprietário:** `PersonaManagement`

```typescript
// --- Definição da Entidade Persona ---

type PersonaId = string; // UUID
type ToolId = string;    // Identificador para uma Tool registrada

// Representa a configuração para um provedor LLM vinculado a esta Persona
interface PersonaLLMConfig {
  providerId: string; // ex: "openai", "anthropic", "ollama_local"
  modelId: string;    // ex: "gpt-4-turbo", "claude-3-opus", "llama2:13b"
  // Chave API pode ser armazenada separadamente e referenciada por um ID/alias por segurança,
  // ou gerenciada por um serviço de segredos dedicado, não diretamente na entidade Persona.
  // Para modelos locais, apiKey pode não ser necessária.
  apiKeyAlias?: string;
  baseUrl?: string; // Para endpoints auto-hospedados ou alternativos
  parameters?: Record<string, any>; // ex: { temperature: 0.7, maxTokens: 4096, stream: true }
}

interface Persona {
  id: PersonaId;
  name: string;
  description?: string;
  systemPrompt: string; // A instrução central definindo o comportamento da Persona
  avatarUrl?: string; // URL opcional para uma imagem de avatar

  llmConfig: PersonaLLMConfig;
  enabledToolIds: ToolId[]; // Lista de IDs de Tool que esta Persona está configurada para usar

  isPublic?: boolean; // Se esta Persona está disponível para outros ou é privada
  // ownerUserId?: UserId; // Se personas podem ser privadas para usuários

  // Timestamps
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
```

**Notas sobre a Entidade `Persona`:**

*   **`systemPrompt`:** Peça crítica de dados definindo o comportamento central da Persona e instruções para o LLM.
*   **`llmConfig`:** Objeto embutido detalhando o LLM específico e seus parâmetros. Armazenar `apiKeyAlias` em vez da chave bruta é uma consideração de segurança; a chave real seria resolvida em tempo de execução por `CoreAIServices` através de um mecanismo seguro.
*   **`enabledToolIds`:** Referencia entidades/definições de `Tool`, que seriam gerenciadas em outro lugar (provavelmente dentro de `CoreAIServices` ou um registro compartilhado). Indica quais ferramentas a Persona *pode* escolher usar.

---

### 3.5.3. Entidade `Job`

Representa uma tarefa específica atribuída a uma Persona, rastreando sua execução e resultados.

*   **Módulo Proprietário:** `JobOrchestration`

```typescript
// --- Definição da Entidade Job ---

type JobId = string; // UUID
type JobStatus =
  | 'pending'    // Criado mas ainda não pego pela fila
  | 'queued'     // Esperando na fila de execução
  | 'running'    // Sendo processado ativamente por um agente
  | 'paused'     // Usuário ou sistema pausou o job (capacidade futura)
  | 'completed'  // Terminou com sucesso
  | 'failed'     // Terminou devido a um erro
  | 'cancelled'; // Cancelado pelo usuário

// Estrutura opcional para rastreamento detalhado de progresso dentro de um job
interface JobProgress {
  percentage?: number; // Progresso geral (0-100)
  currentStep?: string; // Descrição da tarefa ou passo atual
  totalSteps?: number;
  completedSteps?: number;
  // additionalDetails?: Record<string, any>; // Para dados de progresso customizados
}

// Estrutura opcional para logar uso de ferramenta dentro do ciclo de vida de um job
interface ToolExecutionLogEntry {
  toolId: ToolId;
  toolName?: string; // Denormalizado para exibição mais fácil
  timestamp: IsoDateString;
  input?: Record<string, any>; // Input sanitizado/sumarizado para a ferramenta
  output?: any; // Output sanitizado/sumarizado ou erro da ferramenta
  status: 'success' | 'error';
  durationMs?: number;
}

interface Job {
  id: JobId;
  projectId: ProjectId; // Referência ao Project ao qual este job pertence
  personaId: PersonaId; // Referência à Persona designada para executar este job
  // parentJobId?: JobId; // Para sub-tarefas ou passos de workflow

  jobDescription: string; // Objetivo de alto nível fornecido pelo usuário para o job
  jobType?: string; // Opcional: Categoriza o job, ex: 'codeGeneration', 'textSummarization', 'fileProcessing'

  status: JobStatus;
  progress?: JobProgress; // Progresso detalhado opcional

  inputParameters: Record<string, any>; // Parâmetros fornecidos quando o job foi criado
                                        // ex: { filePath: "doc.txt", targetLanguage: "python" }

  result?: any; // O output/resultado final do job (pode ser complexo, armazenar caminho para arquivo, etc.)
                // Para resultados grandes, isto pode armazenar uma referência (ex: caminho para arquivo de saída ou ID de registro no BD)
  error?: {
    message: string;
    details?: string; // Stack trace ou mais informações de erro
    errorCode?: string; // Código de erro interno
  };

  // Timestamps
  createdAt: IsoDateString; // Quando o job foi criado/submetido pela primeira vez
  updatedAt: IsoDateString; // Última vez que a própria entidade job foi atualizada
  queuedAt?: IsoDateString;  // Quando o job entrou na fila
  startedAt?: IsoDateString; // Quando o processamento realmente começou
  completedAt?: IsoDateString; // Quando o processamento terminou (com sucesso ou não)

  priority?: 'low' | 'normal' | 'high';

  // Logs e Diagnósticos
  executionLogs?: string[]; // Logs gerais do processo de execução do agente
  toolExecutionLogs?: ToolExecutionLogEntry[]; // Logs específicos para cada ferramenta usada (opcional, poderia ser uma coleção/tabela separada se muito grande)
}
```

**Notas sobre a Entidade `Job`:**

*   **`jobDescription` vs. `inputParameters`:** `jobDescription` é a requisição de alto nível do usuário, enquanto `inputParameters` são os inputs estruturados com os quais o agente trabalhará.
*   **`status` e `progress`:** Essenciais para rastreamento e atualizações UI.
*   **`result`:** O tipo é `any` porque os resultados podem variar muito. Para outputs grandes, armazenar uma referência (como um caminho de arquivo ou um link para armazenamento na nuvem) é aconselhável em vez de embutir dados grandes diretamente.
*   **`executionLogs` e `toolExecutionLogs`:** Capturar logs é vital para debug e entendimento do comportamento do agente. `toolExecutionLogs` fornece insight granular sobre o uso de ferramentas. Se estes logs se tornarem muito grandes, poderiam ser melhor armazenados em um sistema de logging separado ou coleção vinculada por `jobId`.
*   **Timestamps:** Timestamps detalhados ajudam a rastrear o ciclo de vida do job.

---
Estes modelos de entidade fornecem uma base mais concreta para os conceitos centrais no Projeto Wiz. Eles são projetados para serem armazenados e gerenciados dentro de seus respectivos módulos e servem como base para DTOs usados em contratos API, com transformações apropriadas (ex: VOs para primitivos) conforme necessário para transferência de dados.

---

## 4. Cenários Chave de Interação (Fluxos de Dados)

### 4.1. Cenário: Usuário Atribui um Job a uma Persona

1.  **`UserInterface` (Renderer):** `JobAssignmentViewModel` coleta dados ( `projectId`, `personaId`, descrição, inputs) da `JobAssignmentFormView` e cria `JobAssignmentRequestDto`.
2.  **IPC (Renderer -> Main):** ViewModel chama wrapper IPC (ex: `ipc.assignJob(dto)`), que envia mensagem para `ElectronMainBridge`.
3.  **`ElectronMainBridge` (Main):** Handler IPC recebe DTO, valida-o superficialmente, e chama `JobOrchestration.JobSubmissionService.submitJob(dto)`.
4.  **`JobOrchestration` (Main):**
    *   `JobSubmissionService` valida `personaId` e `projectId` (opcionalmente chamando `PersonaManagement` e `ProjectWorkspace`).
    *   Cria Entidade `Job` com status 'Pending/Queued'.
    *   Persiste Job via `JobRepository`.
    *   Coloca `jobId` em uma fila interna para processamento assíncrono.
    *   Retorna DTO de status do Job (ex: `{ jobId, status: 'Queued' }`).
5.  **IPC (Main -> Renderer):** `ElectronMainBridge` envia `JobStatusDto` de volta para o ViewModel solicitante.
6.  **`UserInterface` (Renderer):** ViewModel atualiza estado, View exibe que o job foi enfileirado.
7.  **Notificação Assíncrona (Main -> Renderer, via EventBus):**
    *   Posteriormente, quando o `JobOrchestration.AgentRunnerService` pega o job da fila, ele emite `JobStatusChangedEvent({ jobId, status: 'Running' })` no `MainEventBus`.
    *   `ElectronMainBridge` captura este evento e envia uma mensagem IPC `job-status-update` para todos os renderers.
    *   ViewModels relevantes no `UserInterface` atualizam-se para exibir o status 'Running'.

### 4.2. Cenário: Persona Executa um Job (Ex: Geração de Código)

1.  **`JobOrchestration` (Main):** `AgentRunnerService` retira um Job da fila. Prepara `JobExecutionContext` (com `PersonaConfig` e inputs do Job).
2.  **Delegação para `CoreAIServices` (Main):** `AgentRunnerService` chama `CoreAIServices.AgentExecutor.runTask(jobExecutionContext)`.
3.  **`CoreAIServices` (Main):**
    *   `AgentExecutor` instancia a lógica do agente (baseada na `PersonaConfig`).
    *   **Lógica do Agente (Ex: Geração de Código):**
        1.  Agente decide usar `ReadFileTool` para ler arquivo de especificação. Chama `ToolRegistry.getTool('ReadFileTool').execute({ path: 'spec.txt' }, agentContext)`.
        2.  `ReadFileTool` executa, retorna conteúdo do arquivo.
        3.  Agente constrói prompt para LLM com a especificação.
        4.  Agente decide usar `LLMInteractionTool`. Chama `ToolRegistry.getTool('LLMInteractionTool').execute({ prompt: constructedPrompt }, agentContext)`.
        5.  `LLMInteractionTool` internamente usa `LLMService` para chamar a API externa do LLM.
        6.  LLM retorna código gerado. `LLMInteractionTool` retorna este código.
    *   `AgentExecutor` compila o resultado final do Job.
4.  **Retorno para `JobOrchestration` (Main):** `CoreAIServices` retorna o resultado (código gerado, logs) para `JobOrchestration.AgentRunnerService`.
5.  **Finalização do Job (Main):**
    *   `AgentRunnerService` atualiza a Entidade `Job` com o resultado e status 'Completed' (via `JobRepository`).
    *   Emite `JobStatusChangedEvent({ jobId, status: 'Completed', resultPreview: '...' })` no `MainEventBus`.
6.  **Notificação para UI (Main -> Renderer):** `ElectronMainBridge` captura o evento e envia atualização IPC para `UserInterface`. ViewModels atualizam as Views.

## 5. Atendendo aos Direcionadores e Qualidades Arquiteturais

*   **Simplicidade/Compreensibilidade:** A estrutura modular com responsabilidades claras e o padrão MVVM-like para UI visam simplificar o entendimento de partes isoladas do sistema. A centralização da comunicação Main-Renderer no `ElectronMainBridge` também simplifica o rastreamento de interações inter-processos.
*   **DX:** Módulos bem definidos permitem que desenvolvedores foquem em áreas específicas. Contratos claros (DTOs, interfaces de serviço) e a separação UI/backend melhoram a DX. O uso de um event bus para certas atualizações pode simplificar o código do lado do cliente.
*   **Manutenibilidade:** O baixo acoplamento entre módulos e a alta coesão dentro deles facilitam a correção de bugs e a realização de mudanças sem efeitos colaterais inesperados.
*   **Separação Clara de Preocupações:** Fortemente aplicada através da divisão de processos do Electron, da modularização no main, e do padrão MVVM-like no renderer. Cada módulo tem um foco bem definido.
*   **Testabilidade:** Módulos do main (especialmente serviços e lógica de domínio) podem ser testados unitariamente com mocks para dependências. ViewModels no renderer podem ser testados independentemente das Views. `ElectronMainBridge` pode ser testado mockando serviços reais.
*   **Extensibilidade:** Detalhada na seção 7. A estrutura modular e o desacoplamento facilitam a adição de novas funcionalidades.
*   **Robustez/Confiabilidade:** A separação de processos inerente ao Electron contribui para a robustez (crash no renderer não derruba o main). O uso de filas de jobs e tratamento de erros nos serviços do main são cruciais.
*   **Performance (UI/Agente):** A execução de jobs e lógica AI no processo main (com potencial uso de worker threads dentro dos módulos se necessário para tarefas CPU-bound) e a comunicação assíncrona com a UI via IPC e eventos visam manter a UI responsiva.
*   **Integridade dos Dados:** Centralizada nos repositórios e serviços de domínio dentro dos módulos do main.

## 6. Decisões de Design e Trade-offs

*   **Monolito Modular vs. Microserviços (ou full EDA):** Escolhido o Monolito Modular para o processo main para manter a simplicidade de desenvolvimento e implantação em um contexto de aplicação desktop, evitando a complexidade de uma arquitetura distribuída ou full EDA, que poderia prejudicar a DX e a compreensibilidade.
    *   *Trade-off:* Menor escalabilidade individual de componentes em comparação com microserviços, mas adequado para uma aplicação Electron.
*   **Gateway IPC (`ElectronMainBridge`):** Centraliza a comunicação inter-processos, o que é bom para segurança e clareza, mas pode se tornar um gargalo se não for mantido "magro" ou se o volume de chamadas for excessivo.
    *   *Trade-off:* Um pouco mais de boilerplate para rotear chamadas, mas ganho em organização e controle.
*   **DDD Tático nos Módulos:** Adiciona uma curva de aprendizado e algum boilerplate, mas resulta em um modelo de domínio mais rico e resiliente a mudanças.
    *   *Trade-off:* Mais esforço inicial de modelagem em troca de melhor manutenibilidade e clareza do domínio a longo prazo.
*   **Event Bus Seletivo:** Usado para notificações e desacoplamento de atualizações de status, mas não para todo o fluxo de comandos, para evitar a complexidade de rastreamento de uma EDA pura.
    *   *Trade-off:* Complexidade gerenciada para desacoplamento onde ele traz mais benefícios (reatividade da UI).

## 7. Diretrizes para Extensão

*   **Adicionar Nova Persona:**
    1.  Definir novos parâmetros de configuração na Entidade `Persona` (`PersonaManagement.domain`).
    2.  Atualizar `PersonaConfigService` e `PersonaRepository` (`PersonaManagement.application` e `.domain`).
    3.  Implementar a nova lógica de runtime/comportamento do agente em `CoreAIServices` (possivelmente nova classe de agente ou lógica condicional baseada na config).
    4.  Atualizar UI (`UserInterface.views` e `UserInterface.view_models`) e `ElectronMainBridge` para permitir a criação e configuração desta nova Persona.
*   **Adicionar Nova Ferramenta:**
    1.  Implementar a interface `ITool` em `CoreAIServices.domain.tools`.
    2.  Registrar a nova ferramenta no `ToolRegistry` (`CoreAIServices`).
    3.  Se a ferramenta tiver configurações específicas que precisam ser gerenciadas por Persona, atualizar `PersonaManagement` e a UI de configuração de Persona.
    4.  Personas agora podem ser configuradas para usar esta nova ferramenta.
*   **Adicionar Nova Funcionalidade (ex: Novo Tipo de Job):**
    1.  Definir novos DTOs em `shared_types`.
    2.  Adicionar handlers no `ElectronMainBridge` para as novas interações UI.
    3.  Criar/modificar serviços em `JobOrchestration` para lidar com o novo tipo de job.
    4.  Se necessário, adicionar lógica em `CoreAIServices` para a execução do novo tipo de job.
    5.  Criar as Views e ViewModels correspondentes em `UserInterface`.
    6.  Se a funcionalidade for grande e coesa o suficiente, considerar se ela justifica um novo módulo no processo main.

Este blueprint fornece uma estrutura robusta e adaptável, projetada para equilibrar as necessidades imediatas do Projeto Wiz com sua evolução futura. A chave para o sucesso será a disciplina na manutenção dos limites dos módulos e na clareza das interfaces.

[end of docs/arquitetura/project-wiz-architectural-blueprint.md]
