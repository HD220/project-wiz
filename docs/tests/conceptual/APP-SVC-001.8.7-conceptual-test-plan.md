# Plano de Teste Conceitual: APP-SVC-001.8.7
## Testar `tool_call` com `ToolError` não recuperável (crítico)

**Objetivo:** Verificar se o `GenericAgentExecutor` lida corretamente com um `ToolError` explicitamente marcado como não recuperável (`isRecoverable: false`). O executor deve identificar este erro como crítico, registrar as informações detalhadas da falha no `Job` (usando `criticalToolFailureInfo` e `lastFailureSummary`), interromper o processamento de mais `tool_calls` naquele turno (se houver), e finalizar o job com o status `FAILURE_TOOL`.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` e `mockAgent` disponíveis do `beforeEach`.

---

### Caso de Teste: `should handle a non-recoverable (critical) ToolError, populate criticalToolFailureInfo, and finish with FAILURE_TOOL`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach`.
    2.  **`mockAgent`:** Utilizar o `mockAgent` do `beforeEach`.
    3.  **Mock `IToolRegistryService.getTool`:**
        *   Configurar para ser chamado com o nome da ferramenta, ex: `"nonRecoverableErrorTool"`.
        *   Fazer com que retorne `Result.ok(mockNonRecoverableErrorTool)`.
    4.  **`mockNonRecoverableErrorTool` (Mock de `IAgentTool`):**
        *   `name: 'nonRecoverableErrorTool'`
        *   `description: 'A mock tool that returns a non-recoverable (critical) error.'`
        *   `parameters: z.object({ criticalParam: z.string() })`
        *   Mockear o método `execute`:
            ```typescript
            const nonRecoverableError = new ToolError(
                "Simulated CRITICAL non-recoverable error", // message
                "nonRecoverableErrorTool", // toolName
                new Error("Underlying cause of critical failure"), // originalError
                false // isRecoverable = false
            );
            mockNonRecoverableErrorTool.execute = vi.fn().mockResolvedValue(Result.error(nonRecoverableError));
            ```
    5.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado **apenas uma vez** (para solicitar a ferramenta). O executor não deve chamar o LLM novamente após um erro crítico de ferramenta.
            `mockLlmAdapter.generateText.mockResolvedValueOnce(Result.ok({ role: 'assistant', content: null, tool_calls: [{ id: 'toolCallCrit789', type: 'function', function: { name: 'nonRecoverableErrorTool', arguments: '{"criticalParam": "trigger"}' } }] }));`
    6.  **Mock `IJobRepository.save`:**
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
            *   `expect(result.value.message).toContain('Critical: Tool \'nonRecoverableErrorTool\' failed non-recoverably: Simulated CRITICAL non-recoverable error');` (ou a mensagem exata definida em `lastFailureSummary`).
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);` (Não deve haver segunda chamada ao LLM).
    3.  **Interação com `IToolRegistryService` e a Ferramenta:**
        *   `expect(mockToolRegistryService.getTool).toHaveBeenCalledWith('nonRecoverableErrorTool');`
        *   `expect(mockNonRecoverableErrorTool.execute).toHaveBeenCalledTimes(1);`
        *   `expect(mockNonRecoverableErrorTool.execute).toHaveBeenCalledWith({ criticalParam: "trigger" }, expect.anything());`
    4.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);`
        *   **`criticalToolFailureInfo` no `Job`:**
            *   `const failureInfo = mockJob.currentData().criticalToolFailureInfo;`
            *   `expect(failureInfo).toBeDefined();`
            *   `expect(failureInfo?.toolName).toBe('nonRecoverableErrorTool');`
            *   `expect(failureInfo?.errorType).toBe('ToolError');` // Ou o nome da classe do erro específico
            *   `expect(failureInfo?.message).toBe('Simulated CRITICAL non-recoverable error');`
            *   `expect(failureInfo?.isRecoverable).toBe(false);`
            *   `expect(failureInfo?.details?.message).toBe('Underlying cause of critical failure');`
        *   **`lastFailureSummary` no `Job`:**
            *   `expect(mockJob.currentData().lastFailureSummary).toContain('Critical: Tool \'nonRecoverableErrorTool\' failed non-recoverably: Simulated CRITICAL non-recoverable error');`
        *   Verificar `mockJob.currentData().executionResult?.status` para ser `FAILURE_TOOL`.
    5.  **`ActivityHistory` no `Job`:**
        *   Obter o histórico: `const history = mockJob.currentData().agentState.conversationHistory.entries();`
        *   A última entrada do assistente deve ser aquela que solicitou o `tool_call`.
        *   **Não** deve haver uma entrada `TOOL_RESULT` para `nonRecoverableErrorTool`, ou se houver uma política para registrar falhas críticas no histórico de conversação, ela deve ser verificada. (Conforme a implementação atual do executor, `TOOL_RESULT` para erros críticos não é adicionado ao `conversationHistory` para evitar que o LLM tente processá-lo, mas sim ao `executionHistory` e `criticalToolFailureInfo`).
    6.  **`ExecutionHistory` no `Job`:**
        *   Obter o histórico de execução: `const execHistory = mockJob.currentData().agentState.executionHistory;`
        *   Verificar a entrada para `nonRecoverableErrorTool`:
            *   `const toolEntry = execHistory.find(e => e.name === 'nonRecoverableErrorTool');`
            *   `expect(toolEntry).toBeDefined();`
            *   `expect(toolEntry?.type).toBe('tool_error');`
            *   `expect(toolEntry?.isCritical).toBe(true);`
            *   `expect(toolEntry?.error).toBeInstanceOf(ToolError);`
            *   `expect((toolEntry?.error as ToolError).isRecoverable).toBe(false);`
            *   `expect((toolEntry?.error as ToolError).message).toBe('Simulated CRITICAL non-recoverable error');`
    7.  **Chamadas a `IJobRepository.save`:**
        *   A última chamada a `save` deve ser com o `mockJob` tendo o status `FAILED` e os detalhes do erro crítico.

---

**Considerações Adicionais:**
*   Este teste valida o caminho de falha crítica devido a uma ferramenta que se reporta como não recuperável.
*   Assegura que o `GenericAgentExecutor` não tente continuar o processamento ou replanejar com o LLM após tal erro.
---
