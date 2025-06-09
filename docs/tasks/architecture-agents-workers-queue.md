# Arquitetura: Sistema de Agentes Autônomos e Processamento de Jobs

Este documento descreve a arquitetura consolidada para o sistema de processamento assíncrono e de agentes autônomos no `project-wiz`, combinando os conceitos de Jobs, Workers, Queues e a nova abordagem orientada a Activities para Agentes. A arquitetura segue os princípios da Clean Architecture, garantindo a separação de responsabilidades e a independência do domínio em relação a detalhes de infraestrutura.

## 1. Princípios Arquiteturais

*   **Clean Architecture:** Separação clara em camadas (Domain, Application, Infrastructure) com dependências fluindo de fora para dentro.
*   **Orientação a Atividades:** O Agente Autônomo opera com base em unidades de trabalho discretas (`Activities`), cada uma com seu próprio contexto e histórico.
*   **Persistência como Detalhe de Infraestrutura:** O mecanismo de persistência (SQLite via Drizzle) é isolado na camada de Infraestrutura.
*   **Processamento Assíncrono:** Utilização de `Queue` e `WorkerPool` para executar `Jobs`/`Activities` fora do thread principal.
*   **Comunicação Inter-processos (Electron):** A comunicação entre o Main e o Renderer Process é tratada na camada de Infraestrutura via IPC.
*   **Object Calisthenics:** Aplicação rigorosa das regras de Object Calisthenics para garantir código limpo, modular e de alta qualidade.

## 2. Camadas da Arquitetura

### 2.1. Domain Layer (Núcleo)

Contém as regras de negócio e entidades essenciais, independentes de qualquer tecnologia ou framework.

*   **Entidades:**
    *   `Job` (estendida para representar uma `Activity`): Encapsula todos os dados e o estado de uma unidade de trabalho/atividade, incluindo o `ActivityContext`.
    *   `Worker`: Representa uma instância de worker capaz de processar Jobs.
    *   `Queue`: Define a interface para o gerenciamento de Jobs (adicionar, obter, atualizar status).
    *   `AgentInternalState`: Entidade que representa o estado global de negócio de um Agente.
    *   `ActivityContext`: Value Object ou entidade aninhada dentro de `Job.data` que armazena o contexto específico de uma Activity (histórico, notas, plano, etc.).
    *   `Task`: Interface ou classe base para a lógica de execução acionável.
    *   `Tool`: Interface ou classe base para as capacidades externas que as Tasks podem utilizar.
*   **Value Objects:** Objetos imutáveis que representam conceitos do domínio (ex: `JobId`, `ActivityType`, `JobStatus`, `RetryPolicy`, `ActivityHistoryEntry`).
*   **Interfaces de Repositório:** Contratos que definem as operações de persistência para as entidades (ex: `JobRepository.interface.ts`, `AgentStateRepository.interface.ts`).

### 2.2. Application Layer (Casos de Uso e Orquestração)

Contém a lógica de aplicação que orquestra as entidades do domínio para realizar tarefas específicas. Depende apenas da camada de Domínio.

*   **Use Cases:** Classes que implementam a lógica para casos de uso específicos (ex: `CreateJobUseCase`, `ProcessJobUseCase` - este orquestra o `AutonomousAgent`).
*   **Ports (Interfaces de Saída):** Interfaces que a camada de Aplicação usa para interagir com a camada de Infraestrutura (ex: `JobQueue.interface.ts`, `WorkerPool.interface.ts`, `IAgentService.interface.ts`, `LLMAdapter.interface.ts`, `ToolAdapter.interface.ts`).
*   **Serviços de Aplicação:**
    *   `QueueService`: Implementa a lógica de negócio da fila, utilizando o `JobRepository`.
    *   `WorkerPool`: Gerencia o ciclo de vida dos Workers e distribui Jobs.
    *   `AutonomousAgent` (implementado como um serviço ou orquestrador): Contém o loop de raciocínio do Agente, utilizando LLMs e Tools via adapters/services. Orquestra a execução de Tasks.
    *   `IAgentService`: Interface que o `AutonomousAgent` usa para despachar a execução de Tasks.
    *   `ProcessJobService`: Ponto de entrada para criar e enfileirar novas Jobs/Activities.
