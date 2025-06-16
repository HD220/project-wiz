# Exemplos de Prompts para Agentes

Esta seção contém exemplos de arquivos de prompt que podem ser usados para instruir Modelos de Linguagem Grande (LLMs) sobre como realizar tarefas específicas no contexto dos Agentes do Project Wiz. Estes são mais "meta-prompts" ou templates de instruções do que prompts para uma tarefa de usuário final específica. Para entender melhor como os LLMs são integrados, consulte o [Guia de Integração com LLMs](../../technical-documentation/04-llm-integration.md).

Eles ilustram como os Agentes podem ser direcionados para analisar, decompor e preparar informações de tarefas.

## Arquivos de Exemplo

*   **[./analysis.md](./analysis.md):**
    *   **Propósito:** Um template de prompt que instrui um LLM a analisar uma descrição de tarefa fornecida e identificar ambiguidades, lacunas de informação ou pontos que requerem mais detalhes. O objetivo é que o LLM formule essas necessidades como perguntas ou pontos de esclarecimento, sem propor soluções.
    *   **Uso Potencial:** Poderia ser usado por um "Agente Analista" ou no início do processamento de um Job complexo para garantir que os requisitos estejam claros antes da execução.

*   **[./decomposition.md](./decomposition.md):**
    *   **Propósito:** Um template de prompt que instrui um LLM a decompor uma tarefa principal em subtarefas menores e mais gerenciáveis. A instrução enfatiza basear-se *estritamente* no conteúdo da descrição da tarefa original, sem adicionar inferências ou expandir o escopo.
    *   **Uso Potencial:** Útil para Agentes que precisam planejar a execução de um Job, quebrando-o em passos lógicos que podem ser executados sequencialmente ou em paralelo.

*   **[./preparation.md](./preparation.md):**
    *   **Propósito:** Um template de prompt que instrui um LLM a processar uma análise de lacunas (provavelmente o resultado do prompt `analysis.md`). As instruções incluem categorizar os pontos de esclarecimento, formatá-los para discussão com stakeholders (virtuais ou reais) e propor os próximos passos no processo de refinamento da tarefa.
    *   **Uso Potencial:** Segue a análise, ajudando um Agente a preparar o feedback para o usuário ou para outro Agente, facilitando o ciclo de refinamento de requisitos.

## Como Utilizar

Estes exemplos servem como:

*   **Inspiração:** Para desenvolvedores que estão criando novas habilidades para os Agentes.
*   **Referência:** Para entender os tipos de instruções detalhadas que podem ser fornecidas aos LLMs para controlar seu comportamento em tarefas específicas de processamento de informações.
*   **Base para Experimentação:** Podem ser adaptados e expandidos para diferentes tipos de Agentes ou fluxos de trabalho no Project Wiz.

A eficácia de um Agente de IA depende significativamente da qualidade e clareza dos prompts que o direcionam. Estes exemplos visam demonstrar abordagens para a construção desses prompts.
