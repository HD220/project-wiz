# Core Concept: Personas e Agentes IA

No Project Wiz, **Personas** são templates que definem as características e capacidades dos seus Agentes de Inteligência Artificial. Os **Agentes IA** são as instâncias executáveis, baseadas nessas Personas, que realizam o trabalho. Eles são como membros virtuais especializados da sua equipe de desenvolvimento.

Este guia explica o que são, como são definidos e como você pode utilizá-los.

## O que é uma Persona e um Agente IA?

*   **Persona (Template):**
    *   Um **template de Persona** (`AgentPersonaTemplate`) é um perfil que você cria para definir um tipo específico de Agente. Pense nisso como um "cargo" ou "função" na sua equipe virtual.
    *   Define a especialização, o comportamento esperado e as ferramentas que um Agente daquele tipo pode usar.

*   **Agente IA (Instância):**
    *   Um **Agente IA** (`Agent`) é uma instância concreta e executável criada a partir de um template de Persona.
    *   É o Agente IA que efetivamente processa os [Jobs (tarefas)](./jobs-and-automation.md), utilizando a configuração do template de Persona e uma configuração específica de LLM (Modelo de Linguagem Grande).

**Principais Funções dos Agentes IA:**
*   Executar **Jobs** de forma autônoma ou semi-autônoma.
*   Utilizar um conjunto de **Ferramentas (Tools)** para interagir com o sistema de arquivos, código-fonte, terminal, LLMs, etc.
*   Colaborar em diversas etapas do ciclo de vida do desenvolvimento de software.

Você geralmente gerenciará os templates de Persona em uma seção dedicada na interface do Project Wiz (ex: "Agentes (Personas)" ou "Biblioteca de Personas").

## Definindo um Template de Persona

Ao criar um novo template de Persona, você especificará atributos chave que moldam o comportamento e as capacidades dos Agentes baseados nele:

*   **Nome:** Um identificador claro e descritivo para o template (ex: "Desenvolvedor Frontend Júnior", "Revisor de Código Detalhista", "Gerador de Documentação Técnica").
*   **Papel (Role):** A especialização principal do Agente (ex: `Developer`, `QA Tester`, `Technical Writer`, `Project Manager`). Este papel pode ser usado para direcionar Jobs para Agentes apropriados.
*   **Objetivo (Goal):** O objetivo de alto nível que um Agente usando este template geralmente busca alcançar em seus trabalhos (ex: "Escrever código limpo e eficiente", "Garantir a qualidade do software através de testes rigorosos", "Produzir documentação clara e concisa").
*   **Backstory/Contexto:** Informações de fundo, personalidade ou contexto adicional. Isso ajuda a construir o "prompt de sistema" que guia o LLM, influenciando o estilo de comunicação e a abordagem do Agente às tarefas.
*   **Nomes das Ferramentas (`toolNames`):** Uma lista específica das ferramentas que Agentes baseados neste template têm permissão para usar. Por exemplo, um Agente focado em escrita pode não precisar da ferramenta de terminal.

## Criando uma Instância de Agente IA

Uma vez que você tenha templates de Persona definidos, o sistema (ou você, através da interface) pode criar instâncias de Agentes IA. Este processo geralmente envolve:

1.  **Selecionar um Template de Persona:** Escolher o `AgentPersonaTemplate` que você deseja usar.
2.  **Configurar o LLM:**
    *   Associar uma configuração de provedor de LLM (ex: OpenAI, DeepSeek).
    *   Definir parâmetros específicos para o LLM, como o modelo a ser usado (ex: GPT-4, Claude 3) e a "temperatura" (que controla a criatividade vs. determinismo das respostas).
3.  **Instanciação:** O sistema cria uma entidade `Agent` que combina o template de Persona com a configuração do LLM. É este `Agent` que será selecionado por um `Worker` (processo de trabalho) para executar Jobs.

## Estado e Aprendizado do Agente (Conceitos Avançados)

*   **`AgentInternalState` (Estado Interno):** O Project Wiz é projetado para que cada Agente (ou cada Persona, conceitualmente) possa ter um estado interno persistente. Este estado pode armazenar:
    *   Conhecimento geral acumulado ao longo do tempo.
    *   Conhecimento específico sobre os projetos em que trabalhou.
    *   Notas, aprendizados e "promessas" (compromissos ou entendimentos de longo prazo).
    *   Este estado é crucial para a continuidade, aprendizado e melhoria do desempenho do Agente ao longo do tempo.
*   **`AgentRuntimeState` (Estado de Execução):** Informações temporárias sobre o status de um Agente enquanto ele está ativamente processando uma tarefa.

## Interagindo com Agentes IA

A principal forma de interação é através da atribuição de **[Jobs (tarefas)](./jobs-and-automation.md)**.

*   **Atribuindo Jobs:** Você define uma tarefa e a designa para um papel (role) específico. Um Agente IA configurado para aquele papel e disponível irá pegar e processar o Job.
*   *(Planejado)* **Chat Interativo:** Interfaces futuras podem permitir conversas diretas com Agentes para:
    *   Fornecer instruções adicionais ou esclarecimentos.
    *   Receber atualizações de progresso ou resultados.
    *   Permitir que os Agentes solicitem feedback ou façam perguntas.

## Próximos Passos

*   **Jobs e Automação:** Aprenda como definir e delegar trabalho para seus Agentes em [Jobs e Automação](./jobs-and-automation.md).
*   **Gerenciando Projetos:** Entenda como os [Projetos](./projects.md) fornecem o contexto para o trabalho dos Agentes.
*   **Visão Geral da Interface:** Se ainda não o fez, familiarize-se com a [Interface do Usuário](../03-interface-overview.md).

Este guia será atualizado conforme as funcionalidades de gerenciamento de Personas e Agentes evoluem.