*   **Factories:** `TaskFactory` para instanciar a Task correta com base no tipo de Activity/ação.

### 2.3. Infrastructure Layer (Implementações Específicas)

Contém as implementações concretas das interfaces definidas nas camadas internas. Depende das camadas de Domínio e Aplicação.

*   **Repositórios:** Implementações concretas das interfaces de repositório do Domínio (ex: `JobDrizzleRepository.ts`, `AgentStateDrizzleRepository.ts`).
*   **Adapters:** Implementações concretas das interfaces de Ports da Aplicação para interagir com tecnologias externas (ex: `DrizzleAdapter`, `ElectronIPCAdapter`, `OpenAILLMAdapter`, `FileSystemToolAdapter`).
*   **Serviços de Infraestrutura:** Implementações concretas dos serviços de aplicação que dependem de detalhes de infraestrutura (ex: `ChildProcessWorkerPoolService`, `QueueService` - a implementação concreta que usa o repositório Drizzle).
*   **Workers:** O código real dos processos worker que rodam as Jobs.

## 3. Componentes Chave e Suas Responsabilidades

*   **Job/Activity (Entidade de Domínio):** Representa a unidade de trabalho persistida e o contexto de uma atividade do agente. Gerenciada pela Queue.
*   **ActivityContext (Value Object/Aninhado):** Armazena o histórico, notas, plano e outros dados específicos de uma Activity. Parte da entidade Job.
*   **AgentInternalState (Entidade de Domínio):** Armazena o estado global de negócio de um Agente. Persistido separadamente.
*   **Queue (Interface no Domínio, Implementação na Infraestrutura):** Gerencia o ciclo de vida, status, retentativas e dependências das Jobs/Activities.
*   **Worker (Entidade de Domínio, Implementação na Infraestrutura):** Orquestra a execução de uma Job/Activity, invocando o AutonomousAgent.
*   **WorkerPool (Interface na Aplicação, Implementação na Infraestrutura):** Gerencia um conjunto de Workers.
*   **AutonomousAgent (Serviço na Aplicação):** Implementa o loop de raciocínio do Agente, utilizando LLMs e Tools. Orquestra a execução de Tasks.
*   **IAgentService (Interface na Aplicação):** Interface para o AutonomousAgent despachar a execução de Tasks.
*   **Task (Interface/Base no Domínio):** Encapsula a lógica de execução acionável, interage com Tools e LLMs.
*   **TaskFactory (Factory na Aplicação):** Cria instâncias de Tasks.
*   **ProcessJobService (Serviço na Aplicação):** Ponto de entrada para criar e enfileirar novas Jobs/Activities.
*   **Tools (Interfaces no Domínio, Adapters na Infraestrutura):** Representam capacidades externas.
*   **LLMs (Interface na Aplicação, Adapters na Infraestrutura):** Modelos de linguagem utilizados pelo Agente e Tasks.
*   **Repositórios (Interfaces no Domínio, Implementações na Infraestrutura):** Gerenciam a persistência.

## 4. Fluxo de Dados e Controle (Consolidado)

O fluxo combina o gerenciamento de Jobs pela Queue com o loop de raciocínio do Agente:

