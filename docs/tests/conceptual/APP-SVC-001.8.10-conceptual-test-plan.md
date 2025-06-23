# Plano de Teste Conceitual: APP-SVC-001.8.10
## Testar lógica de re-planejamento (`attemptReplanForUnusableResponse`)

**Objetivo:** Verificar se o `GenericAgentExecutor` lida corretamente com respostas do LLM que são consideradas "inúteis" (vazias, muito curtas, ou apenas com `tool_calls` sem conteúdo) através da lógica de re-planejamento implementada no método (privado ou parte do fluxo principal) `attemptReplanForUnusableResponse`.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` e `mockAgent` disponíveis do `beforeEach`.
*   Constantes `MIN_USABLE_LLM_RESPONSE_LENGTH` e `MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE` acessíveis ou conhecidas para o teste.

---

### Cenários de Teste

#### Cenário 1: Resposta do LLM muito curta, re-planejamento bem-sucedido na segunda tentativa do LLM

*   **Arrange:**
    1.  **`mockJob`, `mockAgent`**: Do `beforeEach`.
    2.  **Mock `ILLMAdapter.generateText`:**
        *   **Primeira chamada:** Retornar `Result.ok({ role: 'assistant', content: 'Eh?', tool_calls: [] })`. (Assumindo 'Eh?' é mais curto que `MIN_USABLE_LLM_RESPONSE_LENGTH`).
        *   **Segunda chamada (após re-planejamento):** Retornar `Result.ok({ role: 'assistant', content: 'Goal achieved after replan.', tool_calls: [] })`.
    3.  **Mock `IJobRepository.save`**: Configurar para `Result.ok(mockJob)`.

*   **Act:**
    ```typescript
    const result = await executor.executeJob(mockJob, mockAgent);
    ```

*   **Assert:**
    1.  `expect(result.isOk()).toBe(true);`
    2.  `expect(result.value.status).toBe('SUCCESS');`
    3.  `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);`
    4.  **`ActivityHistory` no `Job`:**
        *   Verificar a presença da primeira resposta curta do assistente.
        *   Verificar a presença de uma entrada do sistema/assistente indicando o re-planejamento (ex: "Resposta anterior muito curta, tentando novamente..." ou a mensagem adicionada por `attemptReplanForUnusableResponse`).
        *   Verificar a presença da segunda resposta bem-sucedida do assistente.
    5.  **`ExecutionHistory` no `Job`:**
        *   Pode conter uma entrada indicando a resposta curta do LLM, dependendo da granularidade do log de execução.

---

#### Cenário 2: Resposta do LLM apenas com `tool_calls` (sem conteúdo textual), re-planejamento bem-sucedido

*   **Arrange:**
    1.  **`mockJob`, `mockAgent`**: Do `beforeEach`.
    2.  **Mock `ILLMAdapter.generateText`:**
        *   **Primeira chamada:** Retornar `Result.ok({ role: 'assistant', content: null, tool_calls: [{ id: 'tc1', type: 'function', function: { name: 'someTool', arguments: '{}' } }] })`.
        *   **Segunda chamada (após re-planejamento, assumindo que o executor não processa o tool_call se o content é null e entra em replan):** Retornar `Result.ok({ role: 'assistant', content: 'Goal achieved now with text.', tool_calls: [] })`.
            *Nota: Este cenário depende de como `attemptReplanForUnusableResponse` interage com a presença de `tool_calls`. Se `tool_calls` presentes impedem o re-planejamento por resposta vazia, este teste precisa ser ajustado ou focar apenas em `content: null` sem `tool_calls`.*
    3.  **Mock `IJobRepository.save`**: Configurar para `Result.ok(mockJob)`.

*   **Act:**
    ```typescript
    const result = await executor.executeJob(mockJob, mockAgent);
    ```

*   **Assert:**
    1.  `expect(result.isOk()).toBe(true);`
    2.  `expect(result.value.status).toBe('SUCCESS');`
    3.  `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);`
    4.  **`ActivityHistory` no `Job`:**
        *   Verificar a primeira resposta do assistente (content null, com tool_calls).
        *   Verificar a mensagem de re-planejamento.
        *   Verificar a segunda resposta bem-sucedida.
    5.  **`ExecutionHistory` no `Job`:**
        *   Verificar se o `tool_call` inicial foi ou não processado, dependendo da lógica do `attemptReplanForUnusableResponse`.

---

#### Cenário 3: Resposta do LLM consistentemente muito curta, excede `MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE`

*   **Arrange:**
    1.  **`mockJob`, `mockAgent`**: Do `beforeEach`. Assumir `MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE` é 1 (para simplificar o teste, o executor fará 1 chamada original + 1 tentativa de re-planejamento).
    2.  **Mock `ILLMAdapter.generateText`:**
        *   **Primeira chamada:** Retornar `Result.ok({ role: 'assistant', content: '?', tool_calls: [] })`.
        *   **Segunda chamada (após a primeira tentativa de re-planejamento):** Retornar novamente `Result.ok({ role: 'assistant', content: '??', tool_calls: [] })`.
    3.  **Mock `IJobRepository.save`**: Configurar para `Result.ok(mockJob)`.

*   **Act:**
    ```typescript
    const result = await executor.executeJob(mockJob, mockAgent);
    ```

*   **Assert:**
    1.  `expect(result.isOk()).toBe(true);`
    2.  `expect(result.value.status).toBe('FAILURE_LLM');` (Ou um status específico para falha de re-planejamento, se existir. `FAILURE_LLM` é provável).
    3.  `expect(result.value.message).toContain('Failed to get a usable response from LLM after maximum replan attempts');` (ou similar).
    4.  `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1 + MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE);` (Ex: 2 vezes se MAX_REPLAN_ATTEMPTS é 1).
    5.  **`ActivityHistory` no `Job`:**
        *   Verificar as duas respostas curtas do assistente e a(s) mensagem(ns) de re-planejamento.
    6.  **`ExecutionHistory` no `Job`:**
        *   Deve conter entradas indicando as respostas curtas do LLM.
    7.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);`
        *   Verificar `mockJob.currentData().lastFailureSummary`.

---

**Considerações Adicionais:**
*   A implementação exata de `attemptReplanForUnusableResponse` (se é um método privado ou lógica inline) e como ele modifica o histórico para a próxima chamada LLM são cruciais para detalhar os asserts do `ActivityHistory`.
*   O teste deve verificar que o contador de tentativas de re-planejamento é respeitado.
---
