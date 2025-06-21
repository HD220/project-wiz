# Estrutura e Funcionamento dos Agentes (Personas)

Este documento detalha o conceito de Agente (frequentemente referido como Persona na interface do usuário) no Project Wiz. Explicaremos como os Agentes operam, interagem com tarefas (Jobs), gerenciam informações e utilizam suas ferramentas (Tools) para executar o trabalho de automação.

## 1. Conceito de Agente e Persona

No Project Wiz, o termo **Agente** refere-se à entidade técnica de backend e aos serviços responsáveis por executar Jobs e interagir com o sistema. É o "worker" inteligente que processa as tarefas. O `AutonomousAgent` é o serviço central que implementa essa inteligência.

O termo **Persona**, por outro lado, é como os Agentes são apresentados aos usuários na interface. Uma Persona possui atributos configuráveis como nome, papel (ex: Desenvolvedor, QA), objetivos e backstory, que ajudam a definir sua especialização e comportamento. Essencialmente, uma Persona é a configuração e a "personalidade" de um Agente técnico.

Para mais informações sobre como os usuários configuram e interagem com as Personas, consulte o [Guia do Usuário: Configurando e Utilizando Personas](../user-guide/05-personas-agents.md).

## 2. Conceitos Chave do Framework de Agentes

### Activity Context (`ActivityContextVO`)

O `ActivityContext` (implementado como `ActivityContextVO` encapsulando `ActivityContextData`) é um componente vital que armazena o estado e o contexto específico de uma **Activity** individual. No sistema atual, uma `Job` (entidade persistida) representa uma Activity, e o `ActivityContext` reside no campo `data` da entidade `Job`. Isso garante que cada Job/Activity tenha seu próprio espaço isolado para gerenciar as informações relevantes para sua execução pelo `AutonomousAgent`.

Principais campos do `ActivityContextData`:
- `activityType`: `ActivityTypeValue` - O tipo da atividade (e.g., `USER_REQUEST`, `AGENT_ACTION`, `SYSTEM_MESSAGE`).
- `goal`: `string` - O objetivo principal que esta atividade visa alcançar.
- `history`: `ActivityHistory` (VO) - Um registro cronológico de `ActivityHistoryEntry` (VOs), que podem incluir interações do usuário, ações do agente, resultados de tasks, ou observações.
- `currentTask`: `string | null` - O nome ou identificador da tarefa (`ITask`) que está atualmente em foco ou foi a última executada.
- `taskParameters`: `Record<string, any> | null` - Os parâmetros específicos para a `currentTask`.
- `notes`: `string[] | null` - Notas ou pensamentos relevantes gerados pelo agente durante o processamento desta atividade.
- `llmExecutionLog`: `Record<string, any>[] | null` - Um log das interações com o LLM (requisições, respostas, uso de ferramentas) específicas para esta atividade.
- `originalUserInput`: `string | null` - A entrada original do usuário que iniciou esta atividade, se aplicável.
- `status`: `string | null` - Um status interno da atividade, se necessário para lógica de processamento mais fina dentro do agente (diferente do `JobStatus` da Job).

### Job (anteriormente Activity)

Uma **Job** é a representação persistida de uma unidade de trabalho ou "Activity" no sistema, gerenciada pelo `QueueService`. Cada `Job` encapsula o trabalho a ser feito, seu estado atual, e o contexto necessário para seu processamento.

Principais atributos de uma `Job` (definidos em `JobProps`):
- `id`: `JobId` (VO) - Identificador único.
- `name`: `JobName` (VO) - Nome descritivo da Job.
- `status`: `JobStatus` (VO) - Estado atual da Job na fila (e.g., `pending`, `waiting`, `active`, `completed`, `failed`, `cancelled`).
- `priority`: `JobPriority` (VO) - Nível de prioridade.
- `attempts`: `JobAttempts` (VO) - Contagem de tentativas de execução e máximo permitido.
- `payload`: `Record<string, any>` - Dados de entrada iniciais para a Job.
- `data`: `ActivityContext` (VO) - Contém o contexto dinâmico da atividade, incluindo o objetivo (`goal`), histórico (`history`), tarefa atual (`currentTask`), etc.
- `result`: `Record<string, any>` - O resultado final da execução da Job.
- `createdAt`, `updatedAt`: `Date` - Timestamps de criação e última atualização.
- `executeAfter`: `Date | null` - Data para execução futura.
- `dependsOn`: `string[] | null` - Lista de `JobId`s dos quais esta Job depende.

O `ActivityContext` (armazenado no campo `data`) é crucial para o `AutonomousAgent`, fornecendo o contexto isolado necessário para o processamento da Job/Activity.

### Agent Internal State (`AgentInternalState`)

