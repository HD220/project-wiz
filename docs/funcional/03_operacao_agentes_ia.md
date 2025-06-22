# Operação de Agentes IA

Os Agentes de IA (configurados por `AgentPersonaTemplate` e instanciados como entidades `Agent`) no Project Wiz operam de forma autônoma para analisar solicitações, planejar e executar tarefas (representadas por entidades `Job`). O motor principal para esta operação é o `GenericAgentExecutor`.

## Ciclo de Operação e Capacidades:

1.  **Análise da Solicitação do Usuário:**
    *   Quando um usuário interage com um Agente (via chat), o `GenericAgentExecutor` utiliza o LLM configurado para o Agente para interpretar a necessidade e o objetivo do usuário.
    *   Esta análise considera o `AgentInternalState` da instância do Agente (se disponível e relevante) para contexto adicional.

2.  **Criação e Planejamento de Jobs:**
    *   Com base na análise, o Agente (via LLM e `GenericAgentExecutor`) decide se e como um ou mais Jobs devem ser criados.
    *   **Criação de Job Principal:** O Agente, utilizando a `TaskManagerTool` (ou `task.tool.ts`), formula um Job principal que encapsula o objetivo geral da solicitação do usuário, adicionando-o à sua própria fila nomeada (`queueName`, geralmente baseada no `role` da Persona).
    *   **Definição de "Pronto" (`validationCriteria`):** Antes de iniciar a execução detalhada, o Agente (via LLM) define critérios claros de validação (a "Definição de Pronto") para o Job principal. Estes são armazenados no `ActivityContext` do Job (em `Job.data.agentState`).
    *   **Planejamento Detalhado e Decomposição (Sub-Jobs):**
        *   Utilizando o LLM, o Agente pode decompor o Job principal em uma sequência de Sub-Jobs menores e mais gerenciáveis, usando a `TaskManagerTool` para criar esses novos Jobs com dependências.
        *   Cada Sub-Job é também uma entidade `Job` adicionada à fila do Agente, com `dependsOnJobIds` ou `parentJobId` definidos.
        *   Sub-Jobs também podem ter seus próprios `validationCriteria`.
    *   **Ponto de Verificação com Usuário:** O Agente pode ser instruído (via prompt do LLM) a apresentar seu plano de Jobs/Sub-Jobs e a "Definição de Pronto" ao usuário para aprovação antes de prosseguir. Esta interação ocorre via chat.
    *   *Nota sobre Padrões Avançados:* A capacidade de decompor tarefas, definir critérios de pronto e realizar auto-validação são primariamente estratégias operacionais conduzidas pela inteligência do LLM da Persona, utilizando as capacidades do sistema de Jobs e `Tools`.

3.  **Execução de Jobs e Sub-Jobs pelo `GenericAgentExecutor`:**
    *   Um `WorkerService` pega um `Job` da fila e o entrega ao `GenericAgentExecutor` configurado para o `role` do Agente.
    *   Para cada Job/Sub-Job, o `GenericAgentExecutor`:
        *   Carrega ou inicializa o `AgentJobState` (que contém `ActivityContext` e `conversationHistory`) de `Job.data.agentState`.
        *   Utiliza seu LLM para determinar os próximos passos ou ações com base na `conversationHistory`.
        *   Solicita a execução de `Tools` específicas (do `ToolRegistry`, ex: `FileSystemTool`, `TerminalTool`) conforme decidido pelo LLM.
        *   Atualiza a `conversationHistory` e `executionHistory` dentro do `AgentJobState` com resultados das `Tools` e respostas do LLM.
        *   Persiste o `AgentJobState` atualizado de volta em `Job.data.agentState`.
    *   **Operação em Ambiente Controlado:** Para tarefas de código, o Agente opera dentro da `working_directory` do projeto, utilizando a `TerminalTool` para executar comandos Git (ex: criar branch) e a `FileSystemTool` para manipular arquivos.
    *   **Capacidades do Executor:** O `GenericAgentExecutor` implementa funcionalidades como sumarização de histórico de conversas longas e replanejamento em caso de erros significativos.

4.  **Gerenciamento de Contexto (`ActivityContext` dentro de `AgentJobState`):**
    *   Cada Job ativo tem seu `AgentJobState` (armazenado em `Job.data.agentState`), que inclui o `ActivityContext`. O `ActivityContext` (um Value Object) armazena:
        *   `messageContent`, `sender`, `toolName`, `toolArgs` para a interação atual.
        *   `goalToPlan`, `plannedSteps` (se o LLM os gerar explicitamente).
        *   `activityNotes` (notas do agente sobre a tarefa).
        *   `validationCriteria` definidos para o Job.
        *   `validationResult` após a tentativa de conclusão.
        *   `activityHistory` (um VO `ActivityHistory` contendo VOs `ActivityHistoryEntry`): o histórico detalhado de interações com o LLM e `Tools` para aquele Job.
    *   Este contexto é usado para todas as interações subsequentes do LLM relacionadas ao mesmo Job.

5.  **Auto-Validação:**
    *   Ao final da execução de um Job ou Sub-Job, o Agente (via LLM no `GenericAgentExecutor`) realiza uma auto-validação, comparando o resultado obtido com os `validationCriteria` do `ActivityContext`.
    *   Se a validação falhar, o Agente pode tentar corrigir o trabalho (gerando novas etapas/tool calls), replanejar, ou, em último caso, marcar o Job como falho ou escalar para o usuário.

6.  **Atualização do `AgentInternalState` (Aprendizado):**
    *   Após a conclusão de Jobs, o Agente (via LLM) pode decidir usar a `MemoryTool` para promover informações relevantes, aprendizados, ou soluções bem-sucedidas do `ActivityContext` para seu `AgentInternalState` ou memória de longo prazo associada.
    *   Isso permite que o Agente melhore seu desempenho em tarefas futuras.

7.  **Comunicação e Colaboração (Intenção Futura/Avançada):**
    *   Agentes podem usar `Tools` de comunicação (atualmente implícito via chat) para:
        *   Enviar mensagens e atualizações para o usuário.
        *   (Futuro) Interagir com outros Agentes, solicitando informações ou delegando Sub-Jobs (exigiria `Tools` específicas).

8.  **Tratamento de Erros e Resiliência:**
    *   `GenericAgentExecutor` lida com erros de `Tools` e LLM, incluindo-os na `conversationHistory` para que o LLM possa adaptar o plano.
    *   O sistema de Jobs (`Job` entity e `WorkerService`) suporta retentativas para falhas de Job.
    *   Em caso de dificuldades persistentes, o Agente pode marcar o Job como `FAILED` ou o `GenericAgentExecutor` pode solicitar um replanejamento.
