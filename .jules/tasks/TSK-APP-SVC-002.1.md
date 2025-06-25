# Tarefa: APP-SVC-002.1 - Definir a interface para WorkerService (IWorkerService) e seus DTOs.

**ID da Tarefa:** `APP-SVC-002.1`
**Título Breve:** Definir a interface para `WorkerService` (`IWorkerService`) e seus DTOs.
**Descrição Completa:**
Definir a interface para `WorkerService` (`IWorkerService`) e seus Data Transfer Objects (DTOs). Basear-se nas necessidades de `DOM-JOB-011` e `APP-PORT-003`.

---

**Status:** `Concluído`
**Dependências (IDs):** `APP-SVC-002, DOM-JOB-011, APP-PORT-003`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feature/app-worker-service-interface` (Sugestão)
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo de interface `IWorkerService.ts` criado.
- DTOs necessários definidos.
- Interface cobre registro, inicialização, parada de workers e submissão de jobs.

---

## Notas/Decisões de Design
- Basear-se nas necessidades de DOM-JOB-011 e APP-PORT-003.
- DTOs definidos em `src_refactored/core/application/services/worker/dtos.ts`.
- Interface `IWorkerService` definida em `src_refactored/core/application/services/worker/i-worker.service.ts`.
- **Registro de Worker:** Realizado via método `registerWorker`.
- **Inicialização de Worker:** Assume-se que o worker se auto-inicializa e então se registra. A interface não inclui um método explícito para "inicializar" um worker passivo, mas foca no gerenciamento de workers já ativos ou em processo de registro/desregistro.
- **Parada de Worker:** Realizada via método `unregisterWorker` para remoção graciosa. Um `requestWorkerShutdown` pode ser considerado no futuro se o serviço precisar instruir ativamente um worker a parar.
- **Submissão de Jobs:** A interface `IWorkerService` foca no gerenciamento do ciclo de vida e status dos workers. A submissão/atribuição direta de jobs a workers não foi incluída na interface, pois o sistema de jobs (`04_sistema_jobs_atividades_fila.md`) sugere que workers (ou o `GenericAgentExecutor` dentro deles) puxam jobs de uma fila (`IJobQueue`) ou são atribuídos jobs por um mecanismo que consulta o `WorkerService` por workers disponíveis (`findAvailableWorker`). A `IWorkerService` ajuda a saber quais workers estão disponíveis para determinados papéis.
- Métodos incluem gerenciamento de heartbeat e consulta de status/detalhes dos workers.
- Todos os métodos retornam `Result<T, Error>` conforme as diretrizes.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(YYYY-MM-DD por @Jules): Interface IWorkerService e DTOs definidos conforme plano. A interpretação dos critérios de aceitação "inicialização" e "submissão de jobs" está detalhada nas Notas/Decisões de Design.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
