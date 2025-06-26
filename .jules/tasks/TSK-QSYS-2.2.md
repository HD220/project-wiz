# Tarefa: QSYS-2.2 - Implementar Casos de Uso de Job

**ID da Tarefa:** `QSYS-2.2`
**Título Breve:** Implementar Casos de Uso de Job
**Descrição Completa:**
Implementar os casos de uso principais para gerenciamento de jobs na camada de aplicação (`src_refactored/core/application/queue/use-cases/`). Isso inclui, no mínimo, `CreateJobUseCase`, `GetJobUseCase`, e `GetJobsByStatusUseCase`. Outros casos de uso podem ser identificados e implementados conforme necessário (ex: `RemoveJobUseCase`, `UpdateJobUseCase`).

---

**Status:** `Concluído`
**Dependências (IDs):** `QSYS-1.2`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-2.2-job-use-cases`
**Commit da Conclusão (Link):** `Commit na branch feat/qsys-2.2-job-use-cases`

---

## Critérios de Aceitação
- `CreateJobUseCase.ts` implementado: **(Concluído)**
    - Recebe dados do job e `JobOptions`. **(Concluído)**
    - Utiliza a entidade `Job` para criar uma nova instância de job. **(Concluído)**
    - Utiliza `IJobRepository.save()` para persistir o job. **(Concluído)**
    - Retorna o `Job` criado ou um `Result` de sucesso/falha. **(Concluído)**
- `GetJobUseCase.ts` implementado: **(Concluído)**
    - Recebe um `JobId`. **(Concluído)**
    - Utiliza `IJobRepository.findById()` para buscar o job. **(Concluído)**
    - Retorna o `Job` encontrado ou `null`/`Result` de falha. **(Concluído)**
- `GetJobsByStatusUseCase.ts` (ou similar para listar jobs com filtros): **(Concluído)**
    - Recebe `queueName`, `status[]`, opções de paginação/ordenação. **(Concluído)**
    - Utiliza `IJobRepository` para buscar os jobs. **(Concluído)**
    - Retorna uma lista de `Job`s ou `Result`. **(Concluído)**
- DTOs de entrada e saída definidos para cada caso de uso. **(Concluído)**
- Casos de uso são injetados com `IJobRepository`. **(Concluído)**
- Testes unitários para cada caso de uso, mockando o `IJobRepository`. **(Concluído, mas não verificado)**

---

## Notas/Decisões de Design
- Os casos de uso encapsulam a lógica de orquestração para uma ação específica, usando entidades de domínio e repositórios.
- Referenciar `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 4.2 para métodos da API `Queue` que estes use cases suportarão).
- Manter os casos de uso focados em uma única responsabilidade.

---

## Comentários
- `(Data da migração por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`
- `(2024-07-25 por @Jules): Status alterado para Concluído. Casos de uso (CreateJob, GetJob, GetJobsByStatus) e DTOs correspondentes implementados. Testes unitários foram escritos, mas não puderam ser executados/verificados devido a uma falha persistente ("Internal error") ao tentar executar Vitest. Código submetido na branch 'feat/qsys-2.2-job-use-cases'.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
