> **Nota sobre o Status:** Este documento apresenta uma pesquisa sobre estratégias de sumarização de contexto para Agentes IA de longa duração. As recomendações e a "Atualização de Implementação (Tarefa A004)" descrevem abordagens que foram consideradas ou prototipadas. Contudo, a estratégia final e a implementação detalhada para o gerenciamento de contexto no `GenericAgentExecutor` (que em si é um componente em análise) ainda estão sujeitas a revisão e definição final.

# Pesquisa: Estratégias de Sumarização de Contexto para Agentes de Longa Duração

## 1. Introdução

À medida que Agentes IA, particularmente aqueles que utilizariam um `GenericAgentExecutor` proposto para tarefas complexas, se engajam em interações extensas, o `conversationHistory` (parte de um `AgentJobState` conceitual) pode se tornar muito grande, excedendo os limites de token dos LLMs. Este documento explora estratégias para gerenciar e sumarizar `conversationHistory`.

## 2. Estratégias de Gerenciamento de Contexto Analisadas

### 2.1. Truncamento Simples / Janelamento
(Conteúdo original sobre Truncation/Windowing mantido, pois descreve técnicas gerais)
*   **Keep Last N Messages/Tokens:** ...
*   **Keep First N and Last M Messages/Tokens ("Fixed Window with Ends"):** ...

### 2.2. Sumarização Baseada em LLM
(Conteúdo original sobre LLM-Based Summarization mantido)
*   **Summarize Oldest Turns / Sliding Window Summary:** ...
*   **Rolling Summary:** ...

### 2.3. Recuperação Baseada em Embedding (Abordagem tipo RAG)
(Conteúdo original sobre Embedding-Based Retrieval mantido)
*   **Description:** ...
*   **Pros:** ...
*   **Cons:** ...

### 2.4. Abordagens Híbridas
(Conteúdo original sobre Hybrid Approaches mantido)
*   **Description:** ...
*   **Pros:** ...
*   **Cons:** ...

## 3. Recomendações Iniciais para um `GenericAgentExecutor` Conceitual

Para um agente hipotético "Fullstack Developer" que realizaria tarefas complexas, uma estratégia robusta seria essencial.

**Recomendação Faseada (Exploratória):**

1.  **Fase A (Implementação Exploratória Inicial): Sumarização Baseada em LLM das Turns Mais Antigas**
    *   **Estratégia Proposta:** Quando `conversationHistory` se aproximar de um limiar, sumarizar as N mensagens mais antigas (após prompts iniciais) usando um LLM.
    *   **Considerações de Implementação:**
        *   O `GenericAgentExecutor` poderia usar uma função auxiliar.
        *   Substituir o bloco antigo de mensagens por uma mensagem de resumo do sistema.
    *   **Prós:** Mais simples que RAG, retém algum contexto histórico.
    *   **Contras:** Custo/latência de chamadas LLM adicionais, risco de perda de informação.

2.  **Fase B (Médio Prazo/Avançado): Abordagem Híbrida - Janela Recente + RAG a partir de uma `MemoryTool`**
    *   **Estratégia Proposta:** Manter K mensagens recentes textualmente + M itens relevantes recuperados de uma `MemoryTool` com busca vetorial.
    *   **Considerações de Implementação:** Exigiria melhorias significativas na `MemoryTool` (pesquisa vetorial).

**Nota sobre a "Atualização de Implementação (Tarefa A004)" do Documento Original:**
A seção "Implementation Update (Task A004)" do documento original descrevia uma implementação da "Fase A" no `GenericAgentExecutor`. No contexto desta reclassificação para "Análise e Pesquisa", essa implementação deve ser entendida como um protótipo ou prova de conceito realizado durante a fase de pesquisa, e não necessariamente como a solução final ou atualmente integrada ao sistema principal (dado que o `GenericAgentExecutor` em si está em análise). Os detalhes dessa implementação exploratória são:
- Uso de constantes como `MAX_HISTORY_MESSAGES_BEFORE_SUMMARY` e `PRESERVE_INITIAL_MESSAGES_COUNT`.
- Sumarização de um bloco de mensagens antigas (`NUM_MESSAGES_TO_SUMMARIZE_CHUNK`) usando uma chamada LLM.
- Substituição do bloco original por uma mensagem de resumo do sistema.

Esta pesquisa visa fornecer uma base para decisões futuras sobre o gerenciamento de contexto.
