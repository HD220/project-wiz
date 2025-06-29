# Core Concept: Personas Personalizadas e Agentes IA

No Project Wiz, você interage com um **Assistente Pessoal IA** para iniciar tarefas. Este assistente pode facilitar a criação dinâmica de **Agentes IA Especializados** para lidar com suas solicitações. Além disso, você tem o poder de **customizar, salvar essas configurações como "Personas Personalizadas" (ou Agentes Configurados), e até mesmo criar as suas do zero**, permitindo um controle refinado sobre sua equipe de IA.

Este guia explica como os Agentes são gerados e como você pode gerenciá-los.

## O Assistente Pessoal IA e os Agentes IA Especializados

*   **Assistente Pessoal IA:**
    *   Seu ponto de partida no Project Wiz. Você descreve suas necessidades a ele.
    *   Ele interpreta sua solicitação e pode:
        *   Sugerir o uso de uma de suas Personas Personalizadas já existentes.
        *   Propor a geração de um novo Agente IA Especializado, cujas características são definidas dinamicamente por um LLM com base na tarefa.

*   **Agente IA Especializado (Instância `Agent`):**
    *   Seja originado de uma Persona Personalizada ou gerado dinamicamente, é este Agente (uma instância da entidade `Agent`) que efetivamente processa as tarefas delegadas.
    *   Ele utiliza sua configuração específica (papel, objetivos, capacidades, LLM) para realizar o trabalho.

**Principais Funções dos Agentes IA Especializados:**
*   Executar **tarefas delegadas** de forma autônoma ou semi-autônoma.
*   Utilizar um conjunto de **capacidades e conhecimentos** para interagir com o sistema.
*   Colaborar no ciclo de vida do desenvolvimento de software.

## Criação e Configuração de Agentes IA Especializados

Existem duas formas principais de ter Agentes IA prontos para o trabalho:

### 1. Geração Dinâmica Assistida (via Assistente Pessoal)
Este é frequentemente o fluxo inicial para novas ou tarefas únicas:
*   **Sua Solicitação:** Você descreve a tarefa ao Assistente Pessoal (ex: "Preciso de um script Python para analisar dados de um CSV e gerar um gráfico").
*   **Análise e Proposta:** O Assistente Pessoal, com auxílio de um LLM, analisa a necessidade e pode propor as características de um Agente IA ideal para a tarefa (papel, objetivo, capacidades necessárias, etc.).
*   **Geração e Uso Imediato:** Se você concordar, um Agente IA com essas características é configurado dinamicamente para realizar a tarefa.

### 2. Personas Personalizadas (Agentes Configurados pelo Usuário)
Você tem a flexibilidade de refinar, salvar e criar suas próprias configurações de Agentes reutilizáveis:

*   **Customizar um Agente Gerado:** Após o Assistente Pessoal propor ou gerar um Agente, você pode ter a opção de editar suas características antes ou depois da execução de uma tarefa.
*   **Salvar para Reutilização:** Se você gostar de uma configuração específica (seja ela originalmente gerada dinamicamente ou ajustada por você), pode salvá-la como uma "Persona Personalizada". Isso permite que você (ou o Assistente Pessoal) a reutilize facilmente para tarefas futuras.
*   **Criar do Zero:** Você também pode ter a capacidade de definir suas Personas Personalizadas do zero, especificando todos os atributos chave:
    *   **Nome da Persona:** Um identificador para sua configuração (ex: "Meu Dev Python Padrão", "Revisor de Documentação Técnica").
    *   **Papel (Role):** A especialização principal (ex: `Developer`, `QA Tester`, `Technical Writer`).
    *   **Objetivo (Goal):** O objetivo geral que Agentes com esta configuração devem buscar.
    *   **Backstory/Contexto:** Informações de fundo para guiar o LLM.
    *   **Capacidades Necessárias:** O tipo de acesso ao sistema ou habilidades que o agente precisará (ex: capacidade de interagir com arquivos, executar comandos, ou pesquisar informações).
    *   **Configuração de LLM:** Associar um provedor de LLM, modelo e parâmetros (ex: temperatura).

Você geralmente gerenciará suas Personas Personalizadas em uma seção dedicada na interface do Project Wiz.

## Instanciando um Agente para uma Tarefa
Independentemente de ser uma Persona Personalizada ou uma configuração gerada dinamicamente, quando uma tarefa precisa ser executada, uma instância de `Agent` é utilizada. Esta instância combina o perfil da Persona (papel, objetivos, capacidades definidas) com a configuração do LLM.

## Estado e Aprendizado do Agente (Conceitos Avançados)
Mesmo que a *configuração* de uma Persona seja dinâmica ou personalizada, os Agentes em execução podem interagir com sistemas de memória:
*   **`AgentInternalState` (Estado Interno/Memória de Longo Prazo):** Permite aprendizado e continuidade entre tarefas para perfis de agentes ou papéis.
*   **`AgentJobState` (Estado do Job/Memória de Curto Prazo):** Contexto específico da tarefa atual.

## Interagindo com Agentes IA
*   **Via Assistente Pessoal:** Sua interface principal para delegar objetivos e tarefas de alto nível.
*   **Delegação de Tarefas:** O Assistente Pessoal (ou o sistema sob sua direção) direciona esses objetivos para Agentes IA especializados (sejam eles baseados em suas Personas Personalizadas ou gerados dinamicamente). Os agentes então internamente gerenciam suas próprias atividades e "jobs" para cumprir o objetivo.
*   *(Planejado)* **Chat Interativo Direto:** Possibilidade de interações diretas com os Agentes especializados durante a execução de suas atividades.

## Próximos Passos
*   **Gerenciando Projetos:** Entenda como os [Projetos](./projects.md) fornecem o contexto para o trabalho dos Agentes.
*   **Visão Geral da Interface:** Se ainda não o fez, familiarize-se com a [Interface do Usuário](../03-interface-overview.md) do Project Wiz.

Este guia será atualizado conforme as funcionalidades evoluem.
