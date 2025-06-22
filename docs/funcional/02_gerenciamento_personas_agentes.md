# Gerenciamento de Personas (Agentes IA)

Project Wiz permite a criação, configuração e gerenciamento de Personas, que são as configurações que definem o comportamento e as capacidades dos Agentes de IA autônomos.

## Funcionalidades Principais:

1.  **Criação e Definição de Personas:**
    *   Usuários podem criar novas Personas.
    *   Cada Persona é definida por atributos chave que direcionam o comportamento do Agente IA:
        *   **Nome:** Um identificador para a Persona (ex: "Desenvolvedor Frontend Júnior", "Arquiteto Backend Sênior").
        *   **Papel (Role):** A especialização principal da Persona (ex: "Developer", "QA Tester", "Technical Writer").
        *   **Objetivo (Goal):** O objetivo de alto nível que a Persona busca alcançar em suas tarefas.
        *   **Backstory/Contexto:** Informações de fundo, conhecimentos específicos, ou estilo de atuação desejado para a Persona. Estes elementos são usados para construir o prompt de sistema do LLM.
    *   A persistência dessas configurações de Persona é gerenciada pelo sistema.

2.  **Configuração Avançada de Personas:**
    *   **Seleção de Modelo LLM:** Usuários podem associar um modelo de LLM específico (dentre os configurados no sistema) a uma Persona.
    *   **Habilitação de Ferramentas (Tools):** Usuários podem definir quais `Tools` específicas uma Persona tem permissão para usar. Isso controla o escopo de suas capacidades de interação com o ambiente.

3.  **Listagem e Gerenciamento via UI:**
    *   A interface do usuário permite listar as Personas existentes.
    *   Funcionalidades para editar ou visualizar detalhes de Personas configuradas.

4.  **Estado Interno do Agente (`AgentInternalState`):**
    *   Cada Agente (instância de uma Persona em execução ou com histórico) mantém um `AgentInternalState`.
    *   Este estado é persistente e inclui:
        *   Conhecimento geral acumulado pela Persona ao longo do tempo.
        *   Conhecimento específico adquirido sobre os projetos em que trabalhou.
        *   Notas, aprendizados, e "promessas" (compromissos ou planos de longo prazo) feitas pelo Agente.
    *   O `AgentInternalState` é crucial para a continuidade, aprendizado e adaptação do Agente entre diferentes Jobs e sessões de trabalho.
    *   Adicionalmente, o sistema pode manter um `AgentRuntimeState` para informações transitórias ou de status sobre um agente enquanto ele está ativamente processando uma tarefa.

5.  **Múltiplos Agentes Atuando Concorrentemente (Worker Pool):**
    *   O sistema suporta múltiplos Agentes (Personas) operando em paralelo, cada um processando Jobs de sua respectiva fila.
    *   Um "Worker Pool" ou "Gerenciador de Agentes" conceitual gerencia o ciclo de vida e a concorrência dessas instâncias de Agentes ativos.

## Interação com o Usuário:
*   O usuário seleciona ou interage com uma Persona específica para delegar tarefas.
*   A Persona escolhida então opera autonomamente para cumprir a solicitação, utilizando sua configuração, `AgentInternalState`, e as `Tools` habilitadas.