1.  **Criação:** Um evento externo (ex: requisição do usuário via IPC no Electron) chega na camada de Infraestrutura. Um handler na Infraestrutura (ex: `JobHandlers.ts`) utiliza o `ProcessJobService` (na Aplicação) para criar uma nova `Job`/`Activity`.
2.  O `ProcessJobService` cria a entidade `Job` (Domínio) com o `ActivityContext` inicial e a adiciona à `Queue` (via interface na Aplicação, implementada na Infraestrutura).
3.  A implementação da `Queue` na Infraestrutura persiste a `Job` (usando o `JobRepository` implementado na Infraestrutura, que usa Drizzle).
4.  A `Queue` notifica o `WorkerPool` (interface na Aplicação, implementado na Infraestrutura) sobre a nova Job.
5.  Um `Worker` (processo filho na Infraestrutura) obtém a `Job` da `Queue` (usando a interface da Queue na Aplicação). A `Queue` atualiza o status para `executing`.
6.  O `Worker` invoca o `AutonomousAgent` (serviço na Aplicação), passando a `Job` completa.
7.  Dentro do `AutonomousAgent` (na Aplicação):
    *   Carrega `AgentInternalState` (usando Repositório na Aplicação/Infraestrutura).
    *   Usa LLM (via `LLMAdapter` na Infraestrutura) com `AgentInternalState` e `ActivityContext` para raciocinar.
    *   Decide a próxima ação.
    *   Atualiza `ActivityContext` na `Job`.
    *   Se a ação for uma Task, invoca `IAgentService` (interface na Aplicação).
8.  A implementação do `IAgentService` (na Aplicação ou Infraestrutura, dependendo da complexidade) usa o `TaskFactory` (na Aplicação) para criar a `Task` (Domínio/Interface).
9.  A `Task` executa sua lógica (no Domínio/Aplicação), utilizando `Tools` (via `ToolAdapter` na Infraestrutura) e/ou LLMs (via `LLMAdapter`).
10. O resultado da `Task` retorna para o `IAgentService`, depois para o `AutonomousAgent`.
11. O `AutonomousAgent` (na Aplicação) atualiza o `ActivityContext` na `Job` com o resultado e reflexões. Decide se a Activity está completa para este ciclo.
12. O `AutonomousAgent` retorna o resultado (final ou `undefined`) para o `Worker`.
13. O `Worker` (na Infraestrutura) notifica a `Queue` (via interface na Aplicação) sobre o resultado (finished, failed, delayed).
14. A implementação da `Queue` na Infraestrutura atualiza o status persistido da `Job`.
15. Se a Activity não foi concluída, a `Job` (agora `delayed`) eventualmente retorna para `pending` na `Queue`, reiniciando o ciclo quando um Worker a pegar novamente.

