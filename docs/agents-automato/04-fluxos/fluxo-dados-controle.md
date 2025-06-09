# Fluxo de Dados e Controle

Este documento detalha o fluxo geral de dados e controle de uma Activity no sistema de agentes autônomos, desde sua iniciação até sua conclusão ou re-agendamento. Ele descreve como os dados e o controle passam entre os principais componentes do sistema.

## Visão Geral do Fluxo

O fluxo de uma Activity começa com a sua criação, passa pelo enfileiramento, é processada por um Worker que interage com o AutonomousAgent, que por sua vez utiliza Tasks, Tools e LLMs. O resultado do processamento é então retornado para a fila, que atualiza o status da Activity.

## Diagrama do Fluxo de Dados e Controle

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

## Descrição Detalhada do Fluxo

1.  **Iniciação da Activity:**

    - Um evento externo, como uma requisição do usuário através da interface (camada **External**), é capturado pelos `Electron IPC Handlers` (camada **Infrastructure**).
    - O `IPC Handler` invoca o `ProcessJobService` (camada **Application**).
    - O `ProcessJobService` utiliza o `CreateJobUseCase` (camada **Application**) para criar uma nova entidade `Job` (camada **Domain**), que representa a Activity. Esta `Job` inclui o `ActivityContext` inicial (Value Object na camada **Domain**).
    - O `CreateJobUseCase` adiciona a `Job` à fila através da `JobQueue Interface` (camada **Application**).
    - A implementação concreta da fila (`QueueImpl` na camada **Infrastructure**) persiste a `Job` no banco de dados (Drizzle/SQLite) utilizando o `JobRepository Interface` (camada **Application**) e sua implementação (`JobRepoImpl` na camada **Infrastructure**). A `Job` agora está no status `PENDING` na fila.

2.  **Consumo pela Fila e Worker:**

    - A `QueueImpl` notifica o `WorkerPool Interface` (camada **Application**) sobre a nova `Job` disponível.
    - A implementação do pool de workers (`WorkerPoolImpl` na camada **Infrastructure**) gerencia os processos de worker.
    - Um `Worker Process` (camada **Infrastructure**) disponível obtém uma `Job` da fila utilizando a `JobQueue Interface`.
    - A `QueueImpl` atualiza o status da `Job` para `EXECUTING` no banco de dados.

3.  **Processamento pelo AutonomousAgent:**

    - O `Worker Process` invoca o `AutonomousAgent Service` (camada **Application**), passando a entidade `Job` completa.
    - Dentro do `AutonomousAgent Service`, o loop de raciocínio do agente é ativado.
    - O agente carrega seu `AgentInternalState` (entidade na camada **Domain**) utilizando o `AgentStateRepository Interface` (camada **Application**) e sua implementação (`AgentStateRepoImpl` na camada **Infrastructure**), que interage com o Drizzle.
    - O `AutonomousAgent Service` utiliza a `LLM Interface` (camada **Application**) para interagir com um modelo de linguagem (LLM). Ele passa o `AgentInternalState` e o `ActivityContext` da `Job` atual como entrada para o LLM.
    - A implementação concreta do LLM (`LLMAdapters` na camada **Infrastructure**) processa a requisição e retorna a resposta do LLM.
    - Com base na resposta do LLM, o `AutonomousAgent Service` decide a próxima ação a ser tomada (por exemplo, chamar uma Tool, enviar uma mensagem, atualizar um plano).

4.  **Execução da Task (se necessário):**

    - Se a ação decidida pelo LLM for a execução de uma Task (como chamar uma Tool), o `AutonomousAgent Service` invoca o `IAgentService Interface` (camada **Application**).
    - A implementação do `IAgentService` utiliza o `TaskFactory` (camada **Application**) para instanciar a `Task` apropriada (que implementa a `Task Interface` na camada **Domain**) com base na decisão do agente.
    - A `Task` executa sua lógica. Durante a execução, a `Task` pode interagir com `Tools` (utilizando a `Tool Interface` na camada **Domain** e a `Tool Interface` na camada **Application**, que são implementadas pelos `ToolAdapters` na camada **Infrastructure**) e/ou com `LLMs` (utilizando a `LLM Interface` na camada **Application** e os `LLMAdapters` na camada **Infrastructure**).
    - O resultado da execução da `Task` é retornado para o `IAgentService Interface`.
    - O `IAgentService Interface` retorna o resultado da `Task` para o `AutonomousAgent Service`.

5.  **Atualização da Activity e Continuação/Conclusão:**

    - O `AutonomousAgent Service` recebe o resultado da `Task` (ou a resposta direta do LLM se nenhuma Task foi executada).
    - Ele atualiza o `ActivityContext` dentro da entidade `Job` com o resultado e quaisquer reflexões ou notas relevantes.
    - O `AutonomousAgent Service` decide se a Activity foi concluída neste ciclo de processamento.
    - Se a Activity não foi concluída e requer mais passos, o `AutonomousAgent Service` pode retornar um resultado indicando que a `Job` deve ser re-agendada (por exemplo, retornando `undefined`).
    - Se a Activity foi concluída, o `AutonomousAgent Service` retorna o resultado final da Activity para o `Worker Process`.

6.  **Conclusão ou Re-agendamento pela Fila:**
    - O `Worker Process` recebe o resultado do `AutonomousAgent Service`.
    - Com base no resultado, o `Worker Process` notifica a `Queue Interface` sobre o status final da `Job` (`FINISHED`, `FAILED`, ou `DELAYED` para re-agendamento).
    - A `QueueImpl` atualiza o status persistido da `Job` no banco de dados.
    - Se o status for `DELAYED`, a `Job` eventualmente retornará para o status `PENDING` na fila, reiniciando o ciclo de processamento quando um Worker a pegar novamente.

Este fluxo demonstra a interação contínua entre os componentes, impulsionada pelo raciocínio do AutonomousAgent e gerenciada pela Queue, garantindo o processamento assíncrono e contextual das Activities.
