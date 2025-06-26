# Tarefa: QSYS-5.2 - Integrar JobQueueService com TaskManagerTool

**ID da Tarefa:** `QSYS-5.2`
**Título Breve:** Integrar `JobQueueService` com `TaskManagerTool`
**Descrição Completa:**
Refatorar a `TaskManagerTool` (e quaisquer outros componentes que atualmente criam jobs/tarefas) para utilizar o novo `JobQueueService.add()` para enfileirar jobs. Isso garantirá que todos os jobs passem pelo novo sistema de filas genérico.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-2.3, QSYS-5.1`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-5.2-taskmanager-queue-integration`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- `TaskManagerTool` (localizada em `src/infrastructure/tools/task.tool.ts` ou equivalente em `src_refactored/`) é atualizada.
- Em vez de interagir diretamente com repositórios de jobs ou um sistema de filas antigo, a `TaskManagerTool` agora obtém uma instância de `JobQueueService` (via DI ou de um registro de serviços).
- Ao criar sub-tarefas ou novos jobs, a `TaskManagerTool` chama `jobQueueService.add(queueName, jobName, payload, options)`.
- Os parâmetros `queueName`, `jobName`, `payload` e `options` (incluindo `dependsOnJobIds`, `priority`, etc.) são corretamente mapeados a partir da lógica da `TaskManagerTool`.
- Outros potenciais produtores de jobs no sistema são identificados e atualizados similarmente.
- Testes existentes para `TaskManagerTool` são atualizados ou novos testes são escritos para cobrir a integração com `JobQueueService`.

---

## Notas/Decisões de Design
- Será necessário determinar o `queueName` apropriado para os jobs criados pela `TaskManagerTool`. Isso pode ser baseado no `targetAgentRole` do job pai ou em uma configuração.
- A lógica de `JobOptions` (como `dependsOnJobIds` para sub-tarefas) precisa ser cuidadosamente portada.
- Esta integração é um passo chave para unificar o gerenciamento de jobs no novo sistema.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
