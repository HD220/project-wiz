# Tarefa: QSYS-2.3 - Implementar JobQueueService (API Queue)

**ID da Tarefa:** `QSYS-2.3`
**Título Breve:** Implementar `JobQueueService` (API `Queue`)
**Descrição Completa:**
Implementar a classe `JobQueueService` (que expõe a API similar à `Queue` do BullMQ) em `src_refactored/core/application/queue/job-queue.service.ts`. Esta classe será a principal interface para produtores adicionarem e gerenciarem jobs.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.3, QSYS-2.1, QSYS-2.2`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-2.3-job-queue-service`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Classe `JobQueueService` implementada conforme o design em `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 4.2).
- Construtor recebe `queueName`, `drizzleInstance` (ou `IJobRepository`), e `JobEventEmitter`.
- Métodos implementados:
    - `add(jobName: string, data: TData, opts?: JobOptions): Promise<Job<TData, TResult>>`
    - `addBulk(...)`
    - `getJob(jobId: JobId)`
    - `getJobs(statuses: JobStatus[], ...)`
    - `getJobCounts()`
    - `removeJob(jobId: JobId)`
    - `clean(...)`
    - `empty()`
    - `pause()` (a lógica de pausa pode envolver um sinalizador no metadados da fila ou uma tabela de status da fila)
    - `resume()`
    - `on(event: JobEventType, listener)` (para conveniência de escuta de eventos da fila específica)
    - `close()`
- Utiliza os Casos de Uso de Job (de `QSYS-2.2`) ou diretamente `IJobRepository` para interações com o banco de dados.
- Emite os eventos apropriados (`job.added`, `job.removed`, `queue.paused`, `queue.resumed`) através do `JobEventEmitter`.
- Testes unitários e de integração para `JobQueueService`, mockando dependências onde apropriado.

---

## Notas/Decisões de Design
- Esta classe é a fachada principal para interações com a fila do ponto de vista de um produtor de jobs.
- A lógica de `pause()` e `resume()` precisará de uma estratégia para como o estado de pausa da fila é armazenado e verificado pelos workers (possivelmente via `Queue` domain entity ou uma tabela de metadados).
- O `JobQueueService` não deve conter lógica de negócio complexa, delegando-a para casos de uso ou para a entidade `Job` / `IJobRepository`.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
