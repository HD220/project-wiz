# Sistema de Jobs, Atividades e Fila

O Project Wiz utiliza um sistema robusto de Jobs (que representam Atividades ou Tarefas) e Filas para gerenciar o trabalho executado pelos Agentes de IA. Este sistema é persistido em SQLite via Drizzle ORM.

## Funcionalidades Principais:

1.  **Definição de Job/Atividade:**
    *   Um `Job` (entidade `Job`) é a unidade fundamental de trabalho.
    *   Atributos de um Job incluem:
        *   `id`: Identificador único (`JobId` VO).
        *   `queueId` (ou `targetAgentRole`): Identifica a fila/agente alvo. O `Job` armazena `targetAgentRole` que o `WorkerService` usa para filtrar. Um `queueName` pode ser derivado do `targetAgentRole`.
        *   `name`: Um nome descritivo para o Job (`JobName` VO). Não é usado para dispatch de processador específico pelo `GenericAgentExecutor`, que se baseia no `payload.goal` e na Persona.
        *   `payload`: Os dados de entrada para o Job (ex: `{ goal: "minha tarefa" }`).
        *   `data`: Contém o `agentState`, que por sua vez inclui o `ActivityContext` (VO `ActivityContext`) com histórico de interações, notas, etc., e `executionHistory`.
        *   `status`: O estado atual do Job (`JobStatus` VO, ex: `PENDING`, `ACTIVE`, `COMPLETED`, `FAILED`, `DELAYED`, `WAITING`). `WAITING_CHILDREN` não é um status direto, mas uma condição de `WAITING` devido a dependências.
        *   `priority`: Nível de prioridade do Job (`JobPriority` VO).
        *   `dependsOnJobIds`: Lista de IDs de outros Jobs dos quais este Job depende (`JobDependsOn` VO contendo `JobId[]`).
        *   `parentJobId`: ID do Job pai, caso este seja um Sub-Job (`JobId` VO).
        *   `opts` (representado por `RetryPolicy` VO): Opções de execução como número máximo de tentativas (`maxAttempts`) e política de backoff.
        *   Timestamps (`JobTimestamp` VOs): `createdAt`, `updatedAt`, `executeAfter` (para `DELAYED` jobs). `startedAt`, `completedAt`, `failedAt` são conceitos gerenciados pelo ciclo de vida e podem ser inferidos ou registrados no `result` ou `data`.
        *   `result`: Resultado da execução do Job.

2.  **Criação e Enfileiramento de Jobs:**
    *   Agentes IA criam Jobs para si mesmos (Sub-Jobs) usando a `TaskManagerTool`, que utiliza o `CreateJobUseCase`.
    *   O `CreateJobUseCase` persiste o Job e o `SqliteJobQueue` (implementação de `IJobQueue`) é notificado, embora a "fila" seja primariamente o estado dos Jobs no repositório.

3.  **Gerenciamento de Múltiplas Filas Nomeadas (por Role):**
    *   O sistema suporta o conceito de múltiplas filas implicitamente através do `targetAgentRole` no Job.
    *   Cada `WorkerService` é configurado para um `handlesRole`, efetivamente processando uma fila para aquele papel de Agente.

4.  **Ciclo de Vida e Transições de Estado:**
    *   Jobs progridem por um ciclo de vida definido por seus `JobStatus` (VOs).
    *   O `WorkerService` e o `GenericAgentExecutor` (indiretamente, via resultados) gerenciam as transições de estado, que são refletidas na entidade `Job` e persistidas.

5.  **Processamento de Jobs por Workers (Agentes):**
    *   Um `WorkerService` (configurado para um `handlesRole`) busca Jobs elegíveis (`PENDING` ou `DELAYED` com `executeAfter` passado) de sua "fila" (via `IJobRepository.findPendingByRole`).
    *   O `WorkerService` então entrega o Job ao `GenericAgentExecutor` (configurado com o `AgentPersonaTemplate` correspondente ao `role`) para processamento.

6.  **Priorização de Jobs:**
    *   Jobs possuem um atributo `priority`. O `IJobRepository.findNextProcessableJob` (ou `findPendingByRole`) é responsável por buscar Jobs respeitando a prioridade.

7.  **Gerenciamento de Dependências:**
    *   Um Job não se torna elegível para processamento (não é pego pelo `findNextProcessableJob`) até que todos os Jobs em `dependsOnJobIds` estejam `COMPLETED`. Esta lógica reside no `IJobRepository` ou é verificada pelo `ProcessJobServiceImpl` (implementação mais antiga) ou `WorkerService`.
    *   Um Job pai pode aguardar Sub-Jobs se o Agente modelar isso através de dependências ou lógica interna de espera/verificação usando `TaskManagerTool`.

8.  **Mecanismo de Retentativa (Retry):**
    *   Jobs que falham podem ser automaticamente reagendados. A entidade `Job` e seu `RetryPolicy` VO definem o número máximo de tentativas e a estratégia de backoff.
    *   O `WorkerService` (ou `ProcessJobServiceImpl`) aplica essa lógica ao lidar com falhas do `GenericAgentExecutor`.

9.  **Jobs Atrasados (Delayed Jobs):**
    *   Jobs podem ser agendados para execução futura (via `executeAfter`) ou explicitamente movidos para um estado `DELAYED` pelo `WorkerService` ou `GenericAgentExecutor`. Eles só se tornam elegíveis após `executeAfter`.

10. **Persistência:**
    *   Todos os Jobs, seus atributos e `data` (incluindo `agentState` com `ActivityContext`) são persistidos em SQLite via `IJobRepository` (implementado por `DrizzleJobRepository`).

11. **Monitoramento (Básico):**
    *   A UI (`activity-list-item.tsx`) pode exibir o status dos Jobs. Não há sistema de monitoramento de performance de fila dedicado no código analisado.

12. **Opções Padrão por Fila e Específicas por Job:**
    *   Opções de Job (como `RetryPolicy`) são definidas na criação do Job. Não foi observado um mecanismo de `defaultJobOptions` por fila/role no código.

Este sistema de Jobs e Filas é fundamental para a operação organizada, confiável e escalável dos Agentes IA no Project Wiz.
