# Componentes Conceituais do Backend

Este documento descreve os principais componentes conceituais do backend do Project Wiz, focando em suas responsabilidades primárias e funções no processo de desenvolvimento de software autônomo. Estas descrições são de alto nível e não mergulham em tecnologias de implementação específicas.

-   **Lógica Central da Persona (Agente Autônomo) / `Persona Core Logic`:**
    -   **Responsabilidade:** Esta é a lógica autônoma central que *utiliza* uma configuração de `Persona` para instruir um Modelo de Linguagem Amplo (LLM) e gerenciar a execução dos `Jobs` (Atividades) que o próprio Agente cria para si. É responsável por todo o ciclo de vida de um `Job`, desde a análise da solicitação do usuário, planejamento (incluindo a "Definição de Pronto" antecipada e a possível decomposição em `Sub-Jobs`), gerenciamento de uma `working-directory` (incluindo interações Git via `GitTools`), execução de `Tasks` via `Tools`, e auto-validação. Aplica estratégias de resolução de problemas (ex: "dividir para conquistar", reavaliação, pedir ajuda ao usuário como último recurso).
    -   **Funções Chave:**
        -   Interpreta solicitações do usuário (via LLM) e decide sobre a criação de `Jobs` e `Sub-Jobs`.
        -   Carrega e sintetiza sua memória de longo prazo (`AgentInternalState` geral e específico do projeto) com o contexto dinâmico do `Job` atual (`ActivityContext`, incluindo histórico conversacional).
        -   Interage com LLMs (via `LLM Integration Point`) usando o prompt de sistema da `Persona`, seus objetivos e `Tools` disponíveis para raciocinar, planejar (incluindo a criação de `Sub-Jobs` e suas dependências), definir `validationCriteria` (Definição de Pronto) para o `Job` principal e para `Sub-Jobs`.
        -   Gerencia uma `working-directory` para operações de arquivo e interações com `GitTools` (clone, checkout, commit, push, etc.).
        -   Seleciona e aciona `Tasks` apropriadas ou solicita diretamente a execução de `Tools` (como `readFileTool`, `writeFileTool`, `searchAndReplaceInFileTool`, `applyDiffTool`, `executeTerminalCommandTool`, `findFilesByNameTool`, `searchInFileContentTool`).
        -   Atualiza continuamente o `ActivityContext` com progresso, resultados de `Tools`, respostas do LLM, erros e logs.
        -   Promove aprendizados relevantes do `ActivityContext` para o `AgentInternalState` (distinguindo entre conhecimento geral e específico do projeto).
        -   Realiza auto-validação contra `validationCriteria` antes de marcar um `Job` (ou Sub-Job) como concluído.
        -   Determina a conclusão do `Job` (sucesso ou falha após retentativas/tratamento de erro).
        -   Pode se comunicar com outros Agentes ou com o usuário através de `Tools` específicas (ex: `SendMessageToAgentTool`).

-   **Sistema de Gerenciamento de Jobs/Atividades (Fila) / `Job/Activity Management System (Queue)`:**
    -   **Responsabilidade:** Gerencia o ciclo de vida de `Jobs` e `Sub-Jobs` com funcionalidades robustas inspiradas em sistemas como BullMQ, atuando como um intermediário central de tarefas.
    -   **Funções Chave:**
        -   Persiste definições de `Jobs` (incluindo dados de entrada, Agente/`Persona` criador, dependências, status, `parent_job_id`) usando SQLite.
        -   Lida com transições de status de `Jobs`.
        -   Gerencia dependências complexas entre `Jobs` e `Sub-Jobs`, assegurando a ordem correta de execução.
        -   Suporta mecanismos de retentativa configuráveis.
        -   Permite `Jobs` agendados ou atrasados.
        -   Emite eventos sobre mudanças de status, permitindo que componentes reativos respondam.
        -   Responde às solicitações dos Agentes (Workers), entregando o próximo `Job` elegível; os Agentes também podem usar `Tools` para interagir com `Jobs` na `Queue` (ex: para ajustar prioridades de sub-tasks).