O `AgentInternalState` (entidade `AgentInternalState`, com propriedades definidas em `AgentInternalStateProps`) representa o estado de conhecimento e configuração de longo prazo de um `AutonomousAgent`. Diferente do `ActivityContext` (que é específico de uma Job/Activity), o `AgentInternalState` encapsula informações que o Agente acumula e mantém ao longo do tempo e através de múltiplas Jobs. Ele é persistido via `IAgentStateRepository`.

Principais campos do `AgentInternalStateProps`:
- `id`: `AgentId` (VO) - Identificador único do estado do agente (e, por extensão, do agente).
- `currentObjective`: `string | null` - O objetivo de alto nível ou foco principal atual do agente.
- `longTermMemory`: `string[] | null` - Um espaço para armazenar aprendizados ou notas de longo prazo (conceitual, implementação de RAG etc. seria futura).
- `preferences`: `Record<string, any> | null` - Preferências de comportamento ou configuração para o agente.
- `createdAt`, `updatedAt`: `Date` - Timestamps.

### Autonomous Agent (`AutonomousAgent` Service)

O `AutonomousAgent` é o serviço central na camada de aplicação responsável por processar uma `Job` (Activity). Ele utiliza o `ILLMAdapter` para raciocínio e tomada de decisões, e a `IAgentServiceFacade` (que por sua vez usa a `TaskFactory`) para executar `ITask`s quando ações concretas são necessárias.

Principais responsabilidades e características:
- **Processamento de Atividades:** Seu método principal, `processActivity(job: Job, agentId: AgentId)`, recebe uma `Job` e o `AgentId` associado.
- **Gerenciamento de Estado:** Carrega e atualiza o `AgentInternalState` (via `IAgentStateRepository`) e o `ActivityContext` (dentro da `Job`).
- **Interação com LLM:** Comunica-se com um modelo de linguagem através da interface `ILLMAdapter` para analisar o `ActivityContext`, decidir os próximos passos, e determinar se uma `ITask` deve ser executada ou se a Job está concluída.
- **Execução de Tasks:** Utiliza a `IAgentServiceFacade` para solicitar a execução de `ITask`s. A facade abstrai a `TaskFactory`.
- **Retorno de Resultado:** Retorna um `ProcessActivityResult` indicando o status do processamento da Job (`completed`, `failed`, `in_progress`) e quaisquer atualizações ao `ActivityContext` ou resultados.

### `IAgentServiceFacade` e `TaskFactory`

A interface `IAgentService` (mencionada em versões anteriores da documentação) foi efetivamente substituída por uma combinação da `IAgentServiceFacade` e da `TaskFactory` na camada de aplicação.

- **`IAgentServiceFacade`**: Esta interface define um contrato simplificado para o `AutonomousAgent` interagir com o subsistema de execução de tasks. Sua principal responsabilidade é receber uma solicitação para executar uma task (identificada por um nome e parâmetros) e orquestrar sua execução usando a `TaskFactory`.
- **`TaskFactory`**: Este serviço é responsável por instanciar a implementação concreta de uma `ITask` com base em um identificador (nome da task). Ele garante que a task seja criada com as dependências necessárias (embora a injeção de dependências em tasks seja uma área para maior desenvolvimento).

### `JobDefinitionService`

O `JobDefinitionService` (localizado na camada de aplicação) é responsável pela criação e definição inicial de novas `Job`s. Ele recebe os dados de entrada para uma nova job (como nome, tipo de atividade, objetivo inicial, payload), valida essas informações, constrói uma nova entidade `Job` com seu `ActivityContext` inicial, e a registra no sistema utilizando o `QueueService` para enfileirá-la. Essencialmente, transforma uma requisição externa ou uma necessidade interna do sistema em uma `Job` válida e pronta para ser processada.

### Queue (`QueueService`)

O `QueueService` (camada de aplicação) gerencia o ciclo de vida das `Job`s (Activities). É o componente central que armazena, organiza e controla as tarefas assíncronas.

Principais Responsabilidades:
1.  **Persistir Estado:** Salva e recupera o estado das `Job`s utilizando a `IJobRepository` (que é implementada, por exemplo, pela `JobDrizzleRepository` para SQLite).
2.  **Controlar Transições de Status:** Único serviço que altera o status de uma `Job` (e.g., `pending`, `waiting`, `active`, `delayed`, `completed`, `failed`, `cancelled`).
3.  **Gerenciar Retentativas e Atrasos:** Controla o `JobAttempts` VO, e conceitualmente os delays para retentativas e execuções futuras (`executeAfter`).
4.  **Gerenciar Dependências (`dependsOn`):** Assegura que jobs dependentes só se tornem ativas após a conclusão de suas dependências.
5.  **Fornecer Jobs para Workers:** Permite que o `WorkerService` obtenha as próximas jobs a serem processadas.

### Task (`ITask` Interface)

