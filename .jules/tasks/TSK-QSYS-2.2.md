# Tarefa: QSYS-2.2 - Implementar Casos de Uso de Job

**ID da Tarefa:** `QSYS-2.2`
**Título Breve:** Implementar Casos de Uso de Job
**Descrição Completa:**
Implementar os casos de uso principais para gerenciamento de jobs na camada de aplicação (`src_refactored/core/application/queue/use-cases/`). Isso inclui, no mínimo, `CreateJobUseCase`, `GetJobUseCase`, e `GetJobsByStatusUseCase`. Outros casos de uso podem ser identificados e implementados conforme necessário (ex: `RemoveJobUseCase`, `UpdateJobUseCase`).

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.2`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-2.2-job-use-cases`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- `CreateJobUseCase.ts` implementado:
    - Recebe dados do job e `JobOptions`.
    - Utiliza a entidade `Job` para criar uma nova instância de job.
    - Utiliza `IJobRepository.save()` para persistir o job.
    - Retorna o `Job` criado ou um `Result` de sucesso/falha.
- `GetJobUseCase.ts` implementado:
    - Recebe um `JobId`.
    - Utiliza `IJobRepository.findById()` para buscar o job.
    - Retorna o `Job` encontrado ou `null`/`Result` de falha.
- `GetJobsByStatusUseCase.ts` (ou similar para listar jobs com filtros):
    - Recebe `queueName`, `status[]`, opções de paginação/ordenação.
    - Utiliza `IJobRepository` para buscar os jobs.
    - Retorna uma lista de `Job`s ou `Result`.
- DTOs de entrada e saída definidos para cada caso de uso.
- Casos de uso são injetados com `IJobRepository`.
- Testes unitários para cada caso de uso, mockando o `IJobRepository`.

---

## Notas/Decisões de Design
- Os casos de uso encapsulam a lógica de orquestração para uma ação específica, usando entidades de domínio e repositórios.
- Referenciar `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 4.2 para métodos da API `Queue` que estes use cases suportarão).
- Manter os casos de uso focados em uma única responsabilidade.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
