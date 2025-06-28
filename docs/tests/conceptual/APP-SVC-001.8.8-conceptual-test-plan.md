# Plano de Teste Conceitual: APP-SVC-001.8.8
## Testar erro "Tool not found"

**Objetivo:** Verificar se o `GenericAgentExecutor` lida corretamente com a situação em que uma ferramenta solicitada pelo LLM não é encontrada no `IToolRegistryService`. Este é considerado um erro crítico, e o executor deve registrar as informações da falha no `Job` e finalizar com o status `FAILURE_TOOL`.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` e `mockAgent` disponíveis do `beforeEach`.

---

### Caso de Teste: `should handle "Tool not found" error, populate criticalToolFailureInfo, and finish with FAILURE_TOOL`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach`.
    2.  **`mockAgent`:** Utilizar o `mockAgent` do `beforeEach`.
    3.  **Mock `IToolRegistryService.getTool`:**
        *   Configurar para ser chamado com o nome da ferramenta inexistente, ex: `"nonExistentTool"`.
        *   Fazer com que retorne `Result.error(new DomainError('Tool not found: nonExistentTool'))`. (O `ToolError` específico com `isRecoverable: false` é criado dentro do `processAndValidateSingleToolCall` quando `getTool` falha).
    4.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado **apenas uma vez** (para solicitar a ferramenta).
            `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: null, tool_calls: [{ id: 'toolCallNotFound789', type: 'function', function: { name: 'nonExistentTool', arguments: '{}' } }] }));`
    5.  **Mock `IJobRepository.save`:**
        *   Configurar para retornar `Result.ok(mockJob)` em todas as chamadas.

*   **Act:**
    1.  Executar o método a ser testado:
        ```typescript
        const result = await executor.executeJob(mockJob, mockAgent);
        ```

*   **Assert:**
    1.  **Resultado Geral da Execução:**
        *   `expect(result.isOk()).toBe(true);` (O executor em si não falhou, mas o job sim).
        *   Se `result.isOk()`:
            *   `expect(result.value.status).toBe('FAILURE_TOOL');`
            *   `expect(result.value.message).toContain("Critical: Tool 'nonExistentTool' failed non-recoverably: Tool 'nonExistentTool' not found.");` (ou a mensagem exata definida em `lastFailureSummary`).
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);` (Não deve haver segunda chamada ao LLM).
    3.  **Interação com `IToolRegistryService`:**
        *   `expect(mockToolRegistryService.getTool).toHaveBeenCalledWith('nonExistentTool');`
    4.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);`
        *   **`criticalToolFailureInfo` no `Job`:**
            *   `const failureInfo = mockJob.currentData().criticalToolFailureInfo;`
            *   `expect(failureInfo).toBeDefined();`
            *   `expect(failureInfo?.toolName).toBe('nonExistentTool');`
            *   `expect(failureInfo?.errorType).toBe('ToolError');` // Ou o que for definido para ToolNotFoundError internamente
            *   `expect(failureInfo?.message).toMatch(/Tool 'nonExistentTool' not found/);`
            *   `expect(failureInfo?.isRecoverable).toBe(false);`
        *   **`lastFailureSummary` no `Job`:**
            *   `expect(mockJob.currentData().lastFailureSummary).toContain("Critical: Tool 'nonExistentTool' failed non-recoverably: Tool 'nonExistentTool' not found.");`
        *   Verificar `mockJob.currentData().executionResult?.status` para ser `FAILURE_TOOL`.
    5.  **`ActivityHistory` no `Job`:**
        *   A última entrada do assistente deve ser aquela que solicitou o `tool_call`.
        *   **Não** deve haver uma entrada `TOOL_RESULT` para `nonExistentTool`.
    6.  **`ExecutionHistory` no `Job`:**
        *   Obter o histórico de execução: `const execHistory = mockJob.currentData().agentState.executionHistory;`
        *   Verificar a entrada para `nonExistentTool`:
            *   `const toolEntry = execHistory.find(e => e.name === 'nonExistentTool');`
            *   `expect(toolEntry).toBeDefined();`
            *   `expect(toolEntry?.type).toBe('tool_error');`
            *   `expect(toolEntry?.isCritical).toBe(true);`
            *   `expect(toolEntry?.error).toBeInstanceOf(ToolError);`
            *   `expect((toolEntry?.error as ToolError).message).toMatch(/Tool 'nonExistentTool' not found/);`
            *   `expect((toolEntry?.error as ToolError).isRecoverable).toBe(false);`
    7.  **Chamadas a `IJobRepository.save`:**
        *   A última chamada a `save` deve ser com o `mockJob` tendo o status `FAILED` e os detalhes do erro crítico.

---

**Considerações Adicionais:**
*   Este teste é similar ao `APP-SVC-001.8.7` (ToolError não recuperável), mas foca especificamente no caso de a ferramenta não ser encontrada, que é um tipo de erro crítico gerenciado internamente pelo `processAndValidateSingleToolCall`.
---
