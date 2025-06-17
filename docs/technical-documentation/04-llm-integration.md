# Guia: Integração com Modelos de Linguagem Grande (LLMs)

A inteligência dos Agentes (Personas) no Project Wiz é primariamente alimentada por Modelos de Linguagem Grande (LLMs). Este documento descreve como o sistema se integra com LLMs e como os desenvolvedores podem configurar e potencialmente estender essas integrações.

## 1. Papel dos LLMs no Project Wiz

Os LLMs são componentes fundamentais que fornecem aos Agentes as seguintes capacidades:

*   **Compreensão de Linguagem Natural:** Interpretar as descrições dos Jobs, documentos e outras fontes de texto.
*   **Raciocínio e Planejamento:** Decompor tarefas complexas em passos menores, decidir quais Tools utilizar e em que ordem.
*   **Geração de Conteúdo:** Produzir código, documentação, relatórios, respostas em chat, etc.
*   **Tomada de Decisão (Assistida):** Com base nas informações e no seu "raciocínio", o LLM decide qual Tool invocar para realizar uma ação concreta.

O Project Wiz utiliza LLMs como o "cérebro" de processamento de linguagem para cada Agente, enquanto as [Tools](./03-developing-tools.md) fornecem as "mãos e pernas" para interagir com o mundo.

## 2. SDKs e Bibliotecas Utilizadas