Uma `ITask` (definida como uma interface na camada de aplicação, conceitualmente próxima ao domínio) representa a lógica de execução para uma ação ou etapa específica dentro do contexto de uma `Job` (Activity). Ela é responsável por realizar o trabalho concreto.

Características:
- **Interface Comum:** Todas as tasks implementam a interface `ITask`, que tipicamente define um método `execute(activityContext: ActivityContext, taskParams?: any, tools?: ITool[]): Promise<TaskResult>`.
- **Foco na Ação:** Cada task é especializada em uma ação particular (e.g., ecoar uma mensagem, interagir com uma ferramenta).
- **Uso de Ferramentas:** Tasks podem utilizar `ITool`s para interagir com o sistema ou serviços externos.
- **Retorno de Resultado:** Uma `ITask` retorna um `TaskResult`, que inclui um status de sucesso/falha, quaisquer dados de saída, e potencialmente um `ActivityContext` atualizado.
- **Exemplos Implementados:**
    - `SimpleEchoTask`: Uma task simples para testes que retorna uma mensagem de eco.
    - `EchoToolTask`: Uma task que demonstra o uso de uma `ITool` (a `SimpleEchoTool`).

### Tool (`ITool` Interface)

As `ITool`s (interfaces definidas na camada de aplicação) representam capacidades específicas que uma `ITask` pode utilizar para interagir com o sistema, ambiente externo, ou realizar operações discretas.

Características:
- **Interface Definida:** Cada tool implementa a interface `ITool`, que inclui um método `execute(args: any): Promise<any>` e propriedades para `name` e `description` (usadas pelo LLM para entender seu propósito e como usá-la).
- **Funcionalidade Encapsulada:** Uma tool encapsula uma ação bem definida (e.g., ler um arquivo, enviar uma mensagem).
- **Utilização por Tasks:** `ITask`s podem receber ou instanciar `ITool`s para executar suas funções.
- **Exemplos Implementados:**
    - `SimpleEchoTool`: Uma tool de teste que ecoa seus argumentos.
    - `FileSystemListTool` (Mock): Um mock inicial para uma ferramenta que listaria arquivos.

### Worker (`WorkerService` e Entidade `Worker`)

O `WorkerService` (camada de aplicação) é responsável por orquestrar o processamento de `Job`s. Ele gerencia entidades `Worker` (definidas no domínio).

- **Entidade `Worker`**: Representa uma instância de um processador de jobs, caracterizada por um `WorkerId` e um `WorkerStatus`. Cada `Worker` está conceitualmente associado a um `AgentId` para o qual ele processa jobs.
- **`WorkerService`**:
    1.  **Gerenciamento de Workers:** Cria e monitora o estado das entidades `Worker`.
    2.  **Loop de Processamento:** Inicia um loop (`startProcessingLoop`) que busca por `Job`s disponíveis no `QueueService` que podem ser atribuídas a um `Worker` ativo.
    3.  **Delegação ao `AutonomousAgent`:** Ao obter uma `Job`, o `WorkerService` a designa ao `AutonomousAgent` para processamento, passando a `Job` e o `AgentId` do `Worker`.
    4.  **Atualização de Status:** Recebe o `ProcessActivityResult` do `AutonomousAgent` e notifica o `QueueService` para atualizar o status da `Job` e salvar quaisquer resultados ou contextos atualizados.

O conceito de `WorkerPool` (um gerenciador de múltiplos processos/instâncias de `WorkerService` ou workers físicos) é mais um padrão de infraestrutura para escalabilidade, enquanto o `WorkerService` atual foca na lógica de orquestração de um fluxo de jobs para os agentes.

## 3. Comportamento do Agente e Execução de Jobs

Um `AutonomousAgent` no Project Wiz opera como um processador inteligente que executa `Job`s (Activities) obtidas através do `WorkerService` a partir do `QueueService`. Ele processa uma `Job` focando em seu `ActivityContext` e utilizando seu `AgentInternalState` para orientação.

A interação com o LLM permite que o Agente reaja dinamicamente a novas informações ou instruções dentro do contexto de uma Job:

*   **Cancelar uma Job:** Se o objetivo de uma Job se tornar obsoleto, o `AutonomousAgent` pode decidir marcar a Job como `cancelled` (via `QueueService`), possivelmente após uma interação com o LLM.
*   **Modificar um Job em Andamento:** Se o `ActivityContext` de uma Job for alterado (e.g., por uma nova entrada do usuário que é roteada para a mesma Job), o `AutonomousAgent` adaptará seu processamento na próxima vez que atuar sobre essa Job.
*   **Aprender com Novas Informações:** O `AutonomousAgent` pode atualizar seu `AgentInternalState` ou as `notes` no `ActivityContext` de uma Job com base em aprendizados durante o processamento.

