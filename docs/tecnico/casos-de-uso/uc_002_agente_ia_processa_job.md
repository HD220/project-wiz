# UC-002: Agente IA Processa um Job

**ID:** UC-002
**Nome do Caso de Uso:** Agente IA Processa um Job
**Ator Principal:** `WorkerService` (atuando em nome de um Agente IA)
**Atores Secundários:** `GenericAgentExecutor`, LLM, `ToolRegistry`, `IJobRepository`
**Nível:** Sistema
**Prioridade:** Alta
**Referência Funcional:** `docs/funcional/03_operacao_agentes_ia.md`, `docs/funcional/04_sistema_jobs_atividades_fila.md`

## Descrição Breve:
Este caso de uso descreve como um Agente IA, através do `GenericAgentExecutor` e orquestrado por um `WorkerService`, processa um Job que lhe foi atribuído da fila. Inclui interação com LLM, uso de `Tools`, gerenciamento de contexto e atualização do estado do Job.

## Pré-condições:
1.  Um `Job` existe na fila com status `PENDING` (ou `DELAYED` e `executeAfter` já passou) e seu `targetAgentRole` corresponde ao `handlesRole` do `WorkerService`.
2.  O `WorkerService` para o `role` relevante está ativo e polando a fila.
3.  O `GenericAgentExecutor` está configurado com o `AgentPersonaTemplate` correto para o `role`.
4.  As `Tools` listadas no `AgentPersonaTemplate` estão registradas no `ToolRegistry`.
5.  A integração com o LLM está operacional.
6.  O `IJobRepository` está acessível.

## Fluxo Principal (Processamento Iterativo de um Job):
1.  **`WorkerService` Obtém Job:**
    *   O `WorkerService` consulta o `IJobRepository` (via `findPendingByRole`) e obtém um `Job` elegível.
2.  **`WorkerService` Prepara Job para Execução:**
    *   O `WorkerService` transita o `Job` para o status `ACTIVE`.
    *   O `WorkerService` persiste a mudança de status do `Job` no `IJobRepository`.
3.  **`WorkerService` Delega ao `GenericAgentExecutor`:**
    *   O `WorkerService` invoca o método `processJob(job)` do `GenericAgentExecutor`.
4.  **`GenericAgentExecutor` Inicia/Continua Processamento:**
    *   O `GenericAgentExecutor` carrega o `AgentJobState` (incluindo `ActivityContext` e `conversationHistory`) de `job.data.agentState`. Se não existir, inicializa um novo.
    *   Se a `conversationHistory` estiver vazia, constrói um prompt de sistema inicial (com base no `AgentPersonaTemplate`, objetivo do Job, ferramentas disponíveis) e um prompt de usuário inicial (com o `job.payload.goal` e contexto, incluindo `lastFailureSummary` se aplicável).
    *   Se a `conversationHistory` for muito longa, executa a lógica de sumarização de histórico.
5.  **`GenericAgentExecutor` Interage com LLM:**
    *   Envia a `conversationHistory` atual e a descrição das `Tools` disponíveis para o LLM (via `ai-sdk` e `generateObject`).
    *   O LLM analisa o contexto e decide a próxima ação:
        *   Chamar uma `Tool`.
        *   Solicitar um replanejamento (`requestReplan: true`).
        *   Concluir o Job (`finalSummary` e `outputData`).
6.  **`GenericAgentExecutor` Processa Resposta do LLM:**
    *   A `conversationHistory` é atualizada com a resposta do LLM e quaisquer chamadas/resultados de `Tools`.
    *   **Se LLM solicitou `Tool`:**
        1.  O `ai-sdk` (ou o `GenericAgentExecutor` orquestrando-o) executa a `Tool` através do `ToolRegistry`.
        2.  O resultado (ou erro) da `Tool` é adicionado à `conversationHistory`.
        3.  O `GenericAgentExecutor` determina que o Job precisa de mais processamento (`status: 'CONTINUE_PROCESSING'`).
    *   **Se LLM solicitou Replanejamento (`requestReplan: true`):**
        1.  O `GenericAgentExecutor` sumariza a tentativa falha (pode envolver outra chamada LLM).
        2.  A `conversationHistory` é reiniciada (para o próximo ciclo).
        3.  O sumário da falha é armazenado em `job.data.lastFailureSummary`.
        4.  O `GenericAgentExecutor` retorna `status: 'CONTINUE_PROCESSING'`.
    *   **Se LLM Concluiu o Job:**
        1.  O `GenericAgentExecutor` retorna `status: 'COMPLETED'`, junto com `finalSummary` e `outputData`.
    *   **Se LLM encontrou um erro irrecuperável ou outro estado final:**
        1.  O `GenericAgentExecutor` retorna `status: 'FAILED'` com uma mensagem.
