# Plano de Teste Conceitual: APP-SVC-001.8.3
## Testar job atingindo `maxIterations`

**Objetivo:** Verificar se o `GenericAgentExecutor` finaliza corretamente um job com o status `FAILURE_MAX_ITERATIONS` quando o número máximo de iterações (definido no `Agent`) é atingido antes que o objetivo do job seja alcançado.

---

### Pré-requisitos
*   Setup do arquivo de teste `generic-agent-executor.service.spec.ts` (conforme `APP-SVC-001.8.1`) com mocks para dependências.
*   Instâncias de `mockJob` (padrão) e `mockAgent` (padrão) disponíveis do `beforeEach`, ou capacidade de criar um `Agent` específico para este teste com `maxIterations` baixo.

---

### Caso de Teste: `should finish with FAILURE_MAX_ITERATIONS when maxIterations is reached`

*   **Arrange:**
    1.  **`mockJob`:** Utilizar o `mockJob` do `beforeEach` ou um similar.
    2.  **`lowIterationAgent`:** Criar uma instância de `Agent` especificamente para este teste com um `maxIterations` baixo, por exemplo, 3.
        ```typescript
        const lowIterationAgent = Agent.create({
            id: AgentId.generate(),
            personaTemplate: mockAgent.personaTemplate(), // Reutilizar a personaTemplate do setup padrão se houver
            llmProviderConfigId: mockAgent.llmProviderConfigId(), // Reutilizar do setup padrão
            temperature: AgentTemperature.create(0.7).unwrap(),
            maxIterations: MaxIterations.create(3).unwrap() // Definir maxIterations baixo
        }).unwrap();
        ```
    3.  **Mock `ILLMAdapter.generateText`:**
        *   Configurar para ser chamado `lowIterationAgent.maxIterations().value()` vezes (ou seja, 3 vezes).
        *   Em cada chamada, deve retornar `Result.ok()` com uma `LanguageModelMessage` que:
            *   `role: 'assistant'`
            *   `content: 'Still thinking...'` (uma mensagem que **não** satisfaça `isGoalAchievedByLlmResponse`).
            *   `tool_calls: []` (ou `undefined`).
        *   Exemplo: `mockLlmAdapter.generateText.mockResolvedValue(Result.ok({ role: 'assistant', content: 'Still thinking...', tool_calls: [] }));` (Se for chamado múltiplas vezes, pode ser necessário usar `mockResolvedValueOnce` para cada chamada se a resposta precisar variar, mas para este teste, a mesma resposta "não conclusiva" serve).
    4.  **Mock `IJobRepository.save`:**
        *   Configurar para retornar `Result.ok(mockJob)` em todas as chamadas.

*   **Act:**
    1.  Executar o método a ser testado com o `lowIterationAgent`:
        ```typescript
        const result = await executor.executeJob(mockJob, lowIterationAgent);
        ```

*   **Assert:**
    1.  **Resultado Geral da Execução:**
        *   `expect(result.isOk()).toBe(true);` (O executor em si não deve falhar).
        *   Se `result.isOk()`:
            *   `expect(result.value.status).toBe('FAILURE_MAX_ITERATIONS');`
            *   `expect(result.value.message).toContain(`Max iterations (${lowIterationAgent.maxIterations().value()}) reached. Goal not achieved.`);
    2.  **Interação com `ILLMAdapter`:**
        *   `expect(mockLlmAdapter.generateText).toHaveBeenCalledTimes(lowIterationAgent.maxIterations().value());` (Ex: 3 vezes).
    3.  **Estado Final do `Job`:**
        *   `expect(mockJob.status().is(JobStatusType.FAILED)).toBe(true);`
        *   Verificar `mockJob.currentData().lastFailureSummary` para conter a mensagem sobre `maxIterations`.
        *   Verificar `mockJob.currentData().executionResult?.status` para ser `FAILURE_MAX_ITERATIONS`.
    4.  **`ActivityHistory` no `Job`:**
        *   Obter o histórico: `const history = mockJob.currentData().agentState.conversationHistory.entries();`
        *   Verificar se contém o número correto de entradas do `ASSISTANT` (igual a `maxIterations`), cada uma com o conteúdo "Still thinking...".
    5.  **Chamadas a `IJobRepository.save`:**
        *   `expect(mockJobRepository.save).toHaveBeenCalled();` (Pelo menos duas vezes: inicial e final. Pode haver chamadas intermediárias para salvar o `agentState` a cada iteração).
        *   A última chamada a `save` deve ser com o `mockJob` tendo o status `FAILED` e `executionResult` indicando `FAILURE_MAX_ITERATIONS`.
    6.  **Chamadas ao `ILogger`:**
        *   `expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Max iterations reached for Job ID: ${mockJob.id().value()}`));`
        *   `expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Job ID: ${mockJob.id().value()} finalized with status: FAILURE_MAX_ITERATIONS and persisted successfully`), expect.anything());`

---

**Considerações Adicionais:**
*   Este teste é crucial para garantir que o executor não entre em loops infinitos.
*   A forma como o `agentState` (especialmente `conversationHistory` e `executionHistory`) é atualizado e salvo em cada iteração pelo `GenericAgentExecutor` deve ser considerada ao verificar o número de chamadas a `mockJobRepository.save`.
---