Este comportamento é crucial para a flexibilidade e a capacidade de resposta dos Agentes.

### 3.1. Relação com a Arquitetura de Jobs & Workers

O `AutonomousAgent` é um componente central na [Arquitetura do Sistema de Processamento Assíncrono](./01-architecture.md). Conforme descrito nesse documento, o `WorkerService` monitora o `QueueService` por Jobs. Quando uma Job é selecionada para um Agente específico (identificado por `AgentId`), o `WorkerService` invoca o `AutonomousAgent` para executar a lógica da `Job` (Activity). O `AutonomousAgent`, então, utiliza suas capacidades de processamento de linguagem (`ILLMAdapter`) e `ITask`s (via `IAgentServiceFacade` e `TaskFactory`), que podem usar `ITool`s, para realizar o trabalho.

## 4. Ferramentas do Agente (Tools - `ITool`)

As `ITool`s são interfaces que definem capacidades específicas que uma `ITask` (executada pelo `AutonomousAgent`) pode utilizar para interagir com o sistema, ambiente externo, ou realizar operações discretas. Elas são cruciais para permitir que o agente execute ações concretas.

### Princípios das `ITool`s:
- **Interface Clara:** Cada `ITool` possui uma propriedade `name` e `description` (para o LLM entender seu propósito e como usá-la) e um método `execute(args: any): Promise<any>` para realizar sua ação.
- **Consumo por `ITask`s:** As `ITask`s são as principais consumidoras de `ITool`s. Uma `ITask` pode ser projetada para usar uma ou mais tools específicas para cumprir seu objetivo.
- **Descoberta e Injeção:** Idealmente, a `TaskFactory` ou o `AutonomousAgent` poderiam ser responsáveis por fornecer as instâncias de `ITool` necessárias para uma `ITask`. Atualmente, algumas tasks podem instanciar suas tools diretamente (e.g., `EchoToolTask` usa `SimpleEchoTool`).

### Exemplos de `ITool`s Implementadas ou Conceituais:

#### 4.1. `SimpleEchoTool` (Implementada)
*   **Descrição:** Uma ferramenta de teste simples que recebe argumentos e os retorna.
*   **Uso:** Usada pela `EchoToolTask` para demonstrar a mecânica de uma task utilizando uma tool.

#### 4.2. `FileSystemListTool` (Mock Implementado)
*   **Descrição:** Conceitualmente, listaria arquivos e diretórios em um caminho especificado. A implementação atual é um placeholder/mock.
*   **Uso Futuro:** Permitiria ao agente explorar a estrutura de arquivos de um projeto através de uma `ITask` apropriada.

#### 4.3. Ferramentas Conceituais (Anteriormente Listadas, Funcionalidades Reatribuídas ou Futuras)

Muitas das tools listadas em versões anteriores da documentação (`MemoryTool`, `TaskTool` para gerenciamento de jobs, `AnnotationTool`, `FilesystemTool` completa, `TerminalTool`, `ProjectTool`, `MessageTool`) representam funcionalidades importantes. No sistema refatorado:
- **Gerenciamento de Jobs/Tasks:** É primariamente responsabilidade do `QueueService` (para jobs) e da orquestração do `AutonomousAgent` (para tasks e o ciclo de vida da Job em processamento). Uma `ITask` específica poderia ser criada para, por exemplo, "criar uma nova job", e ela internamente utilizaria o `JobDefinitionService`.
- **Memória e Anotações:** São conceitos que seriam gerenciados pelo `AutonomousAgent` através de seu `AgentInternalState` ou `ActivityContext` (campo `notes`). Interações complexas com uma base de conhecimento vetorial (RAG) poderiam ser encapsuladas em `ITool`s dedicadas e usadas por `ITask`s específicas no futuro.
- **Interações com Sistema de Arquivos, Terminal, etc.:** Seriam implementadas como `ITool`s específicas (e.g., `ReadFileTool`, `ExecuteCommandTool`) e usadas por `ITask`s apropriadas quando o `AutonomousAgent` (via LLM) decidir que tal ação é necessária.

A estratégia é ter um conjunto granular de `ITool`s que podem ser combinadas por `ITask`s mais complexas, sob a direção do `AutonomousAgent`.

## 5. Conclusão

A estrutura do Agente no Project Wiz é projetada para fornecer um framework poderoso e flexível para automação de tarefas. Ao combinar as capacidades de raciocínio do `AutonomousAgent` (utilizando um `ILLMAdapter`) com a execução estruturada de `ITask`s e `ITool`s, e o gerenciamento robusto de `Job`s pelo `QueueService` e `WorkerService`, o sistema pode realizar uma ampla gama de atividades. Esta arquitetura modular e centrada em responsabilidades claras é fundamental para a visão do Project Wiz como uma fábrica de software autônoma.
