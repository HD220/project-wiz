# Documentação da Arquitetura: Workers, Agentes e Atividades

## 1. Visão Geral

Este documento detalha a arquitetura de processamento assíncrono e de agentes autônomos no `project-wiz`, consolidando e expandindo os conceitos de `Jobs`, `Tasks`, `Workers` e introduzindo a `Activity` como a unidade fundamental de trabalho para os `Agentes`. A arquitetura visa a robustez, escalabilidade e a capacidade de agentes de IA operarem de forma autônoma e contextualmente relevante. O sistema é construído sobre os princípios da Clean Architecture, com a separação clara de responsabilidades entre as camadas de Domínio, Aplicação e Infraestrutura, e utilizando o Electron para a aplicação desktop.

## 2. Harmonização Conceitual

Para alinhar o sistema de `Jobs` existente com a nova demanda dos `Agentes Autônomos`, faz-se necessária a seguinte harmonização conceitual:

### 2.1. Job como Activity Enriquecida

A entidade `Job`, historicamente uma representação persistida de uma unidade de trabalho e gerenciada pela `Queue`, será estendida para atuar como uma "Activity" completa sob a perspectiva do Agente Autônomo. Uma `Job` encapsulará todo o contexto e histórico de uma `Activity` do agente.

**Atributos da Job (agora Activity):**

