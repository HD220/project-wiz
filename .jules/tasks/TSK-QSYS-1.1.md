# Tarefa: QSYS-1.1 - Refinar/Augmentar Job Entity e VOs

**ID da Tarefa:** `QSYS-1.1`
**Título Breve:** Refinar/Augmentar Job Entity e VOs
**Descrição Completa:**
Revisar a entidade `Job` existente em `src_refactored/core/domain/job/job.entity.ts` e seus Value Objects (VOs) associados. Integrar atributos e funcionalidades do design do novo sistema de filas inspirado no BullMQ. Garantir que a entidade `Job` possa representar todos os estados e dados necessários (payload, opções, status, progresso, resultado, logs, timestamps, políticas de retry, dependências) conforme especificado em `docs/technical-documentation/bullmq-inspired-queue-system.md`. Adicionar métodos à entidade `Job` (ou a uma classe wrapper) para `updateProgress()` e `log()`.

---

**Status:** `Pendente`
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
- A entidade `Job` deve permanecer rica, encapsulando sua lógica de estado e validação.
- Os métodos `updateProgress` e `log` na entidade `Job` devem apenas modificar o estado interno do objeto. A persistência dessas alterações será responsabilidade do `IJobRepository.save()`.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
