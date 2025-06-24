# Tarefa: APP-SVC-001.8.10.IMPL - Implementar testes para lógica de re-planejamento (`attemptReplanForUnusableResponse`) no GenericAgentExecutor

**ID da Tarefa:** `APP-SVC-001.8.10.IMPL`
**Título Breve:** Implementar testes para lógica de re-planejamento (`attemptReplanForUnusableResponse`) no GenericAgentExecutor
**Descrição Completa:**
Implementar os testes unitários para o `GenericAgentExecutor` que verificam a lógica de re-planejamento (`attemptReplanForUnusableResponse`). Este cenário ocorre quando a resposta do LLM não é utilizável (ex: não é JSON válido, não contém `tool_code` esperado, etc.).

---

**Status:** `Concluído`
**Dependências (IDs):** `APP-SVC-001.8.10`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/refactor-phase5-app-generic-agent-executor-tests`
**Commit da Conclusão (Link):** `Last commit on branch`

---

## Critérios de Aceitação
- Testes implementados conforme o plano conceitual definido em APP-SVC-001.8.10.
- Testes simulam o LLM retornando uma resposta que não pode ser parseada ou que não segue o formato esperado para uma ação.
- Testes verificam que a lógica de `attemptReplanForUnusableResponse` é acionada.
- Testes verificam que uma nova tentativa é feita ao LLM com um prompt modificado para solicitar correção ou re-planejamento.
- Testes verificam o comportamento se o re-planejamento falhar múltiplas vezes (ex: atingir um limite de tentativas de re-planejamento).

---

## Notas/Decisões de Design
- Implementar o teste conceitual definido em APP-SVC-001.8.10.
- Testes automatizados não puderam ser executados devido a problemas no ambiente no momento da conclusão original. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
