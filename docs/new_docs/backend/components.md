# Componentes Conceituais do Backend

Este documento descreve os principais componentes conceituais do backend do Project Wiz, focando em suas responsabilidades primárias e funções no processo de desenvolvimento de software autônomo. Estas descrições são de alto nível e não mergulham em tecnologias de implementação específicas.

-   **Lógica Central da Persona (Agente Autônomo) / `Persona Core Logic`:**
    -   **Responsabilidade:** Esta é a lógica autônoma central que *utiliza* uma configuração de `Persona` para instruir um Modelo de Linguagem Amplo (LLM) e gerenciar a execução dos `Jobs` (Atividades) que o próprio Agente cria para si. É responsável por todo o ciclo de vida de um `Job`, desde a análise da solicitação do usuário, planejamento (incluindo a "Definição de Pronto" antecipada e a possível decomposição em `Sub-Jobs`), operações dentro da `working_directory` do `Project` (idealmente em um branch Git específico do `Job`, gerenciado via `GitTools`), execução de `Tasks` via `Tools`, e auto-validação. Aplica estratégias de resolução de problemas (ex: "dividir para conquistar", reavaliação, pedir ajuda ao usuário como último recurso).
    -   **Funções Chave:**
        -   Interpreta solicitações do usuário (via LLM) e decide sobre a criação de `Jobs` e `Sub-Jobs`.
        -   Carrega e sintetiza sua memória de longo prazo (`AgentInternalState` geral e específico do projeto) com o contexto dinâmico do `Job` atual (`ActivityContext`, incluindo histórico conversacional).
        -   Interage com LLMs (via `LLM Integration Point`) usando o prompt de sistema da `Persona`, seus objetivos e `Tools` disponíveis para raciocinar, planejar (incluindo a criação de `Sub-Jobs` e suas dependências), definir `validationCriteria` (Definição de Pronto) para o `Job` principal e para `Sub-Jobs`.
        -   Opera dentro da `working_directory` do `Project` associado ao `Job`, utilizando `GitTools` para criar/gerenciar branches específicos do `Job` para isolar modificações de código (ex: clone, checkout, commit, push).
        -   Seleciona e aciona `Tasks` apropriadas ou solicita diretamente a execução de `Tools` (como `readFileTool`, `writeFileTool`, `searchAndReplaceInFileTool`, `applyDiffTool`, `executeTerminalCommandTool`, `findFilesByNameTool`, `searchInFileContentTool`).
        -   Atualiza continuamente o `ActivityContext` com progresso, resultados de `Tools`, respostas do LLM, erros e logs.
        -   Promove aprendizados relevantes do `ActivityContext` para o `AgentInternalState` (distinguindo entre conhecimento geral e específico do projeto).
        -   Realiza auto-validação contra `validationCriteria` antes de marcar um `Job` (ou Sub-Job) como concluído.
        -   Determina a conclusão do `Job` (sucesso ou falha após retentativas/tratamento de erro).
        -   Pode se comunicar com outros Agentes ou com o usuário através de `Tools` específicas (ex: `SendMessageToAgentTool`).

-   **Sistema de Gerenciamento de Jobs/Atividades (Fila) / `Job/Activity Management System (QueueService)`:**
    -   **Responsabilidade:** Gerencia o ciclo de vida de `Jobs` e `Sub-Jobs` dentro de **múltiplas filas nomeadas**, com funcionalidades robustas inspiradas em sistemas como BullMQ. Atua como um intermediário central para todas as tarefas assíncronas.
    -   **Funções Chave:**
        -   A API do serviço (ex: métodos `addJob`, `processJob`) sempre inclui um parâmetro `queueName` para direcionar a operação à fila correta.
        -   Persiste definições de `Jobs` (incluindo `queue_name`, dados de entrada, Agente/`Persona` criador, dependências, status, `parent_job_id`) usando SQLite.
        -   Lida com transições de status de `Jobs`.
        -   Gerencia dependências complexas entre `Jobs` e `Sub-Jobs` dentro e entre filas (se necessário).
        -   Suporta mecanismos de retentativa configuráveis, potencialmente definidos por fila através de uma `QueueDefinition` (opções padrão de Job por fila).
        -   Permite `Jobs` agendados ou atrasados.
        -   Emite eventos sobre mudanças de status.
        -   Responde às solicitações dos Agentes (Workers), entregando o próximo `Job` elegível de uma `queueName` específica para a qual o Worker está registrado.

-   **Worker & Worker Pool (Modelo de Concorrência de Agentes / Processadores de Fila):**
    -   **Responsabilidade:** O "Worker Pool" (ou Gerenciador de Agentes) gerencia Agentes ativos e concorrentes. Cada "Worker" individual é efetivamente o loop de processamento assíncrono de um Agente, que se registra para processar `Jobs` de uma `queueName` e para `jobName`(s) específicos dentro daquela fila.
    -   **Funções Chave (Agente como Worker):**
        -   Registra-se no `QueueService` para processar uma combinação específica de `queueName` e `jobName`, fornecendo uma função de processamento (sua `Persona Core Logic` adaptada para o Job).
        -   Solicita ativamente `Jobs` (da `queueName` e `jobName` para os quais está registrado) à `Queue` para processamento.
        -   Invoca sua `Persona Core Logic` para processar o `Job` recebido.
        -   Reporta o status final do `Job` de volta para a `QueueService`.
    -   **Funções Chave (Worker Pool / Gerenciador de Agentes):**
        -   Gerencia o ciclo de vida das instâncias de Agentes (que atuam como Workers).
        -   Assegura que haja Workers escutando nas filas configuradas conforme a demanda ou configuração do sistema.
        -   A concorrência é alcançada por múltiplos Agentes/Workers processando Jobs de suas respectivas filas (ou da mesma fila, se a concorrência na função `process` for > 1, embora inicialmente seja 1 por Agente).

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
        *   O framework garante que, quando um LLM solicita uma `Tool`, o código da aplicação correspondente seja executado de forma segura com os argumentos fornecidos, operando dentro da `working_directory` do `Project` (idealmente em um branch específico do `Job`) quando aplicável.

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
