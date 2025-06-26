# Tarefa: QSYS-4.1 - Implementar QueueSchedulerService

**ID da Tarefa:** `QSYS-4.1`
**Título Breve:** Implementar `QueueSchedulerService`
**Descrição Completa:**
Implementar a classe `QueueSchedulerService` em `src_refactored/core/application/queue/queue-scheduler.service.ts`. Este serviço será responsável por tarefas de background como promover jobs atrasados, lidar com jobs parados (stalled), gerenciar jobs repetíveis e verificar dependências de jobs.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.3, QSYS-2.1`
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-4.1-queue-scheduler-service`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Classe `QueueSchedulerService` implementada conforme o design em `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 2.4 e 7).
- Construtor recebe `IJobRepository`, `JobEventEmitter`, e opções de configuração (ex: intervalo de polling).
- Métodos `start()` e `stop()` para controlar o ciclo de vida do serviço de polling.
- Lógica implementada para cada responsabilidade principal dentro do loop de polling:
    - `promoteDelayedJobs()`: Busca e atualiza jobs `DELAYED` para `PENDING`.
    - `handleStalledJobs()`: Busca jobs `ACTIVE` com locks expirados e os move para `FAILED` ou `PENDING` (retry).
    - `manageRepeatableJobs()`: Verifica `repeatable_job_schedules` (ou `JobOptions`) e cria novas instâncias de jobs `PENDING` conforme necessário.
    - `checkJobDependencies()`: Verifica jobs `WAITING_CHILDREN` e os promove se as dependências estiverem completas.
- Todas as interações com o banco de dados são feitas através do `IJobRepository` e são transacionais onde necessário.
- Eventos apropriados são emitidos (ex: `job.promoted`, `job.stalled`).
- Configuração para o intervalo de polling do scheduler.

---

## Notas/Decisões de Design
- O `QueueSchedulerService` deve ser robusto e lidar com erros em suas operações de polling/DB sem travar.
- A frequência do polling é um compromisso entre responsividade e carga no banco de dados.
- A lógica para calcular o próximo `processAt` para jobs repetíveis e para retries de jobs stalled deve ser precisa.
- Considerar o impacto da concorrência se múltiplas instâncias do scheduler fossem executadas (embora no Electron, provavelmente será uma única instância no processo principal).

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
