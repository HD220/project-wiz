# Plano de Teste Conceitual: APP-SVC-001.8.9
## Testar falha na validação de argumentos de ferramenta

**Objetivo:** Verificar se o `GenericAgentExecutor` lida corretamente com a falha na validação dos argumentos de uma ferramenta, conforme o schema Zod definido pela ferramenta. O sistema deve registrar o erro de validação, tratá-lo como um erro recuperável (já que o LLM pode corrigir os argumentos), e chamar o LLM novamente com o erro no histórico.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` e `mockAgent` disponíveis do `beforeEach`.

---

### Caso de Teste: `should handle tool argument validation failure, add error to history, and call LLM again`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach`.
    2.  **`mockAgent`:** Utilizar o `mockAgent` do `beforeEach`.
    3.  **Mock `IToolRegistryService.getTool`:**
        *   Configurar para ser chamado com o nome da ferramenta, ex: `"validationTestTool"`.
        *   Fazer com que retorne `Result.ok(mockValidationTestTool)`.
    4.  **`mockValidationTestTool` (Mock de `IAgentTool`):**
        *   `name: 'validationTestTool'`
        *   `description: 'A mock tool with specific argument validation.'`
        *   `parameters: z.object({ requiredParam: z.string().min(3) })` (um schema que pode falhar facilmente).
        *   O método `execute` não deve ser chamado se a validação falhar, mas pode ser um `vi.fn()` simples para garantir.
            ```typescript
            mockValidationTestTool.execute = vi.fn().mockResolvedValue(Result.ok({ output: "should not be called" }));
            ```
    5.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado **duas vezes**:
            *   **Primeira chamada (solicitação da ferramenta com argumentos inválidos):**
                `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: null, tool_calls: [{ id: 'toolCallValFail1', type: 'function', function: { name: 'validationTestTool', arguments: '{"requiredParam": "a"}' } }] }));` (Argumento "a" é muito curto, falhará na validação `min(3)`).
            *   **Segunda chamada (após `TOOL_RESULT` com o erro de validação):**
                `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: 'Goal achieved after LLM corrected tool arguments.', tool_calls: [] }));`
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
            *   `expect(result.value.status).toBe('SUCCESS');` (Assumindo que o LLM "corrige" e o job prossegue para sucesso).
            *   `expect(result.value.message).toContain('Goal achieved after LLM corrected tool arguments.');`
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(2);`
        *   **Segunda chamada:** Verificar se os argumentos para `generateText` incluem o histórico atualizado com:
            *   A primeira resposta do assistente (com o `tool_call` para `validationTestTool`).
            *   A entrada `TOOL_RESULT` com `role: 'tool'`, `tool_call_id: 'toolCallValFail1'`, `toolName: 'validationTestTool'`, e o `content` sendo o `ToolError` de validação serializado.
    3.  **Interação com `IToolRegistryService` e a Ferramenta:**
        *   `expect(mockToolRegistryService.getTool).toHaveBeenCalledWith('validationTestTool');`
        *   `expect(mockValidationTestTool.execute).not.toHaveBeenCalled();` (A execução não deve ocorrer devido à falha de validação).
    4.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.COMPLETED)).toBe(true);`
    5.  **`ActivityHistory` no `Job`:**
        *   Obter o histórico: `const history = mockJob.currentData().agentState.conversationHistory.entries();`
        *   Verificar a sequência:
            1.  (Prompt inicial)
            2.  Resposta do `ASSISTANT` com `tool_call` para `validationTestTool`.
            3.  Entrada `TOOL_RESULT` para `validationTestTool`, cujo `content` deve ser a representação JSON do `ToolError` de validação (indicando que `isRecoverable` é `true` e detalhando o erro Zod).
            4.  Segunda resposta do `ASSISTANT` ("Goal achieved...").
    6.  **`ExecutionHistory` no `Job`:**
        *   Obter o histórico de execução: `const execHistory = mockJob.currentData().agentState.executionHistory;`
        *   Verificar a entrada para `validationTestTool`:
            *   `const toolEntry = execHistory.find(e => e.name === 'validationTestTool');`
            *   `expect(toolEntry).toBeDefined();`
            *   `expect(toolEntry?.type).toBe('tool_error');`
            *   `expect(toolEntry?.params).toEqual({ requiredParam: "a" });` (Os argumentos originais que falharam na validação).
            *   `expect(toolEntry?.error).toBeInstanceOf(ToolError);`
            *   `expect((toolEntry?.error as ToolError).message).toContain('Argument validation failed');`
            *   `expect((toolEntry?.error as ToolError).isRecoverable).toBe(true);`
            *   `expect(toolEntry?.isCritical).toBe(false);`
    7.  **`criticalToolFailureInfo` no `Job`:**
        *   `expect(mockJob.currentData().criticalToolFailureInfo).toBeUndefined();`
    8.  **Chamadas a `IJobRepository.save`:**
        *   Verificar se foi chamado o número esperado de vezes.

---

**Considerações Adicionais:**
*   Este teste foca na capacidade do sistema de se recuperar de entradas malformadas do LLM para ferramentas, assumindo que o LLM pode aprender com o erro de validação.
---
