# Plano de Teste Conceitual: APP-SVC-001.8.5
## Testar job com `tool_call` bem-sucedido

**Objetivo:** Verificar se o `GenericAgentExecutor` processa corretamente um job que envolve uma chamada de ferramenta (`tool_call`) bem-sucedida. Isso inclui a interação inicial com o LLM, a chamada à ferramenta, o envio do resultado da ferramenta de volta ao LLM, e a subsequente resposta do LLM que leva à conclusão bem-sucedida do job.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` e `mockAgent` disponíveis do `beforeEach`.

---

### Caso de Teste: `should successfully execute a job with a successful tool_call and continue LLM interaction to completion`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach`.
    2.  **`mockAgent`:** Utilizar o `mockAgent` do `beforeEach`.
    3.  **Mock `IToolRegistryService.getTool`:**
        *   Configurar para ser chamado com o nome da ferramenta, ex: `"mockSuccessTool"`.
        *   Fazer com que retorne `Result.ok(mockSuccessfulTool)`.
    4.  **`mockSuccessfulTool` (Mock de `IAgentTool`):**
        *   `name: 'mockSuccessTool'`
        *   `description: 'A mock tool that always succeeds.'`
        *   `parameters: z.object({ param1: z.string().optional() })` (ou um schema simples como `z.object({})`).
        *   Mockear o método `execute`:
            ```typescript
            mockSuccessfulTool.execute = vi.fn().mockResolvedValue(Result.ok({ toolOutput: "value from successful tool" }));
            ```
    5.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado **duas vezes**:
            *   **Primeira chamada (solicitação da ferramenta):**
                `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: null, tool_calls: [{ id: 'toolCallId123', type: 'function', function: { name: 'mockSuccessTool', arguments: '{"param1": "test"}' } }] }));`
            *   **Segunda chamada (após resultado da ferramenta):**
                `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: 'Goal achieved after using mockSuccessTool.', tool_calls: [] }));` (Esta mensagem deve satisfazer `isGoalAchievedByLlmResponse`).
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
            *   `expect(result.value.status).toBe('SUCCESS');`
            *   `expect(result.value.message).toContain('Goal achieved after using mockSuccessTool.');`
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);`
        *   **Primeira chamada:** Verificar argumentos (mensagem de sistema, prompt inicial).
        *   **Segunda chamada:** Verificar argumentos. A lista de mensagens deve incluir:
            *   Mensagem de sistema.
            *   Prompt inicial.
            *   A primeira resposta do assistente (com o `tool_calls`).
            *   A entrada `TOOL_RESULT` com `role: 'tool'`, `tool_call_id: 'toolCallId123'`, e `content: JSON.stringify({ toolOutput: "value from successful tool" })`.
    3.  **Interação com `IToolRegistryService` e a Ferramenta:**
        *   `expect(mockToolRegistryService.getTool).toHaveBeenCalledWith('mockSuccessTool');`
        *   `expect(mockSuccessfulTool.execute).toHaveBeenCalledTimes(1);`
        *   `expect(mockSuccessfulTool.execute).toHaveBeenCalledWith({ param1: 'test' }, expect.objectContaining({ jobId: mockJob.id().value(), agentId: mockAgent.id().value() }));`
    4.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);`
        *   `expect(mockJob.result()).toEqual({ message: 'Goal achieved after using mockSuccessTool.' });`
    5.  **`ActivityHistory` no `Job`:**
        *   Obter o histórico: `const history = mockJob.currentData().agentState.conversationHistory.entries();`
        *   Verificar a sequência e o conteúdo das entradas:
            1.  (Opcional) Prompt do usuário.
            2.  Resposta do `ASSISTANT` com `tool_calls` para `mockSuccessTool`.
            3.  Entrada `TOOL_RESULT` para `mockSuccessTool` com `toolName: 'mockSuccessTool'`, `toolCallId: 'toolCallId123'`, e o resultado da ferramenta.
            4.  Segunda resposta do `ASSISTANT` ("Goal achieved...").
    6.  **`ExecutionHistory` no `Job`:**
        *   Obter o histórico de execução: `const execHistory = mockJob.currentData().agentState.executionHistory;`
        *   `expect(execHistory.length).toBeGreaterThanOrEqual(1);`
        *   Verificar a entrada para `mockSuccessTool`:
            *   `const toolEntry = execHistory.find(e => e.name === 'mockSuccessTool');`
            *   `expect(toolEntry).toBeDefined();`
            *   `expect(toolEntry?.type).toBe('tool_call');`
            *   `expect(toolEntry?.params).toEqual({ param1: 'test' });`
            *   `expect(toolEntry?.result).toEqual({ toolOutput: "value from successful tool" });`
            *   `expect(toolEntry?.error).toBeUndefined();`
    7.  **Chamadas a `IJobRepository.save`:**
        *   Verificar se foi chamado o número apropriado de vezes (pelo menos inicial, após cada `agentState` update, e final).
        *   A última chamada deve ter o job com status `COMPLETED`.

---

**Considerações Adicionais:**
*   Este teste cobre um fluxo fundamental do `GenericAgentExecutor`.
*   A precisão das verificações dos argumentos de mock e do conteúdo do histórico é importante.
---
