## Funcionalidades Principais:

1.  **Configuração de Provedores de LLM:**
    *   O sistema permite que usuários configurem diferentes provedores de IA (ex: OpenAI, DeepSeek, Anthropic) através de um `CreateLLMProviderConfigCommand`.
    *   A configuração (`LLMProviderConfig` entidade) inclui detalhes como chaves de API (gerenciadas de forma segura via variáveis de ambiente), endpoints e outros parâmetros específicos do provedor.
    *   A UI (componente `llm-config-form.tsx`) suporta este processo de configuração.

2.  **Seleção de Modelo por Instância de Agente:**
    *   Um `AgentPersonaTemplate` define o perfil base do Agente.
    *   Uma instância de `Agent` (criada via um `CreateAgentCommand`) vincula um `AgentPersonaTemplate` a uma `LLMProviderConfig` específica e a parâmetros como `temperature`.
    *   Isso permite que diferentes instâncias de Agentes (mesmo que baseadas no mesmo template de Persona) utilizem diferentes LLMs ou configurações.

3.  **IA como Motor de Raciocínio e Planejamento para Agentes:**
    *   O `GenericAgentExecutor`, ao processar um Job para um Agente, utiliza a IA configurada para:
        *   **Interpretar Solicitações:** Entender as necessidades e objetivos do Job (vindas do `job.payload.goal`).
        *   **Planejar Ações:** Decompor tarefas complexas em uma sequência de chamadas de `Tools`.
        *   **Tomar Decisões:** Escolher a próxima `Tool` a ser utilizada com base na `conversationHistory` (parte do `ActivityContext` em `job.data.agentState`) e no objetivo do Job.
        *   **Gerar Conteúdo:** Criar texto, código, documentação, etc., como resultado da execução de `Tools` ou como resposta final.
        *   **Analisar Informações:** Processar e extrair insights de dados, código ou logs retornados pelas `Tools`.
        *   **Auto-Validação:** Avaliar os resultados de suas próprias ações contra os `validationCriteria` (parte do `ActivityContext`).

4.  **Interação Contextualizada:**
    *   As interações com o LLM via `GenericAgentExecutor` são altamente contextualizadas:
        *   **Prompt de Sistema da Persona:** O `GenericAgentExecutor` constrói um prompt de sistema usando o `role`, `goal`, e `backstory` do `AgentPersonaTemplate`.
        *   **`conversationHistory` (do `ActivityContext` em `Job.data.agentState`):** Contém o histórico completo de interações anteriores (usuário, assistente, tool_calls, tool_results) dentro do mesmo Job. O `GenericAgentExecutor` também implementa sumarização de histórico para conversas longas.
        *   **`AgentInternalState` (Parcialmente):** Embora não seja injetado automaticamente em cada prompt pelo `GenericAgentExecutor`, o Agente (via LLM) pode ser instruído a usar a `MemoryTool` para consultar seu `AgentInternalState` ou memória de longo prazo e usar essa informação em seu raciocínio.
        *   **Descrição das `Tools` Disponíveis:** O `GenericAgentExecutor` fornece ao LLM (via `ai-sdk`) os nomes, descrições e schemas de parâmetros das `Tools` habilitadas para a Persona.

5.  **Orquestração de `Tools` pela IA:**
    *   A IA, através do `GenericAgentExecutor`, pode decidir solicitar a execução de uma ou mais `Tools` disponíveis.
    *   O `GenericAgentExecutor` e o `ai-sdk` interpretam a intenção da IA, executam a `Tool` solicitada (via `ToolRegistry`) com os argumentos fornecidos pela IA, e o resultado da `Tool` é adicionado à `conversationHistory` para processamento subsequente pela IA.

6.  **Abstração da Comunicação (AI SDK):**
    *   O sistema utiliza o `ai-sdk` (ex: `generateObject`, `generateText`) para abstrair as particularidades das APIs dos diferentes provedores de LLM.
    *   Isso simplifica a lógica do `GenericAgentExecutor`.

7.  **Segurança:**
    *   Chaves de API são gerenciadas via variáveis de ambiente e não são expostas diretamente na configuração persistida.

A flexibilidade na escolha e configuração de LLMs, combinada com a capacidade dos Agentes de interagir contextualmente e orquestrar `Tools` através do `GenericAgentExecutor`, é o que permite ao Project Wiz realizar uma vasta gama de tarefas de desenvolvimento de forma inteligente.
