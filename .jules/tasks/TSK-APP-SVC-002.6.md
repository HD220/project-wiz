# Tarefa: APP-SVC-002.6 - Escrever testes unitários para WorkerService.

**ID da Tarefa:** `APP-SVC-002.6`
**Título Breve:** Escrever testes unitários para `WorkerService`.
**Descrição Completa:**
Desenvolver um conjunto abrangente de testes unitários para o `WorkerService`, cobrindo as funcionalidades implementadas nas sub-tarefas anteriores (registro, início, parada de workers, delegação de jobs, integração com fila, tratamento de resultados/erros).

---

**Status:** `Pendente`
**Dependências (IDs):** `APP-SVC-002.1, APP-SVC-002.2, APP-SVC-002.3, APP-SVC-002.4, APP-SVC-002.5`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `test/app-worker-service-unit` (Sugestão)
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Testes unitários cobrem os principais cenários de sucesso e falha para cada funcionalidade do `WorkerService`.
- Mocks adequados são usados para dependências externas (como `IAgentExecutor`, sistema de Fila).
- Alta cobertura de código alcançada para o `WorkerService`.

---

## Notas/Decisões de Design
- Focar em testar a lógica do próprio `WorkerService`, não a lógica interna dos workers ou do `IAgentExecutor`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
