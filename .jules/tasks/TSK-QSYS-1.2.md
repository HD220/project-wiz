# Tarefa: QSYS-1.2 - Definir/Confirmar Interface IJobRepository

**ID da Tarefa:** `QSYS-1.2`
**Título Breve:** Definir/Confirmar Interface `IJobRepository`
**Descrição Completa:**
Revisar e finalizar a interface `IJobRepository` em `src_refactored/core/domain/job/ports/job-repository.interface.ts`. Garantir que a interface inclua todos os métodos necessários para suportar as operações do novo sistema de filas, incluindo buscas especializadas para o `JobWorkerService` e `QueueSchedulerService`.

---

**Status:** `Concluído`
**Dependências (IDs):** `QSYS-1.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-1.2-job-repository-interface`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Interface `IJobRepository` atualizada/confirmada com os seguintes métodos (ou equivalentes):
  - `save(job: Job<any, any>): Promise<Result<void, Error>>`
  - `findById(id: JobId): Promise<Result<Job<any, any> | null, Error>>`
  - `findProcessableJobs(queueName: string, limit: number, now: Date): Promise<Result<Job<any, any>[], Error>>` (considerando status, prioridade, processAt, LIFO/FIFO, e bloqueio básico)
  - `findStalledJobs(queueName: string, lockDurationThreshold: Date, limit: number): Promise<Result<Job<any, any>[], Error>>`
  - `findDelayedJobsToPromote(queueName: string, now: Date, limit: number): Promise<Result<Job<any, any>[], Error>>`
  - `findJobsByRepeatKey(queueName: string, repeatKey: string): Promise<Result<Job<any, any>[], Error>>`
  - `findJobsByParentId(parentId: JobId): Promise<Result<Job<any,any>[], Error>>`
  - `findJobsByIds(ids: JobId[]): Promise<Result<Job<any,any>[], Error>>` (para checar dependências)
  - `getJobCountsByStatus(queueName: string): Promise<Result<Record<JobStatusType, number>, Error>>`
  - `delete(id: JobId): Promise<Result<void, Error>>`
  - `removeCompletedJobs(queueName: string, olderThan?: Date, limit?: number): Promise<Result<number, Error>>` (para `removeOnComplete`)
  - `removeFailedJobs(queueName: string, olderThan?: Date, limit?: number): Promise<Result<number, Error>>` (para `removeOnFail`)
- Tipos de retorno e parâmetros bem definidos, utilizando `Result` e VOs do domínio.

---

## Notas/Decisões de Design
- Referenciar `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 4.1 para `IJobRepository` e Seção 7.1 para queries do Scheduler).
- A interface deve ser agnóstica à implementação específica (Drizzle).
- O método `findProcessableJobs` foi renomeado para `findAndLockProcessableJobs` para maior clareza sobre sua responsabilidade de bloqueio atômico. Sua assinatura inclui `workerId`, `nowTimestampMs` e `lockDurationMs` para suportar essa funcionalidade.
- Datas nos parâmetros de métodos (ex: `nowTimestampMs`, `lockExpiresAtBefore`, `olderThanTimestampMs`) são especificadas como `number` (epoch ms) para facilitar a passagem para queries de banco de dados que comparam com timestamps armazenados no mesmo formato.
- Tipos auxiliares (`JobSearchFilters`, `PaginationOptions`, `PaginatedJobsResult`, `JobCountsByStatus`) foram definidos em `job-repository.types.ts` para manter a interface principal mais limpa.
- Todos os métodos retornam `Promise<Result<T, Error>>`.
- A interface foi criada em `src_refactored/core/domain/job/ports/job-repository.interface.ts`.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`
- `(YYYY-MM-DD por @Jules): Interface IJobRepository e tipos auxiliares definidos e documentados. O método de busca de jobs processáveis foi nomeado `findAndLockProcessableJobs` para refletir sua responsabilidade de bloqueio.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
