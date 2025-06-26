# Tarefa: QSYS-1.1 - Refinar/Augmentar Job Entity e VOs

**ID da Tarefa:** `QSYS-1.1`
**Título Breve:** Refinar/Augmentar Job Entity e VOs
**Descrição Completa:**
Revisar a entidade `Job` existente em `src_refactored/core/domain/job/job.entity.ts` e seus Value Objects (VOs) associados. Integrar atributos e funcionalidades do design do novo sistema de filas inspirado no BullMQ. Garantir que a entidade `Job` possa representar todos os estados e dados necessários (payload, opções, status, progresso, resultado, logs, timestamps, políticas de retry, dependências) conforme especificado em `docs/technical-documentation/bullmq-inspired-queue-system.md`. Adicionar métodos à entidade `Job` (ou a uma classe wrapper) para `updateProgress()` e `log()`.

---

**Status:** `Concluído`
**Dependências (IDs):** ``
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-1.1-job-entity-vos`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Entidade `Job` (`job.entity.ts`) atualizada para incluir todos os campos necessários (ex: `progress`, `executionLogs`, `jobName` como string distinta do `name` VO se necessário, `queueName`).
- VOs existentes (`JobId`, `JobStatus`, `JobPriority`, `RetryPolicy`, etc.) revisados e ajustados se necessário.
- Novos VOs criados se necessário (ex: `JobProgressVO`, `JobExecutionLogEntryVO`).
- Métodos `updateProgress(value: number | object): Promise<void>` e `log(message: string, level?: string): Promise<void>` adicionados à entidade `Job` ou sua interface, com a lógica para atualizar os campos correspondentes (a persistência efetiva será via repositório).
- Mantida a distinção e uso de `payload` (input do job) e `data` (estado interno do agente, resultados da execução).
- Código adere aos princípios de Clean Architecture e Object Calisthenics.

---

## Notas/Decisões de Design
- Referenciar `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seções 2.1, 3.1, 4.1).
- **Abordagem de Reescrever:** Conforme instrução do usuário, a entidade `Job` e seus VOs foram reescritos do zero para alinhar com o design genérico do sistema de filas, em vez de aumentar a entidade `Job` pré-existente. Arquivos antigos em `src_refactored/core/domain/job/` foram deletados.
- **Generalidade da Entidade `Job`:** A nova `JobEntity` é genérica. Dados específicos de domínio (como o `agentState` anterior) devem ser parte do `payload` do job, não atributos diretos da `JobEntity` do sistema de filas.
- **VOs Criados:**
    - `JobIdVO`: Para IDs de job (UUID).
    - `JobStatusVO`: Enum para estados (`PENDING`, `ACTIVE`, `COMPLETED`, `FAILED`, `DELAYED`, `WAITING_CHILDREN`).
    - `JobPriorityVO`: Para prioridade numérica (menor = maior prioridade).
    - `JobOptionsVO`: Agrega opções como `delay`, `attempts`, `retryStrategy`, `lifo`, `removeOnComplete/Fail`, `repeat`, `dependsOnJobIds`, `parentId`, `timeout`.
    - `JobProgressVO`: Para progresso numérico (0-100) ou objeto de detalhes.
    - `JobExecutionLogEntryVO`: Para entradas de log individuais (timestamp, message, level, details).
    - `JobExecutionLogsVO`: Coleção de `JobExecutionLogEntryVO`.
- **Atributos da `JobEntity`:** Inclui `id`, `queueName` (string), `jobName` (string), `payload` (genérico), `opts` (`JobOptionsVO`), `status` (`JobStatusVO`), `priority` (`JobPriorityVO`), `progress` (`JobProgressVO`), `returnValue`, `failedReason`, `attemptsMade`, timestamps (`createdAt`, `updatedAt`, `processAt`, `startedAt`, `finishedAt` - como epoch ms), `executionLogs` (`JobExecutionLogsVO`), `lockedByWorkerId`, `lockExpiresAt`, `repeatJobKey`.
- **Métodos da Entidade `Job`:**
    - `JobEntity.create()`: Fábrica estática para novas instâncias.
    - `setProgress()` e `addLog()`: Modificam o estado interno. Persistência e emissão de eventos são responsabilidade de serviços externos (Worker/Repository).
    - Métodos de transição de estado (`moveToActive`, `moveToCompleted`, etc.) atualizam o status e timestamps relevantes.
- **Timestamps:** Armazenados como epoch milliseconds nas props da entidade para facilitar a persistência e queries, mas os accessors retornam objetos `Date`.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`
- `(YYYY-MM-DD por @Jules): Implementação da `JobEntity` e VOs essenciais concluída. Adotada abordagem de reescrita completa para garantir um design de sistema de filas genérico. Arquivos antigos em `core/domain/job/` foram removidos.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