```mermaid
graph TD
    subgraph External
        User[Usuário/Sistema Externo]
    end

    subgraph Infrastructure
        IPC[Electron IPC Handlers]
        Drizzle[Drizzle/SQLite]
        WorkerProcess[Worker Process]
        ToolAdapters[Implementações de Tools]
        LLMAdapters[Implementações de LLMs]
        JobRepoImpl[JobRepository (Drizzle)]
        AgentStateRepoImpl[AgentStateRepository (Drizzle)]
        QueueImpl[Queue (Implementação)]
        WorkerPoolImpl[WorkerPool (Implementação)]
    end

    subgraph Application
        ProcessJobService[ProcessJobService]
        CreateJobUC[CreateJobUseCase]
        ProcessJobUC[ProcessJobUseCase]
        QueueInterface[JobQueue Interface]
        WorkerPoolInterface[WorkerPool Interface]
        AutonomousAgentService[AutonomousAgent Service]
        IAgentServiceInterface[IAgentService Interface]
        TaskFactory[TaskFactory]
        LLMInterface[LLM Interface]
        ToolInterface[Tool Interface]
        JobRepoInterface[JobRepository Interface]
        AgentStateRepoInterface[AgentStateRepository Interface]
    end

    subgraph Domain
        JobEntity[Job/Activity Entity]
        WorkerEntity[Worker Entity]
        QueueEntity[Queue Entity]
        AgentStateEntity[AgentInternalState Entity]
        ActivityContextVO[ActivityContext VO]
        TaskInterface[Task Interface]
        ToolInterfaceDomain[Tool Interface]
    end

    User --> IPC
    IPC --> ProcessJobService
    ProcessJobService --> CreateJobUC
    CreateJobUC --> JobEntity
    CreateJobUC --> ActivityContextVO
    CreateJobUC --> QueueInterface
    QueueInterface --> QueueImpl
    QueueImpl --> JobRepoInterface
    JobRepoInterface --> JobRepoImpl
    JobRepoImpl --> Drizzle

    QueueImpl -- Notifica --> WorkerPoolInterface
    WorkerPoolInterface --> WorkerPoolImpl
    WorkerPoolImpl --> WorkerProcess

    WorkerProcess --> QueueInterface: Get Job (Status PENDING -> EXECUTING)
    QueueInterface --> QueueImpl
    QueueImpl --> JobRepoInterface
    JobRepoInterface --> JobRepoImpl

    WorkerProcess --> AutonomousAgentService: processActivity(Job)
    AutonomousAgentService --> AgentStateRepoInterface: Load State
    AgentStateRepoInterface --> AgentStateRepoImpl
    AgentStateRepoImpl --> Drizzle

    AutonomousAgentService --> LLMInterface: Reason (with AgentState + ActivityContext)
    LLMInterface --> LLMAdapters

    AutonomousAgentService -- Decides Task --> IAgentServiceInterface
    IAgentServiceInterface --> TaskFactory
    TaskFactory --> TaskInterface

    TaskInterface --> ToolInterfaceDomain: Use Tool
    ToolInterfaceDomain --> ToolInterface: Use Tool (Application Port)
    ToolInterface --> ToolAdapters

    TaskInterface --> LLMInterface: Use LLM
    LLMInterface --> LLMAdapters

    ToolAdapters --> WorkerProcess: Tool Result
    LLMAdapters --> WorkerProcess: LLM Result

    TaskInterface --> IAgentServiceInterface: Task Result
    IAgentServiceInterface --> AutonomousAgentService: Task Result

    AutonomousAgentService -- Updates --> JobEntity: Update ActivityContext
    AutonomousAgentService -- Returns Result --> WorkerProcess

    WorkerProcess --> QueueInterface: Notify Status (FINISHED/FAILED/DELAYED)
    QueueInterface --> QueueImpl
    QueueImpl --> JobRepoInterface
    JobRepoInterface --> JobRepoImpl

    JobEntity --> ActivityContextVO
    JobEntity --> AgentStateEntity
    JobEntity --> WorkerEntity
    JobEntity --> QueueEntity

    AgentStateEntity --> AgentStateRepoInterface
    ActivityContextVO --> JobEntity
    WorkerEntity --> WorkerPoolInterface
    QueueEntity --> QueueInterface

    style Domain fill:#f9f,stroke:#333
    style Application fill:#bbf,stroke:#333
    style Infrastructure fill:#f96,stroke:#333
    style External fill:#ccf,stroke:#333
```

## 5. Considerações de Implementação e Desafios

*   **Gerenciamento de `activityHistory`:** Implementar estratégias eficientes para lidar com o crescimento do histórico de conversas dentro do `ActivityContext` para otimizar chamadas ao LLM (sumarização, memória de longo prazo).
*   **Serialização/Desserialização:** Garantir a correta serialização e desserialização do `ActivityContext` (JSON) para persistência no campo `data` da `Job`.
*   **Idempotência:** Projetar Tasks e operações do Agente para serem idempotentes sempre que possível.
*   **Sincronização do `AgentInternalState`:** Gerenciar a persistência e o carregamento consistente do estado global do Agente.
*   **Tratamento de Erros:** Implementar um tratamento de erros robusto em todas as camadas, garantindo que as falhas sejam capturadas, registradas e tratadas pela política de retentativa da Queue.
*   **Comunicação entre Componentes:** Definir interfaces claras e mecanismos de comunicação eficientes entre os componentes (Worker chamando Agent, Agent chamando IAgentService, Task usando Tools/LLMs).
*   **Testabilidade:** Projetar o código para ser facilmente testável em unidades isoladas e na integração entre camadas.

Este documento serve como base para a reescrita do sistema, detalhando a estrutura e o fluxo esperados. Os próximos passos incluem a documentação das decisões arquiteturais chave (ADRs) e a decomposição deste plano em tarefas de implementação detalhadas.