# Tarefa: QSYS-3.1 - Implementar JobWorkerService (API Worker)

**ID da Tarefa:** `QSYS-3.1`
**Título Breve:** Implementar `JobWorkerService` (API `Worker`)
**Descrição Completa:**
Implementar a classe `JobWorkerService` (que expõe a API similar à `Worker` do BullMQ) em `src_refactored/core/application/queue/job-worker.service.ts`. Esta classe é responsável por buscar jobs de uma fila, processá-los usando uma função de processamento fornecida, e gerenciar o ciclo de vida do job durante o processamento.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.3, QSYS-2.1, QSYS-2.3, QSYS-3.2`
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-3.1-job-worker-service`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Classe `JobWorkerService` implementada conforme o design em `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 4.3).
- Construtor recebe uma instância de `JobQueueService` (ou `queueName` e dependências como `IJobRepository`, `JobEventEmitter`), a `processorFunction`, e `WorkerOptions`.
- Implementação do loop de polling (`run`/`poll`) para buscar jobs.
- Lógica de `fetchNextJob()`:
    - Utiliza `IJobRepository.findProcessableJobs()` ou um método similar.
    - Implementa o bloqueio atômico do job (atualiza status para `ACTIVE`, `lockedByWorkerId`, `lockExpiresAt`, `startedAt`, `attemptsMade`).
- Lógica de `processJobInternal()`:
    - Executa a `processorFunction` com o job.
    - Gerencia `job.updateProgress()` e `job.log()` (requer que o objeto `Job` passado ao processador possa interagir com o repositório/event emitter).
    - Implementa renovação de lock (`lockRenewTime`, `lockDuration`).
    - Trata sucesso: atualiza job para `COMPLETED`, armazena resultado, emite evento.
    - Trata falhas: aplica lógica de retry (baseada em `JobOptions.attempts`, `JobOptions.retryStrategy`/`backoff`), atualiza job para `FAILED` ou `DELAYED`, armazena erro, emite evento.
- Gerenciamento de concorrência (`WorkerOptions.concurrency`).
- Método `close()` para shutdown gracioso.
- Emissão de eventos de worker (`worker.error`) e de job (`job.active`, `job.completed`, `job.failed`, `job.progress`).

---

## Notas/Decisões de Design
- A interação entre `JobWorkerService` e `IJobRepository` para `fetchNextJob` e atualizações de job é crítica e deve ser transacional.
- A forma como o objeto `Job` é passado para o `processorFunction` e como seus métodos (`updateProgress`, `log`) interagem com o sistema precisa ser bem definida (ver QSYS-3.2).
- O `JobWorkerService` dependerá de `IJobRepository` (para buscar/atualizar jobs) e `JobEventEmitter`. Pode obter estas dependências através da instância de `JobQueueService` ou por injeção direta.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
