# Tarefa: APP-SVC-002.3 - Integrar WorkerService com IAgentExecutor para delegar jobs.

**ID da Tarefa:** `APP-SVC-002.3`
**Título Breve:** Integrar `WorkerService` com `IAgentExecutor` para delegar jobs.
**Descrição Completa:**
Implementar a lógica no `WorkerService` que permite a um worker pegar um job e usar uma instância de `IAgentExecutor` (de APP-SVC-001.8) para processar o job.

---

**Status:** `Pendente`
**Dependências (IDs):** `APP-SVC-002.2, APP-SVC-001.8`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feature/app-worker-service-integration` (Sugestão)
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- `WorkerService` pode atribuir um job a um worker disponível.
- O worker utiliza uma instância de `IAgentExecutor` para executar a lógica do job.
- O resultado da execução do `IAgentExecutor` é capturado pelo worker/WorkerService.

---

## Notas/Decisões de Design
- Decidir como o `IAgentExecutor` é fornecido ou acessado pelo worker.
- Definir como os resultados (sucesso, falha, dados) da execução do job são passados de volta.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
