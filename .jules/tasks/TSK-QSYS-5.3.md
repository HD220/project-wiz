# Tarefa: QSYS-5.3 - Adaptar GenericAgentExecutor para JobWorkerService

**ID da Tarefa:** `QSYS-5.3`
**Título Breve:** Adaptar `GenericAgentExecutor` para `JobWorkerService`
**Descrição Completa:**
Adaptar o `GenericAgentExecutor` (atualmente em `src/infrastructure/agents/generic-agent-executor.ts` ou seu equivalente em `src_refactored/`) para que sua lógica de processamento de jobs seja invocada pelo novo `JobWorkerService`. O `GenericAgentExecutor.processJob()` se tornará a `processorFunction` para um `JobWorkerService` configurado para processar jobs de agentes.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-3.1, QSYS-5.1, APP-SVC-001` (se a lógica do executor for mantida)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-5.3-agentexecutor-worker-integration`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Uma instância de `JobWorkerService` é configurada para cada `targetAgentRole` que o `GenericAgentExecutor` pode manipular.
- A função `processorFunction` passada para esses `JobWorkerService`s é uma adaptação ou wrapper do método `GenericAgentExecutor.processJob(job)`.
- O objeto `Job` recebido pela `processorFunction` (vindo do `JobWorkerService`) é corretamente mapeado/utilizado pelo `GenericAgentExecutor`.
    - O `job.payload` é usado como entrada principal.
    - O `job.data.agentState` é lido e atualizado pelo executor.
    - O executor usa `job.updateProgress()` e `job.log()` para reportar progresso e logs através do novo sistema.
- O resultado de `GenericAgentExecutor.processJob()` é retornado para o `JobWorkerService` para que o job seja marcado como `COMPLETED` ou `FAILED`.
- A lógica de retry e state management que poderia estar duplicada no `GenericAgentExecutor` é removida, confiando no `JobWorkerService` e `QueueSchedulerService`.
- Testes existentes para `GenericAgentExecutor` são adaptados para testá-lo como uma `processorFunction`, mockando o objeto `Job` que ele recebe.

---

## Notas/Decisões de Design
- O `GenericAgentExecutor` se tornará mais focado na lógica de execução do agente (interação com LLM, tools), enquanto o `JobWorkerService` gerencia o ciclo de vida do job, retries, etc.
- A inicialização dos `JobWorkerService`s para os diferentes papéis de agente precisará ser configurada na aplicação.
- Garantir que o `agentState` seja corretamente carregado no objeto `Job` antes de ser passado ao executor, e salvo após a execução. Isso pode ser parte da responsabilidade do `JobWorkerService` ao preparar e finalizar um job.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