*   `id`: Identificador único da Activity.
*   `type`: Categoria da Activity (ex: `USER_REQUEST`, `AGENT_REQUEST`, `PLANNING`, `EXECUTION`, `COMMUNICATION`, `REFLECTION`, `ERROR_HANDLING`, `VALIDATION`, `INFORMATION_GATHERING`).
*   `description`: Breve descrição da tarefa.
*   `status`: Estado atual da Activity (ex: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`, `FAILED`, `AWAITING_EXTERNAL_INPUT`, `AWAITING_TOOL_OUTPUT`).
*   `priority`: Nível de urgência (numérico).
*   `createdAt` / `lastUpdatedAt`: Timestamps.
*   `payload`: Continua a ser o payload de entrada inicial da Job/Activity.
*   `data`: Informações mutáveis que podem ser salvas durante a execução.
*   `result`: Resultado final da execução da Activity.
*   `max_attempts`, `attempts`, `max_retry_delay`, `retry_delay`, `delay`: Mecanismos de retentativa e atraso inerentes à `Job`.
*   `depends_on`: Lista de `jobIds` (agora `activityIds`) das quais esta Activity depende.

**`context` (novo objeto vital na `Job.data`):**

Para suportar o conceito de `Activity` conforme definido em `docs/agents-implementation-referencie.md`, o campo `data` da `Job` será utilizado para armazenar um objeto `context` (ou similar) que conterá os detalhes específicos de uma Activity:

*   `messageContent`, `sender` (se `type` for `USER_REQUEST`/`AGENT_REQUEST`).
*   `toolName`, `toolArgs` (se `type` for `EXECUTION`).
*   `goalToPlan`, `plannedSteps` (para `PLANNING`).
*   `activityNotes`: Notas internas e reflexões do Agente sobre esta Activity, essenciais para o raciocínio.
*   `validationCriteria`, `validationResult` (para `VALIDATION`).
*   **`activityHistory`**: Um array de mensagens que armazena a conversa e interações relacionadas exclusivamente a esta Activity. Isso garante o contexto isolado para o LLM.
*   `parentId`: ID da Activity pai, se for uma sub-Activity.
*   `relatedActivityIds` / `blockingActivityId`: Para encadeamento e relacionamento entre Activities.

### 2.2. Task: A Lógica de Execução Acionável

A `Task` permanece como a lógica de execução em memória, o "como" de uma parte computacional do trabalho. Ela representa uma ação acionável específica dentro do contexto de uma `Job`/`Activity`. A `Task` não tem preocupações com persistência ou status de fila; ela recebe os dados da `Job` (que agora inclui o `ActivityContext`) e utiliza as `Tools` e `LLMs` para realizar seu trabalho.

### 2.3. Agent Internal State vs. Activity Context

É crucial distinguir entre:

*   **`AgentInternalState`**: Um objeto global e conciso que armazena informações de negócio gerais do Agente (ex: `currentProjectId`, `currentGoal`, `generalNotes`, `promisesMade`). Este estado é persistente, mas não é um histórico de conversas. Ele representa o conhecimento e o foco de alto nível do Agente.
*   **`Activity Context` (`Job.data.context`)**: O contexto específico de uma `Activity` individual. Contém o `activityHistory` (conversa daquela Activity), `activityNotes`, `plannedSteps`, etc. Este contexto é passado para o LLM quando o Agente está raciocinando sobre uma `Activity` específica, garantindo que o LLM opere sobre informações relevantes e isoladas.

## 3. Componentes e Fluxo de Interação Detalhado

### 3.1. Queue (Fila)

A `Queue` continua sendo o componente central responsável pelo gerenciamento do ciclo de vida das `Jobs` (agora `Activities`). Ela persiste o estado das Activities, controla as transições de status (`pending`, `executing`, `finished`, `failed`, `delayed`, `waiting`), gerencia retentativas e dependências. A `Queue` é a única que atualiza o status persistido da `Job`/`Activity`.
Ela agora gerenciará Activities enriquecidas com o `ActivityContext` em seu campo `data`.

### 3.2. Worker

O `Worker` (instanciado e gerenciado pelo `WorkerPool`) é o orquestrador primário da execução de `Jobs`/`Activities` em conjunto com o `AutonomousAgent`.

*   **Funcionamento:**
    1.  O `Worker` obtém uma `Job` (`Activity`) da `Queue`.
    2.  Ele invoca o `AutonomousAgent` para processar esta `Job`/`Activity`, passando a `Job` completa.
    3.  Monitora o retorno do `AutonomousAgent`:
        *   **Retorno de Sucesso (valor):** O `Worker` notifica a `Queue` para marcar a `Job` como `finished` com o resultado.
        *   **Retorno Vazio (`undefined`/`null`):** O `Worker` notifica a `Queue` para marcar a `Job` como `delayed` (para re-agendamento, permitindo que o `AutonomousAgent` continue seu raciocínio em uma iteração futura).
        *   **Lançamento de Erro:** O `Worker` captura a exceção e notifica a `Queue` para lidar com a retentativa ou marcar a `Job` como `failed`.

### 3.3. AutonomousAgent

O `AutonomousAgent` é a classe controladora que implementa o "Loop Agente" (`step` method) descrito em `docs/agents-implementation-referencie.md`. Ele é o coração do raciocínio e da tomada de decisões.

*   **Responsabilidades:**
    *   **Raciocínio:** O `step` method do `AutonomousAgent` é onde o LLM é invocado. Ele recebe o `AgentInternalState` e o `ActivityContext` da `Job` atual para raciocinar e decidir a próxima ação.
    *   **Gerenciamento de Activities:** Interage com o `QueueService`/`JobRepository` para obter `Jobs`/`Activities` (que são as Activities do Agente) e para atualizar seu `context` (`Job.data.context`).
    *   **Despacho de Tasks:** Quando o raciocínio do LLM indica a necessidade de executar uma `Task` (ex: chamar uma Tool), o `AutonomousAgent` utiliza o `IAgentService` para despachar a execução.
    *   **Gerenciamento de Estado:** Atualiza seu `AgentInternalState` (contexto de negócio global) com base no progresso das Activities.

### 3.4. IAgentService

O `IAgentService` serve como uma interface para que o `AutonomousAgent` possa despachar `Tasks` para execução por um `Worker`. Seu papel é mais focado em expor a capacidade de "fazer" algo, muitas vezes resultando na criação de uma nova `Job` (Activity) na fila ou na atualização de uma existente, mas de forma mais abstrata, sem lidar diretamente com a `Queue` ou `JobRepository`.

*   Pode ser responsável por:
    *   Criar novas `Jobs` (Activities) para serem processadas por outros Workers/Agentes.
    *   Encaminhar a `Job` atual para o `TaskFactory` para instanciar a `Task` correta e executá-la, retornando o resultado para o `AutonomousAgent`.

### 3.5. ProcessJobService

O `ProcessJobService` é o ponto de entrada inicial para a criação e iniciação de `Jobs`/`Activities` no sistema. Ele recebe uma requisição para processar um trabalho (que se tornará uma `Job`/`Activity`) e a enfileira.

*   **Funcionamento:**
    1.  Recebe uma solicitação (payload).
    2.  Cria uma nova entidade `Job` (que será a `Activity` inicial).
    3.  Adiciona esta `Job` à `Queue` através do `QueueService`/`JobRepository`.

## 4. Fluxo de Dados e Controle

O fluxo geral de uma Activity é o seguinte:

1.  **Iniciação:** Um `ProcessJobService` recebe uma requisição e cria uma nova `Job` (Activity), adicionando-a à `Queue`. Esta `Job` estará no status `pending`.
2.  **Consumo pelo Worker:** O `WorkerPool` monitora a `Queue`. Um `Worker` disponível puxa uma `Job` do status `pending` e a move para `executing` na `Queue`.
3.  **Processamento pelo AutonomousAgent:** O `Worker` passa a `Job` para o `AutonomousAgent` via um método como `processActivity(job: Job)`.
    *   Dentro do `AutonomousAgent`, o "Loop Agente" é ativado:
        *   O `AutonomousAgent` usa `AgentInternalState` e o `Activity.context` (presente em `Job.data.context`) como entrada para o LLM.
        *   O LLM raciocina e propõe uma ação (ex: chamar uma Tool, enviar uma mensagem, atualizar um plano).
        *   Se a ação for uma chamada de `Tool` (que é uma `Task`), o `AutonomousAgent` invoca o `IAgentService`.
4.  **Execução da Task (via IAgentService/TaskFactory):**
    *   O `IAgentService` recebe a requisição do `AutonomousAgent` (ex: "execute a `SearchTool` com os argumentos X").
    *   Ele usa o `TaskFactory` para instanciar a `Task` apropriada (ex: `SearchTask`) com base no `toolName` e `toolArgs` fornecidos no `Activity.context`.
    *   A `Task` interage com `Tools` e `LLMs` conforme sua lógica interna.
    *   O resultado da `Task` é retornado ao `IAgentService`, que o encaminha de volta ao `AutonomousAgent`.
5.  **Atualização da Activity e Raciocínio Contínuo:**
    *   O `AutonomousAgent` recebe o resultado da `Task`.
    *   Ele atualiza o `Activity.context.activityHistory` e `activityNotes` da `Job` com o resultado e suas reflexões.
    *   Pode decidir que precisa de mais passos, retornando `undefined` (para o `Worker`, que irá colocar a `Job` em `delayed` para o próximo ciclo) ou atualizando o status da Activity para `AWAITING_TOOL_OUTPUT`/`AWAITING_EXTERNAL_INPUT`.
    *   Se a `Activity` for concluída, o `AutonomousAgent` retorna o resultado final ao `Worker`.
6.  **Conclusão pelo Worker:** O `Worker` notifica a `Queue` sobre o resultado final (`finished` ou `failed`) ou sobre o `delayed` para re-agendamento.

```mermaid
graph TD
    A[Iniciação: ProcessJobService cria Job/Activity] --> B(Queue: Activity em status PENDING)
    B --> C{WorkerPool: Worker disponível?}
    C -- Sim --> D[Worker: Pega Activity da Queue]
    D --> E[Queue: Status EXECUTING]
    E --> F[Worker: Invoca AutonomousAgent.processActivity(Activity)]
    
    subgraph AutonomousAgent Loop (LLM-driven)
        F --> G{AutonomousAgent: Raciocina com AgentInternalState + Activity.context}
        G --> H[LLM: Decide próxima ação (Tool Call, Message, Plan Update)]
        H -- Se Tool Call/Task --> I[AutonomousAgent: Invoca IAgentService]
        I --> J[IAgentService: Usa TaskFactory para instanciar e executar Task]
        J --> K[Task: Interage com Tools e/or LLMs]
        K --> L[IAgentService: Retorna resultado da Task]
        L --> M[AutonomousAgent: Atualiza Activity.context (activityHistory, notes)]
        M -- Se Activity não concluída --> N{AutonomousAgent: Retorna undefined ao Worker}
        N --> O[Worker: Notifica Queue -> Activity em DELAYED]
        O -- Loop --> B
        M -- Se Activity concluída --> P{AutonomousAgent: Retorna resultado final ao Worker}
    end
    
    P --> Q[Worker: Notifica Queue -> Activity em FINISHED/FAILED]
    Q --> R[Fim do Processamento da Activity]
```

## 5. Considerações de Implementação

*   **Gerenciamento de `activityHistory` Grande:** O `activityHistory` em `Activity.context` pode crescer consideravelmente, impactando o custo e a latência das chamadas ao LLM. Estratégias como sumarização periódica, truncagem ou uso de memória de longo prazo para contexto menos recente podem ser necessárias.
*   **Persistência do `ActivityContext`:** Garantir que todas as alterações no `Activity.context` sejam serializadas corretamente no campo `data` da `Job` é fundamental para a recuperação do estado do Agente entre as iterações e falhas.
*   **Idempotência:** As `Tasks` e as operações do Agente precisarão ser o mais idempotentes possível, dado o modelo de retentativas e o ambiente assíncrono.
*   **Sincronização do `AgentInternalState`:** As atualizações do `AgentInternalState` devem ser persistidas de forma consistente e carregadas corretamente pelo `AutonomousAgent` a cada iteração.
*   **Modularidade das Tools:** As `Tools` devem ser bem definidas, com interfaces claras, para que o LLM possa utilizá-las eficientemente.
*   **Tratamento de Erros e Loops Infinitos:** Implementar mecanismos robustos para identificar e lidar com erros recorrentes ou situações em que o Agente entra em loops de raciocínio. O mecanismo de retentativa da `Job` ajuda, mas o Agente pode precisar de lógica de `REFLECTION` para se auto-corrigir.