-   **Worker & Worker Pool (Modelo de Concorrência de Agentes):**
    -   **Responsabilidade:** O "Worker Pool" representa a coleção de Agentes ativos e concorrentes. Cada "Worker" individual é efetivamente o principal loop de processamento assíncrono de um único Agente.
    -   **Funções Chave (Agente como Worker):**
        -   Solicita ativamente `Jobs` à `Queue` para processamento.
        -   Invoca sua `Persona Core Logic` para processar o `Job`.
        -   Gerencia o ciclo de vida do `Job` internamente (carregamento de contexto, interação com LLM, uso de `Tool`, validação, atualização de contexto).
        -   Reporta o status final do `Job` de volta para a `Queue`.
    -   **Funções Chave (Worker Pool):**
        -   Gerencia o conjunto de Agentes em execução concorrente.
        -   A vazão em nível de sistema é alcançada tendo múltiplos Agentes processando seus respectivos `Jobs` em paralelo, em vez de um único `Job` ser paralelizado internamente por múltiplos threads no sentido tradicional.

-   **Sistema de Execução de Tasks / `Task Execution System`:**
    -   **Responsabilidade:** Este não é um sistema para executar sequências de tarefas pré-codificadas, mas sim o mecanismo conceitual pelo qual a `Persona Core Logic` de um Agente formula e despacha objetivos específicos ou prompts focados (definidos como `Tasks`) para o LLM.
    -   **Funções Chave:**
        -   Permite que o Agente crie `Tasks` dinamicamente com base em seu raciocínio contínuo e nos requisitos do `Job`.
        -   Uma `Task` fornece ao LLM (conforme configurado pela `Persona`) um objetivo claro, contexto relevante (do `ActivityContext` e `AgentInternalState`) e acesso a `Tools`.
        -   A tentativa do LLM de cumprir a `Task` impulsiona o `Job` para frente.

-   **Framework/Registro de Ferramentas (Tools) / `Tool Framework/Registry`:**
    -   **Responsabilidade:** Fornece uma coleção de `Tools` pré-desenvolvidas e bem definidas (funções dentro do código fonte da aplicação) que são expostas ao LLM via um AI SDK, permitindo que o LLM (conforme direcionado pela `Persona`) escolha e solicite sua execução.
    -   **Funções Chave:**
        -   Torna as `Tools` descobríveis e utilizáveis pelo LLM, tipicamente fornecendo suas descrições, parâmetros (com tipos e obrigatoriedade) e formatos de saída esperados para o AI SDK.
        *   Cada `Tool` realiza uma ação específica e discreta (ex: `readFileTool`, `writeFileTool`, `executeTerminalCommandTool`, `gitCloneTool`, `gitCheckoutBranchTool`, `gitAddTool`, `gitCommitTool`, `gitCreateBranchTool`, `gitPushTool`, `searchAndReplaceInFileTool`, `applyDiffTool`, `findFilesByNameTool`, `searchInFileContentTool`, `SendMessageToAgentTool`, `PostToProjectChannelTool`).
        *   O framework garante que, quando um LLM solicita uma `Tool`, o código da aplicação correspondente seja executado de forma segura com os argumentos fornecidos, operando dentro da `working-directory` do `Job` quando aplicável.

-   **Subsistema de Gerenciamento de Estado / `State Management Subsystem`:**
    -   **Responsabilidade:** Lida com a persistência e recuperação robustas do `AgentInternalState` (a memória de longo prazo e conhecimento evolutivo do Agente) e do `ActivityContext` (o histórico conversacional dinâmico por `Job` e dados operacionais), primariamente usando SQLite.
    -   **Funções Chave:**
        -   Salva e carrega o `AgentInternalState` para cada Agente.
        -   Salva e carrega o `ActivityContext` (incluindo histórico de mensagens, passos planejados, critérios/resultados de validação e saídas parciais) associado a cada `Job`.
        -   Garante a integridade e disponibilidade dos dados para os Agentes quando eles pegam `Jobs` ou retomam operações.

-   **Ponto de Integração LLM / `LLM Integration Point`:**
    -   **Responsabilidade:** Fornece uma interface padronizada e gerenciada para a `Persona Core Logic` se comunicar com vários Modelos de Linguagem Amplos, abstraindo detalhes específicos do provedor.
    -   **Funções Chave:**
        -   Gerencia conexões e autenticação com diferentes provedores de LLM (ex: OpenAI, DeepSeek).
        -   Aplica configurações definidas pelo usuário (modelo específico, preferências de embedding, parâmetros como temperatura) às requisições ao LLM.
        -   Formata prompts usando o prompt de sistema da `Persona`, `AgentInternalState`, `ActivityContext` atual (incluindo histórico de mensagens) e descrições de `Tools` disponíveis.
        -   Gerencia o histórico conversacional para interações com LLM para manter o contexto dentro de um `Job`.
        -   Recebe respostas dos LLMs e as repassa de volta para o Agente.
        -   Lida com erros específicos de LLM e limites de taxa (rate limits), potencialmente com lógica de retentativa.