Conforme identificado no `package.json` do projeto e mencionado no [README principal](../../README.md#tecnologias-utilizadas), o Project Wiz utiliza bibliotecas modernas para interagir com LLMs. As principais incluem:

*   **`ai` (Vercel AI SDK):** Uma biblioteca popular e flexível para construir aplicações de IA, fornecendo helpers para streaming, uso de tools (funções), e integração com diversos provedores de modelos. É provável que esta seja a principal interface para as chamadas aos LLMs.
*   **`@ai-sdk/openai`:** Um adaptador específico dentro do ecossistema da Vercel AI SDK para interagir com os modelos da OpenAI (GPT-3.5, GPT-4, etc.).
*   **`@ai-sdk/deepseek`:** Um adaptador para os modelos da DeepSeek, conhecidos por suas capacidades de codificação.
*   *(Outros adaptadores podem ser adicionados no futuro para suportar mais provedores de LLM).*

Essas bibliotecas abstraem muitas das complexidades da comunicação direta com as APIs dos LLMs.

## 3. Configuração de Provedores de LLM

O Project Wiz permitirá a configuração de diferentes provedores e modelos de LLM para serem utilizados pelos Agentes. Essa configuração provavelmente ocorrerá em alguns níveis:

*   **Configuração Global da Aplicação:**
    *   Definição das chaves de API para os provedores de LLM que você deseja usar (ex: OpenAI API Key, DeepSeek API Key). Essas chaves são sensíveis e devem ser gerenciadas de forma segura.
    *   Possivelmente, seleção de modelos padrão para diferentes tipos de tarefas ou Agentes.
*   **Configuração por Persona/Agente:**
    *   Como mencionado no [Guia de Configuração de Personas](../user-guide/05-personas-agents.md#3-configurando-uma-persona), poderá ser possível especificar qual LLM (e modelo específico) uma determinada Persona deve usar.
    *   Isso permite, por exemplo, que uma Persona especializada em codificação use um modelo otimizado para código, enquanto uma Persona para análise de texto use um modelo mais generalista.
    *   Ajustes de parâmetros como "temperatura" também podem ser específicos por Persona.

*(A interface exata para essas configurações será detalhada conforme a funcionalidade é implementada).*

## 4. Fluxo de Interação com LLM dentro de um Agente/Task

Quando um Agente está processando um Job através de uma Task (conforme descrito em [Arquitetura do Sistema de Processamento Assíncrono](./01-architecture.md#43-agente) e [Estrutura dos Agentes](./02-agent-framework.md)):

1.  **Construção do Prompt:** A Task, com base no Job atual, no histórico da conversa, nas anotações e possivelmente em informações da `MemoryTool` (via RAG), constrói um prompt para o LLM.
2.  **Definição das Tools Disponíveis:** A Task informa ao LLM (através da AI SDK) quais Tools o Agente pode utilizar naquele momento. Essas Tools são descritas de forma que o LLM possa entender seu propósito e parâmetros.
3.  **Chamada ao LLM:** A AI SDK envia o prompt e as definições das Tools para o LLM configurado para o Agente.
4.  **Resposta do LLM:** O LLM pode responder de algumas formas:
    *   **Texto Direto:** Uma resposta em linguagem natural.
    *   **Solicitação de Uso de Tool:** O LLM indica que deseja executar uma ou mais Tools, fornecendo o nome da Tool e os parâmetros.
5.  **Execução da Tool (se solicitada):** Se o LLM solicita uma Tool, o framework do Agente no Project Wiz intercepta essa solicitação, executa a Tool correspondente com os parâmetros fornecidos, e obtém o resultado.
6.  **Retorno do Resultado da Tool ao LLM:** O resultado da execução da Tool é enviado de volta ao LLM como parte da conversa.
7.  **Ciclo de Continuação:** O LLM processa o resultado da Tool e pode continuar a conversa, gerar mais texto, ou solicitar outra Tool. Esse ciclo pode se repetir várias vezes até que o objetivo da Task seja alcançado.
8.  **Resposta Final da Task:** A Task determina quando o Job (ou um passo significativo dele) está concluído e retorna o resultado para o Worker.

## 5. Considerações para Desenvolvedores

*   **Prompt Engineering:** A qualidade dos prompts construídos pelas Tasks é crucial para o desempenho dos Agentes.
*   **Seleção de Modelo:** Diferentes modelos de LLM têm diferentes pontos fortes, fracos, custos e limites de taxa. A escolha do modelo certo para cada Agente ou tipo de Job pode ser importante.
*   **Gerenciamento de Contexto:** LLMs têm janelas de contexto limitadas. As Tasks precisam gerenciar eficientemente o histórico da conversa e as informações fornecidas no prompt. Consulte [Gerenciamento de Histórico de Atividades (Activity History)](./01-architecture.md#gerenciamento-de-hist-rico-de-atividades-activity-history)) para mais detalhes.
*   **Custos de API:** O uso de APIs de LLM pode incorrer em custos. O sistema deve ser projetado com isso em mente, e os usuários devem estar cientes.

## 6. Tipos de Prompts Utilizados no Sistema

Os prompts são instruções e contextos injetados no Large Language Model (LLM) em cada etapa lógica do ciclo do Agente Autônomo. Eles guiam o raciocínio do LLM e suas decisões sobre qual ação tomar, garantindo que ele opere de forma autônoma e focada na atividade mais relevante no momento. As informações de contexto passadas para cada prompt são dinâmicas, garantindo que o LLM tenha os dados mais relevantes para sua decisão atual. A Persona do Agente e as Regras Gerais do Sistema/Formato de Resposta são sempre incluídas antes dos prompts específicos de cada etapa.

Aqui está um índice dos prompts utilizados (localizados em `docs/technical-documentation/llm-prompts/`):

- [Prompt da Persona](../llm-prompts/prompt-persona.md)
- [Prompt de Contexto e Comportamento do Sistema](../llm-prompts/prompt-contexto-comportamento.md)
- [Prompt para "Obtém Próxima Atividade"](../llm-prompts/prompt-obtem-proxima-atividade.md)
- [Prompt para "É uma Atividade Decomposta?"](../llm-prompts/prompt-atividade-decomposta.md)
- [Prompt para "Pega Próxima Subtask da"](../llm-prompts/prompt-pega-proxima-subtask.md)
- [Prompt para "É necessário contexto adicional?"](../llm-prompts/prompt-contexto-adicional.md)
- [Prompt para "Coleta de Contexto"](../llm-prompts/prompt-coleta-contexto.md)
- [Prompt para "Analise Intenção"](../llm-prompts/prompt-analise-intencao.md)
- [Prompt para "Transformar em itens acionáveis (Sub Atividade ou Atividades)"](../llm-prompts/prompt-transformar-itens-acionaveis.md)
- [Prompt para "Processa Próxima SubAtividade Pendente"](../llm-prompts/prompt-processa-proxima-subatividade.md)
- [Prompt para "A Subtask Atual precisa ser dividida em subtasks?"](../llm-prompts/prompt-subtask-precisa-dividir.md)
- [Prompt para "Geração da Saída"](../llm-prompts/prompt-geracao-saida.md)
- [Prompt para "Atualização de Status/Contexto"](../llm-prompts/prompt-atualizacao-status-contexto.md)

## 7. Conclusão

A integração com LLMs é o que dá aos Agentes do Project Wiz sua capacidade de "pensar" e interagir de forma inteligente. Utilizando bibliotecas modernas como a Vercel AI SDK, o Project Wiz visa fornecer uma plataforma flexível e poderosa para construir uma verdadeira fábrica de software autônoma.

Este documento fornece uma visão geral. Detalhes específicos sobre como estender com novos provedores de LLM ou modificar profundamente o fluxo de interação serão adicionados conforme o sistema evolui.
