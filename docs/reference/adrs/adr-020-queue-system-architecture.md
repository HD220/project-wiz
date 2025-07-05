# ADR-020: Arquitetura do Sistema de Filas (Queue)

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Um sistema de filas é essencial para processamento assíncrono de tarefas, como o processamento de jobs por agentes de IA. A análise revelou uma arquitetura composta por uma abstração (`AbstractQueue`), uma fachada (`DrizzleQueueFacade`) e serviços internos (`QueueServiceCore`, `JobProcessingService`, `QueueMaintenanceService`). Esta ADR formaliza essa arquitetura.

**Decisão:**

A arquitetura do sistema de filas será padronizada da seguinte forma:

**1. Abstração Principal (`AbstractQueue`):**
    *   **Localização:** `src_refactored/core/application/ports/queue/abstract-queue.port.ts` (ou `abstract-queue.interface.ts` se preferido, mas `.port.ts` é sugerido pela ADR-028 para este tipo de interface de aplicação).
    *   **Papel:** Define o contrato (porta) para todas as interações com o sistema de filas a partir da camada de aplicação ou de outros serviços. É uma classe abstrata que também funciona como `EventEmitter` para eventos de ciclo de vida de jobs e da fila.
    *   **Métodos Chave:** Define a API pública para adicionar jobs (`add`, `addBulk`), recuperar jobs (`getJob`, `getJobsByStatus`), gerenciar a fila (`pause`, `resume`, `clean`), e para workers interagirem com jobs (`fetchNextJobAndLock`, `markJobAsCompleted`, `markJobAsFailed`, `updateJobProgress`, `addJobLog`).
    *   **Eventos Emitidos (Exemplos):** `job.added`, `job.completed`, `job.failed`, `job.active`, `job.progress`, `queue.paused`, `queue.resumed`, `queue.closed`. (A lista completa deve ser documentada no `coding-standards.md` ou em uma documentação específica da API da fila).
    *   **Justificativa:** Desacopla a lógica da aplicação da implementação concreta da fila, permitindo diferentes implementações (e.g., Drizzle, Redis) no futuro.

**2. Implementação Concreta com Facade (`DrizzleQueueFacade`):**
    *   **Localização:** `src_refactored/infrastructure/queue/drizzle/drizzle-queue.facade.ts`.
    *   **Papel:** É a principal implementação concreta de `AbstractQueue` para a persistência baseada em Drizzle/SQLite. Atua como uma Facade, simplificando a interface para um subsistema mais complexo de serviços internos.
    *   **Herança:** `export class DrizzleQueueFacade<P, R> extends AbstractQueue<P, R>`.
    *   **Injeção de Dependência:** Recebe o `queueName`, `IJobRepository`, `defaultJobOptions` (para o construtor de `AbstractQueue`), e instâncias dos serviços internos (`QueueServiceCore`, `JobProcessingService`, `QueueMaintenanceService`).
    *   **Delegação:** A maioria dos métodos de `DrizzleQueueFacade` delega a chamada para o serviço interno apropriado (e.g., `add` para `coreService`, `fetchNextJobAndLock` para `processingService`).
    *   **Justificativa:** Fornece um ponto de entrada único e simplificado para o sistema de filas baseado em Drizzle, enquanto organiza a lógica interna em componentes mais coesos.

**3. Serviços Internos da Fila (Composição):**
    *   Estes serviços residem em `src_refactored/infrastructure/queue/drizzle/` e são compostos pela `DrizzleQueueFacade`. Eles NÃO implementam `AbstractQueue` diretamente.
    *   **`QueueServiceCore<P, R>`:**
        *   **Responsabilidade:** Lógica central de preparação das propriedades e instanciação de `JobEntity` (usando `new JobEntity(props)`, conforme ADR-010), persistência inicial (usando `IJobRepository.save()`), recuperação básica de jobs, e emissão de eventos centrais relacionados à adição e estado da fila (e.g., `job.added`, `queue.paused`).
        *   Não lida com a lógica de processamento de jobs por workers ou manutenção da fila.
    *   **`JobProcessingService<P, R>`:**
        *   **Responsabilidade:** Gerencia a interação entre workers e jobs. Implementa os métodos de `AbstractQueue` que são tipicamente chamados por um `WorkerService`, como `fetchNextJobAndLock`, `extendJobLock`, `markJobAsCompleted`, `markJobAsFailed`, `updateJobProgress`, `addJobLog`.
        *   Interage com `IJobRepository` para atualizar o estado dos jobs durante o processamento.
    *   **`QueueMaintenanceService<P, R>`:**
        *   **Responsabilidade:** Gerencia tarefas de manutenção da fila, como detecção e tratamento de jobs parados (stalled), e limpeza de jobs antigos (conforme o método `clean` da `IJobRepository`).
        *   Expõe métodos como `startMaintenance()` e `stopMaintenance()`.
    *   **Justificativa (Separação):** Divide as complexas responsabilidades de um sistema de filas em componentes menores, cada um com um foco claro (SRP), melhorando a manutenibilidade e testabilidade de cada parte.

