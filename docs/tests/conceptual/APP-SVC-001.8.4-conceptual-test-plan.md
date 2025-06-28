# Plano de Teste Conceitual: APP-SVC-001.8.4
## Testar erro em `ILLMAdapter.generateText`

**Objetivo:** Verificar se o `GenericAgentExecutor` lida corretamente com erros retornados pelo `ILLMAdapter.generateText`, finalizando o job com o status `FAILURE_LLM` e registrando o erro.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` e `mockAgent` disponíveis do `beforeEach`.

---

### Caso de Teste: `should finish with FAILURE_LLM when ILLMAdapter.generateText returns an error`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach`.
    2.  **`mockAgent`:** Utilizar o `mockAgent` do `beforeEach`.
    3.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado uma única vez: `mockLlmAdapter.generateText.mockResolvedValueOnce(...)`.
        *   Fazer com que retorne `Result.error(new ApplicationError('Simulated LLM API Error'))`. (Nota: `ApplicationError` é usado como exemplo; o tipo de erro real pode ser `LLMError` ou um erro de domínio mais específico se `ILLMAdapter` o encapsular assim).
    4.  **Mock `IJobRepository.save`:**
        *   Configurar para retornar `Result.ok(mockJob)` em todas as chamadas. É importante que a chamada final para salvar o job no estado de falha seja bem-sucedida para o propósito deste teste.

*   **Act:**
    1.  Executar o método a ser testado:
        ```typescript
        const result = await executor.executeJob(mockJob, mockAgent);
        ```

*   **Assert:**
    1.  **Resultado Geral da Execução:**
        *   `expect(result.isOk()).toBe(true);` (O executor em si não falhou, mas o job sim).
        *   Se `result.isOk()`:
            *   `expect(result.value.status).toBe('FAILURE_LLM');`
            *   `expect(result.value.message).toContain('LLM generation failed');`
            *   `expect(result.value.message).toContain('Simulated LLM API Error');`
            *   `expect(result.value.errors).toBeDefined();`
            *   Se `result.value.errors` for um array, verificar se contém uma entrada que corresponda ao erro simulado.
                ```typescript
                // Exemplo de verificação do erro no resultado
                const llmErrorEntry = result.value.errors?.find(e => typeof e === 'object' && e.type === 'llm_error');
                expect(llmErrorEntry).toBeDefined();
                // @ts-ignore // Para acessar 'error' que pode ser string ou objeto
                expect(llmErrorEntry?.error).toContain('Simulated LLM API Error');
                ```
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(1);`
    3.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);`
        *   Verificar `mockJob.currentData().lastFailureSummary` se ele é populado com a mensagem de erro do LLM (isso depende da lógica exata no executor, pode ser que a mensagem detalhada vá apenas para `executionResult`).
        *   Verificar `mockJob.currentData().executionResult?.status` para ser `FAILURE_LLM`.
        *   Verificar `mockJob.currentData().executionResult?.message` para conter "Simulated LLM API Error".
    4.  **`ExecutionHistory` no `Job`:**
        *   Obter o histórico: `const execHistory = mockJob.currentData().agentState.executionHistory;`
        *   `expect(execHistory.length).toBeGreaterThanOrEqual(1);`
        *   Verificar a última entrada (ou a entrada relevante) no `executionHistory`:
            *   `const errorEntry = execHistory.find(e => e.type === 'llm_error');`
            *   `expect(errorEntry).toBeDefined();`
            *   `expect(errorEntry?.name).toBe('LLM Generation');`
            *   `expect(errorEntry?.error).toContain('Simulated LLM API Error');`
    5.  **Chamadas a `IJobRepository.save`:**
        *   `expect(mockJobRepository.save).toHaveBeenCalled();` (Pelo menos duas vezes: uma para `ACTIVE` no início, e uma para `FAILED` após o erro do LLM).
        *   A última chamada a `save` deve ser com o `mockJob` tendo o status `FAILED` e o `executionResult` e `executionHistory` atualizados.
    6.  **Chamadas ao `ILogger`:**
        *   `expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('LLM generation failed'), expect.any(ApplicationError), expect.anything());`

---

**Considerações Adicionais:**
*   O tipo exato do erro retornado por `ILLMAdapter.generateText` (`ApplicationError`, `LLMError`, `DomainError`) deve ser consistente com a implementação real do adaptador.
*   Este teste foca no tratamento de erro imediato do LLM. Não testa cenários de re-tentativa de LLM, a menos que isso seja parte do comportamento síncrono do `generateText` (o que é improvável).
---
