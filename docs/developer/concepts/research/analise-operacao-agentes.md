> **Nota sobre o Status:** Este documento descreve uma análise e proposta de design para a operação interna de Agentes IA no Project Wiz. Os conceitos aqui apresentados, como o funcionamento detalhado do `GenericAgentExecutor`, `ActivityContext`, `AgentInternalState`, e o uso específico de `Tools` pelos agentes, representam áreas de pesquisa ativa e podem não refletir o estado atual ou final da implementação. O único subsistema relacionado que está definido e em implementação é o de Filas/Workers, que será utilizado pela futura arquitetura de execução de agentes.

# Análise: Operação de Agentes IA (Proposta de Design)

Propõe-se que os Agentes de IA (configurados por especificações de persona e instanciados como entidades `Agent`) no Project Wiz operem de forma autônoma para analisar solicitações, planejar e executar tarefas (representadas por entidades `Job`). Um motor principal proposto para esta operação é o `GenericAgentExecutor`.

Esta proposta de design para a operação de agentes segue a decisão arquitetural chave (anteriormente ADR 007) de que um componente central do agente (aqui chamado `GenericAgentExecutor`) é o principal responsável por orquestrar o processamento de um Job individual. Isso significa que o `WorkerService` tem um papel mais simples de buscar Jobs da fila e delegá-los, enquanto a lógica de raciocínio, planejamento, execução de capacidades (anteriormente chamadas de "Tools") e gerenciamento do ciclo de vida da tarefa residem primariamente no agente.

## Ciclo de Operação e Capacidades Propostas:

1.  **Análise da Solicitação do Usuário:**
    - Quando um usuário interage com um Agente (via chat), o `GenericAgentExecutor` utilizaria o LLM configurado para o Agente para interpretar a necessidade e o objetivo do usuário.
    - Esta análise poderia considerar o `AgentInternalState` da instância do Agente (se disponível e relevante) para contexto adicional.

2.  **Criação e Planejamento de Jobs:**
    - Com base na análise, o Agente (via LLM e `GenericAgentExecutor`) decidiria se e como um ou mais Jobs deveriam ser criados.
    - **Criação de Job Principal:** O Agente, utilizando uma `TaskManagerTool` (ou similar), formularia um Job principal que encapsula o objetivo geral da solicitação do usuário, adicionando-o à sua própria fila nomeada.
    - **Definição de "Pronto" (`validationCriteria`):** Antes de iniciar a execução detalhada, o Agente (via LLM) definiria critérios claros de validação para o Job principal, que seriam armazenados no `ActivityContext` do Job.
    - **Planejamento Detalhado e Decomposição (Sub-Jobs):**
      - Utilizando o LLM, o Agente poderia decompor o Job principal em uma sequência de Sub-Jobs menores, usando a `TaskManagerTool` para criar esses novos Jobs com dependências.
      - Sub-Jobs também poderiam ter seus próprios `validationCriteria`.
    - **Ponto de Verificação com Usuário:** O Agente poderia ser instruído a apresentar seu plano de Jobs/Sub-Jobs e a "Definição de Pronto" ao usuário para aprovação.
    - _Nota sobre Padrões Avançados:_ A capacidade de decompor tarefas, definir critérios de pronto e realizar auto-validação seriam primariamente estratégias operacionais conduzidas pela inteligência do LLM, utilizando as capacidades do sistema de Jobs e `Tools`.

3.  **Execução de Jobs e Sub-Jobs (Proposta para `GenericAgentExecutor`):**
    - Um `WorkerService` (existente e em implementação) pegaria um `Job` da fila e o entregaria ao `GenericAgentExecutor` (componente em análise).
    - Para cada Job/Sub-Job, o `GenericAgentExecutor` poderia:
      - Carregar ou inicializar o `AgentJobState` (contendo `ActivityContext` e `conversationHistory`).
      - Utilizar seu LLM para determinar os próximos passos ou ações.
      - Solicitar a execução de `Tools` específicas (de um `ToolRegistry`) conforme decidido pelo LLM.
      - Atualizar a `conversationHistory` e `executionHistory` dentro do `AgentJobState`.
      - Persistir o `AgentJobState` atualizado.
    - **Operação em Ambiente Controlado:** Para tarefas de código, o Agente operaria dentro da `working_directory` do projeto.
    - **Capacidades do Executor (Propostas):** Sumarização de histórico de conversas longas e replanejamento em caso de erros.

4.  **Gerenciamento de Contexto (Proposta para `ActivityContext`):**
    - Cada Job ativo teria seu `AgentJobState`, incluindo o `ActivityContext`. O `ActivityContext` armazenaria:
      - Detalhes da interação atual (`messageContent`, `sender`, `toolName`, `toolArgs`).
      - Planejamento (`goalToPlan`, `plannedSteps`).
      - Notas (`activityNotes`).
      - Critérios de validação (`validationCriteria`, `validationResult`).
      - Histórico detalhado (`activityHistory`).
    - Este contexto seria usado para interações subsequentes do LLM para o mesmo Job.

5.  **Auto-Validação (Proposta):**
    - Ao final da execução, o Agente (via LLM no `GenericAgentExecutor`) realizaria uma auto-validação contra os `validationCriteria`.
    - Em caso de falha, o Agente poderia tentar corrigir, replanejar, ou escalar.

6.  **Atualização do `AgentInternalState` (Conceito de Aprendizado):**
    - Após a conclusão de Jobs, o Agente (via LLM) poderia usar uma `MemoryTool` para promover informações relevantes do `ActivityContext` para seu `AgentInternalState`.
    - Isso permitiria ao Agente melhorar seu desempenho em tarefas futuras.

7.  **Comunicação e Colaboração (Ideias Futuras):**
    - Agentes poderiam usar `Tools` de comunicação para interagir com o usuário ou outros Agentes.

8.  **Tratamento de Erros e Resiliência (Proposta):**
    - O `GenericAgentExecutor` lidaria com erros de `Tools` e LLM.
    - O sistema de Jobs (existente) suporta retentativas.
    - Em caso de dificuldades, o Agente poderia marcar o Job como `FAILED` ou o `GenericAgentExecutor` solicitar replanejamento.