7.  **`GenericAgentExecutor` Atualiza `job.data.agentState`:**
    *   Antes de retornar, o `GenericAgentExecutor` garante que `job.data.agentState` (com a `conversationHistory` e `executionHistory` atualizadas) esteja atualizado no objeto `Job` em memória.
8.  **`WorkerService` Recebe Resultado do Executor:**
    *   O `WorkerService` recebe o `AgentExecutorResult` (`status`, `message`, `output`).
9.  **`WorkerService` Atualiza Estado do Job no Repositório:**
    *   Com base no `AgentExecutorResult.status`:
        *   **`COMPLETED`:** `Job` é movido para `COMPLETED`, `result` é salvo.
        *   **`FAILED`:** `Job` é movido para `FAILED`, mensagem de erro é salva.
        *   **`CONTINUE_PROCESSING`:** `Job` é movido para `WAITING` (ou `DELAYED` com um pequeno delay) para ser pego novamente no próximo ciclo de polling. O `job.data.agentState` atualizado é persistido.
    *   O `WorkerService` salva o `Job` atualizado no `IJobRepository`.
10. **Loop de Processamento:** Se o Job retornou `CONTINUE_PROCESSING`, ele será pego novamente pelo `WorkerService` em um ciclo futuro (Passo 1), e o `GenericAgentExecutor` continuará de onde parou usando a `conversationHistory` persistida. O ciclo (Passos 4-10) repete até que o Job seja `COMPLETED` ou `FAILED`.

## Fluxos Alternativos e Exceções:
*   **FA-002.1: Falha na Execução da `Tool`:**
    *   Se uma `Tool` chamada pelo LLM falhar, o erro é capturado, adicionado à `conversationHistory`.
    *   O LLM é informado do erro na próxima iteração (Passo 5) e deve decidir como proceder (re-tentar, usar outra `Tool`, falhar o Job).
*   **FA-002.2: Falha na Comunicação com LLM:**
    *   Se a chamada ao LLM falhar (ex: erro de API), o `GenericAgentExecutor` marca o Job como `FAILED` (ou aciona lógica de retentativa do Job se for um erro transitório de rede).
*   **FA-002.3: Job Não Encontrado ou Estado Inválido:**
    *   Se o `WorkerService` não conseguir obter um Job válido, ele aguarda e tenta novamente.
*   **FA-002.4: Falha ao Salvar Job Atualizado:**
    *   Se o `WorkerService` falhar ao salvar o Job após o processamento pelo `GenericAgentExecutor`, o sistema deve registrar o erro. O Job pode ser pego novamente e reprocessado, o que deve ser idempotente se possível, ou pode levar a inconsistências se não tratado com cuidado (ex: usando versionamento ou transações otimistas).

## Pós-condições:
*   **Sucesso (`COMPLETED`):**
    *   O `Job` está no estado `COMPLETED`.
    *   O `job.result` contém o resultado final da execução.
    *   `job.data.agentState` contém o histórico final da atividade.
*   **Falha (`FAILED`):**
    *   O `Job` está no estado `FAILED`.
    *   Uma mensagem de erro é registrada no Job.
*   **Continuação (`WAITING`/`DELAYED`):**
    *   O `Job` está de volta na fila no estado `WAITING` ou `DELAYED`.
    *   `job.data.agentState` está atualizado com o progresso da última iteração.

## Requisitos Especiais:
*   O `GenericAgentExecutor` deve ser capaz de gerenciar contextos de conversas longas (sumarização).
*   As `Tools` devem ser idempotentes sempre que possível.
*   A persistência do `job.data.agentState` a cada ciclo de `CONTINUE_PROCESSING` é crucial.
