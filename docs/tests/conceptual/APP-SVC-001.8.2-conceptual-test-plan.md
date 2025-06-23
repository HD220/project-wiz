# Plano de Teste Conceitual: APP-SVC-001.8.2
## Testar job simples sem `tool_calls` (sucesso)

**Objetivo:** Verificar se o `GenericAgentExecutor` processa corretamente um job que não requer `tool_calls` e cujo LLM indica diretamente que o objetivo foi alcançado. O teste deve validar a interação com o `ILLMAdapter`, a atualização do `ActivityHistory` no `Job`, e a finalização do `Job` com status `SUCCESS`.

---

### Pré-requisitos
*   O setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) já está estabelecido, com mocks para `ILLMAdapter`, `IJobRepository`, `ILogger`, etc.
*   Instâncias de `mockJob` e `mockAgent` estão disponíveis a partir do `beforeEach`.

---

### Caso de Teste: `should successfully execute a simple job without tool_calls when LLM indicates goal achieved`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach`. Garantir que `mockJob.currentData().agentState.conversationHistory` esteja vazio ou contenha apenas um prompt inicial do usuário (ex: do payload do job).
        *   Exemplo de payload no `mockJob` (se o histórico inicial for do payload): `payload: { prompt: 'Perform a simple task.' }`
    2.  **`mockAgent`:** Utilizar o `mockAgent` do `beforeEach`.
    3.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado uma única vez: `mockLlmAdapter.generateText.mockResolvedValueOnce(...)`.
        *   Fazer com que retorne `Result.ok()` com uma `LanguageModelMessage` que:
            *   `role: 'assistant'`
            *   `content: 'Goal achieved. Task is complete.'` (A mensagem deve ser reconhecida por `isGoalAchievedByLlmResponse`).
            *   `tool_calls: []` (ou `undefined`).
    4.  **Mock `IJobRepository.save`:**
        *   Configurar para ser chamado pelo menos duas vezes (no início de `executeJob` para marcar como `ACTIVE`, e no final para marcar como `COMPLETED`).
        *   Fazer com que retorne `Result.ok(mockJob)` em todas as chamadas.

*   **Act:**
    1.  Executar o método a ser testado:
        ```typescript
        const result = await executor.executeJob(mockJob, mockAgent);
        ```

*   **Assert:**
    1.  **Resultado Geral da Execução:**
        *   `expect(result.isOk()).toBe(true);`
        *   Se `result.isOk()`:
            *   `expect(result.value.status).toBe('SUCCESS');`
            *   `expect(result.value.message).toContain('Goal achieved');`
            *   `expect(result.value.output).toEqual({ message: 'Goal achieved. Task is complete.' });`
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);`
        *   Opcional: Verificar os argumentos da chamada a `generateText`. A lista de mensagens deve conter:
            *   A mensagem de sistema (derivada da `mockAgent.personaTemplate()`).
            *   A mensagem do usuário (derivada do `mockJob.payload().prompt` ou nome do job, se o histórico estava vazio).
    3.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);`
        *   `expect(mockJob.result()).toEqual({ message: 'Goal achieved. Task is complete.' });` (ou o que foi definido como `outputData` no `AgentExecutorResult`).
    4.  **`ActivityHistory` no `Job`:**
        *   Obter o histórico: `const history = mockJob.currentData().agentState.conversationHistory.entries();`
        *   `expect(history.length).toBeGreaterThanOrEqual(1);` (Pelo menos a resposta do assistente. Se o job tinha um prompt, então 2).
        *   Verificar a última entrada no histórico:
            *   `expect(history[history.length - 1].role()).toBe(HistoryEntryRoleType.ASSISTANT);`
            *   `expect(history[history.length - 1].content()).toBe('Goal achieved. Task is complete.');`
            *   `expect(history[history.length - 1].props.tool_calls).toBeUndefined();` (ou `toBeNull()` ou `toHaveLength(0)` dependendo da implementação exata).
    5.  **`ExecutionHistory` no `Job`:**
        *   `expect(mockJob.currentData().agentState.executionHistory).toEqual([]);` (Nenhuma ferramenta foi chamada ou erro ocorreu).
    6.  **Chamadas a `IJobRepository.save`:**
        *   `expect(mockJobRepository.save).toHaveBeenCalledTimes(2);` (uma para `ACTIVE`, uma para `COMPLETED`).
        *   Verificar a primeira chamada: `expect(vi.mocked(mockJobRepository.save).mock.calls[0][0].status().is(JobStatusType.ACTIVE)).toBe(true);`
        *   Verificar a segunda chamada: `expect(vi.mocked(mockJobRepository.save).mock.calls[1][0].status().is(JobStatusType.COMPLETED)).toBe(true);`
    7.  **Chamadas ao `ILogger`:**
        *   `expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Executing Job ID:'), expect.anything());`
        *   `expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Calling LLM for Job ID:'), expect.anything());`
        *   `expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('LLM response (iteration 1) received'), expect.anything());`
        *   `expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Goal achieved for Job ID:'), expect.anything());`
        *   `expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('finalized with status: SUCCESS and persisted successfully'), expect.anything());`

---

**Considerações Adicionais:**
*   A função `isGoalAchievedByLlmResponse` no `GenericAgentExecutor` deve ser consistente com a mensagem de "Goal achieved" usada no mock do LLM.
*   A estrutura exata do `AgentExecutorResult.output` e `Job.result()` deve ser verificada conforme a implementação.
*   Este teste foca no "caminho feliz" mais simples.
---