**4. Fluxo de Criação de Job:**
    1.  Um Serviço de Aplicação ou Caso de Uso obtém uma instância de `AbstractQueue` (e.g., `DrizzleQueueFacade` injetada via DI).
    2.  Chama `abstractQueue.add("nomeDoJob", payload, options)`.
    3.  A chamada é delegada para `DrizzleQueueFacade.add(...)`.
    4.  `DrizzleQueueFacade` delega para `QueueServiceCore.add(...)`.
    5.  `QueueServiceCore` executa:
        *   Prepara as propriedades necessárias (incluindo instanciação de VOs se `payload` ou `options` contiverem dados crus para eles) e então instancia com `new JobEntity<P, R>(props)` para criar a instância da entidade (conforme ADR-010).
        *   `this.jobRepository.save(jobEntity)` para persistir a nova entidade no banco de dados (que, para `DrizzleJobRepository`, fará um upsert).
        *   `this.emit("job.added", jobEntity)` para notificar sobre o novo job.
    6.  A `JobEntity` criada é retornada ao chamador original.
    *   **Diagrama Mermaid (Simplificado):**
        ```mermaid
        sequenceDiagram
            participant AppService as Camada de Aplicação
            participant AQ as AbstractQueue (DI)
            participant DQF as DrizzleQueueFacade
            participant QSC as QueueServiceCore
            participant JE as JobEntity (classe)
            participant JR as IJobRepository (DI)

            AppService->>+AQ: add(jobName, data, opts)
            AQ->>+DQF: add(jobName, data, opts)
            DQF->>+QSC: add(jobName, data, opts)
            QSC->>QSC: Prepara props para JobEntity
            QSC->>JE: new JobEntity(props)
            JE-->>-QSC: jobEntity
            QSC->>+JR: save(jobEntity)
            JR-->>-QSC: Promise<void> (resolvida)
            QSC-->>-DQF: jobEntity
            DQF-->>-AQ: jobEntity
            AQ-->>-AppService: jobEntity
        ```

**5. Estratégia de Emissão de Eventos:**
    *   **Padrão:**
        *   A instância de `AbstractQueue` (i.e., `DrizzleQueueFacade`) é a principal fonte de eventos relacionados ao ciclo de vida dos jobs e da fila, conforme definido pelo contrato de `AbstractQueue`.
        *   Serviços internos como `QueueServiceCore` e `JobProcessingService` podem ter seus próprios `EventEmitter` para eventos internos ou específicos de sua implementação, se necessário, mas os eventos públicos definidos por `AbstractQueue` são emitidos pela fachada.
        *   O `inversify.config.ts` ao construir o `DrizzleQueueFacade` e seus componentes internos deve garantir que a propagação ou delegação de emissão de eventos esteja correta, se os serviços internos precisarem sinalizar eventos que a fachada deve emitir. (A análise do `inversify.config.ts` mostrou que o `DrizzleQueueFacade` é o `EventEmitter` principal, e os serviços internos recebem seus próprios emissores ou não emitem eventos de `AbstractQueue` diretamente).
    *   **Justificativa:** Consistência para os consumidores de eventos da fila.

**6. Injeção de Dependência (DI):**
    *   **Padrão:** A instância de `AbstractQueue` para uma fila nomeada (e.g., "default") é registrada no container DI usando um token gerado por `getQueueServiceToken("queueName")`.
    *   `DrizzleQueueFacade` e seus serviços internos (`QueueServiceCore`, `JobProcessingService`, `QueueMaintenanceService`) são construídos e injetados conforme definido em `inversify.config.ts` (ver ADR-019).
    *   **Justificativa:** Permite que a aplicação obtenha uma instância funcional da fila de forma desacoplada.

**7. Tratamento de Erros:**
    *   **Padrão:** Métodos de `AbstractQueue` (e suas implementações) devem lançar exceções customizadas (e.g., `InfrastructureError`, `ApplicationError`, conforme ADR-014) em caso de falhas na interação com o `IJobRepository` ou outras falhas internas da lógica da fila.
    *   Não devem vazar exceções específicas da implementação do repositório.
    *   **Justificativa:** Consistência no tratamento de erros e desacoplamento.

**8. Configuração:**
    *   **Padrão:** O `queueName` e `defaultJobOptions` são passados para o construtor de `AbstractQueue` (e, por conseguinte, para `DrizzleQueueFacade` e `QueueServiceCore`).
    *   Esta configuração deve ser gerenciada pela configuração de DI no `inversify.config.ts`.
    *   **Justificativa:** Permite configurar múltiplas filas com diferentes nomes e opções padrão.

**9. Extensibilidade para Outras Implementações de Fila:**
    *   **Padrão:** Para introduzir uma nova tecnologia de fila (e.g., Redis), seria necessário:
        1.  Criar uma nova implementação de `IJobRepository` para essa tecnologia (e.g., `RedisJobRepository`).
        2.  Criar novas implementações para `QueueServiceCore`, `JobProcessingService`, `QueueMaintenanceService` adaptadas à nova tecnologia.
        3.  Criar uma nova fachada (e.g., `RedisQueueFacade`) que estenda `AbstractQueue` e componha os novos serviços internos.
        4.  Registrar a nova fachada no DI container com um nome de fila apropriado.
    *   **Justificativa:** A abstração `AbstractQueue` e a separação de responsabilidades facilitam a extensão.

**Consequências:**
*   Arquitetura clara e modular para o sistema de filas.
*   Definição precisa do fluxo de criação e persistência de jobs.
*   Separação de responsabilidades entre a interface pública da fila, a lógica central, o processamento de jobs e a manutenção.
*   Facilidade para testar e manter cada componente do sistema de filas.
*   Possibilidade de introduzir novas implementações de fila no futuro com impacto controlado.

---
**Notas de Implementação para LLMs:**
*   Para adicionar um job à fila "default", injete `AbstractQueue` usando o token `getQueueServiceToken("default")` e chame seu método `add()`.
*   A lógica de criação da `JobEntity` (usando `new JobEntity(props)` após preparar as props) e sua persistência inicial estão encapsuladas dentro da implementação da fila (especificamente `QueueServiceCore`).
*   Entenda a distinção de responsabilidades entre `DrizzleQueueFacade`, `QueueServiceCore`, `JobProcessingService` e `QueueMaintenanceService` ao trabalhar com o código da fila.
