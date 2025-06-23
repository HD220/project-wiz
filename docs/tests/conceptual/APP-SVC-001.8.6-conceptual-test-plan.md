# Plano de Teste Conceitual: APP-SVC-001.8.6
## Testar `tool_call` com `ToolError` recuperável

**Objetivo:** Verificar se o `GenericAgentExecutor` lida corretamente com um `ToolError` marcado como recuperável (`isRecoverable: true`). O executor deve registrar o erro da ferramenta no `ActivityHistory` (como uma entrada `TOOL_RESULT` contendo o erro) e, em seguida, chamar o LLM novamente, fornecendo o erro da ferramenta como contexto para que o LLM possa tentar uma abordagem diferente ou corrigir os parâmetros.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` e `mockAgent` disponíveis do `beforeEach`.

---

### Caso de Teste: `should handle a recoverable ToolError, add error to history, and call LLM again for replanning`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach`.
    2.  **`mockAgent`:** Utilizar o `mockAgent` do `beforeEach`.
    3.  **Mock `IToolRegistryService.getTool`:**
        *   Configurar para ser chamado com o nome da ferramenta, ex: `"recoverableErrorTool"`.
        *   Fazer com que retorne `Result.ok(mockRecoverableErrorTool)`.
    4.  **`mockRecoverableErrorTool` (Mock de `IAgentTool`):**
        *   `name: 'recoverableErrorTool'`
        *   `description: 'A mock tool that returns a recoverable error.'`
        *   `parameters: z.object({ data: z.string() })`
        *   Mockear o método `execute`:
            ```typescript
            const recoverableError = new ToolError(
                "Simulated recoverable error from tool",
                "recoverableErrorTool", // toolName
                new Error("Original error detail for recoverable"), // originalError
                true // isRecoverable = true
            );
            mockRecoverableErrorTool.execute = vi.fn().mockResolvedValue(Result.error(recoverableError));
            ```
    5.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado **duas vezes**:
            *   **Primeira chamada (solicitação da ferramenta):**
                `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: null, tool_calls: [{ id: 'toolCallId456', type: 'function', function: { name: 'recoverableErrorTool', arguments: '{"data": "some input"}' } }] }));`
            *   **Segunda chamada (após `TOOL_RESULT` com o erro recuperável):**
                `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: 'Goal achieved after LLM replanned due to recoverable tool error.', tool_calls: [] }));` (Esta mensagem deve satisfazer `isGoalAchievedByLlmResponse`).
    6.  **Mock `IJobRepository.save`:**
        *   Configurar para retornar `Result.ok(mockJob)` em todas as chamadas.

*   **Act:**
    1.  Executar o método a ser testado:
        ```typescript
        const result = await executor.executeJob(mockJob, mockAgent);
        ```

*   **Assert:**
    1.  **Resultado Geral da Execução:**
        *   `expect(result.isOk()).toBe(true);`
        *   Se `result.isOk()`:
            *   `expect(result.value.status).toBe('SUCCESS');` // Assumindo que o LLM consegue se recuperar e atingir o objetivo.
            *   `expect(result.value.message).toContain('Goal achieved after LLM replanned');`
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);`
        *   **Segunda chamada:** Verificar se os argumentos para `generateText` incluem o histórico atualizado com:
            *   A primeira resposta do assistente (com o `tool_call`).
            *   A entrada `TOOL_RESULT` com `role: 'tool'`, `tool_call_id: 'toolCallId456'`, `toolName: 'recoverableErrorTool'`, e o `content` sendo o `ToolError` recuperável serializado.
    3.  **Interação com `IToolRegistryService` e a Ferramenta:**
        *   `expect(mockToolRegistryService.getTool).toHaveBeenCalledWith('recoverableErrorTool');`
        *   `expect(mockRecoverableErrorTool.execute).toHaveBeenCalledTimes(1);`
        *   `expect(mockRecoverableErrorTool.execute).toHaveBeenCalledWith({ data: "some input" }, expect.anything());`
    4.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);`
    5.  **`ActivityHistory` no `Job`:**
        *   Obter o histórico: `const history = mockJob.currentData().agentState.conversationHistory.entries();`
        *   Verificar a sequência:
            1.  (Prompt inicial)
            2.  Resposta do `ASSISTANT` com `tool_call` para `recoverableErrorTool`.
            3.  Entrada `TOOL_RESULT` para `recoverableErrorTool`, cujo `content` deve ser a representação JSON do `ToolError` (incluindo `isRecoverable: true`).
            4.  Segunda resposta do `ASSISTANT` ("Goal achieved...").
    6.  **`ExecutionHistory` no `Job`:**
        *   Obter o histórico de execução: `const execHistory = mockJob.currentData().agentState.executionHistory;`
        *   Verificar a entrada para `recoverableErrorTool`:
            *   `const toolEntry = execHistory.find(e => e.name === 'recoverableErrorTool');`
            *   `expect(toolEntry).toBeDefined();`
            *   `expect(toolEntry?.type).toBe('tool_error');`
            *   `expect(toolEntry?.params).toEqual({ data: "some input" });`
            *   `expect(toolEntry?.error).toBeInstanceOf(ToolError);`
            *   `expect((toolEntry?.error as ToolError).isRecoverable).toBe(true);`
            *   `expect(toolEntry?.isCritical).toBe(false);` // Conforme lógica adicionada em APP-SVC-001.7.2
    7.  **`criticalToolFailureInfo` no `Job`:**
        *   `expect(mockJob.currentData().criticalToolFailureInfo).toBeUndefined();` (O erro era recuperável).
    8.  **Chamadas a `IJobRepository.save`:**
        *   Verificar se foi chamado o número esperado de vezes. A última chamada com status `COMPLETED`.

---

**Considerações Adicionais:**
*   Este teste é importante para verificar a resiliência do agente a falhas de ferramentas que não são catastróficas.
*   A serialização do `ToolError` para a entrada `TOOL_RESULT` no `ActivityHistory` deve ser consistente.
---
