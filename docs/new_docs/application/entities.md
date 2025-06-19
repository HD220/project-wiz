# Glossário de Entidades Conceituais Principais do Project Wiz

## Introdução

Este documento fornece uma visão geral de alto nível das principais entidades conceituais que compõem o sistema Project Wiz. Ele serve como um glossário rápido para entender os blocos de construção fundamentais.

Para detalhes arquiteturais aprofundados sobre como estas entidades (especialmente `AIAgent` e `Job`) são implementadas como entidades ricas em comportamento, suas interações, e como elas se encaixam na Clean Architecture, consulte o documento de arquitetura alvo: **[Proposta de Arquitetura Alvo](../target_architecture.md)**.

As definições abaixo focam no propósito e nos atributos chave mais relevantes para um entendimento conceitual.

## Entidades e Conceitos

-   **`Project` (Projeto):**
    -   **Propósito:** Representa um projeto de desenvolvimento de software gerenciado dentro da aplicação Project Wiz. Serve como um contêiner para todo o trabalho relacionado, configurações, código fonte e colaborações.
    -   **Atributos Chave (Conceituais):**
        *   `id`: Identificador único do projeto.
        *   `name`: Nome descritivo do projeto.
        *   `description`: Breve descrição dos objetivos e escopo do projeto.
        *   `caminho_working_directory`: Localização no sistema de arquivos onde o código do projeto reside, usado pelos Agentes para operações de leitura/escrita e Git.
        *   (Outros atributos podem incluir repositórios Git associados, membros, etc.)

-   **`AIAgent` (AgenteIA / Configuração de Persona):**
    -   **Propósito:** Representa a configuração, o perfil e a "personalidade" de um agente de inteligência artificial (Persona). Esta configuração guia o comportamento de um Modelo de Linguagem Amplo (LLM) subjacente para executar tarefas e interagir de uma forma específica.
    -   **Atributos Chave (Configuração - `AIAgentProps`):**
        *   `id`: Identificador único da configuração do AgenteIA/Persona.
        *   `name`: Nome da Persona (ex: "Desenvolvedor Senior", "Analista QA").
        *   `roleDescription`: Descrição detalhada do papel, objetivos e "backstory", usada primariamente para compor o prompt de sistema do LLM.
        *   `modelId` / `provider`: Especificação do modelo LLM a ser usado (ex: "gpt-4", "claude-3").
        *   `availableTools`: Lista de `Tools` (ferramentas) que este AgenteIA está autorizado a usar.
    -   *Nota: A lógica de execução e o gerenciamento de estado do Agente residem em componentes como o `AIAgentExecutionService` e utilizam o `AgentInternalState`. Consulte `../target_architecture.md` para detalhes.*

-   **`Job` (Job / Tarefa):**
    -   **Propósito:** Representa uma unidade de trabalho específica a ser processada pelo sistema de filas e executada por um `AgenteIA`. Um `Job` é tipicamente criado por um `AgenteIA` em resposta a uma solicitação do usuário ou como parte da decomposição de uma tarefa maior.
    -   **Atributos Chave (Conceituais):**
        *   `id`: Identificador único do `Job`.
        *   `queueName`: Nome da fila à qual o `Job` pertence (geralmente a fila dedicada do `AgenteIA` responsável).
        *   `name`: Nome ou tipo do `Job` (ex: "gerarCodigo", "analisarArquivo", "executarTestes"), usado para rotear ao processador correto dentro do Agente.
        *   `data`: Payload do `Job`, contendo os dados específicos necessários para sua execução.
        *   `opts`: Opções de execução do `Job` (ex: tentativas máximas, configuração de delay/backoff, prioridade).
        *   `status`: O estado atual do `Job` no ciclo de vida (ex: `waiting`, `active`, `completed`, `failed`).
    -   *Nota: Para a definição detalhada da entidade `Job` rica em comportamento (com `JobProps` e métodos como `startProcessing`, `complete`, `fail`), seu ciclo de vida completo e como o `ActivityContext` (estado dinâmico da execução) é gerenciado dentro do campo `data`, consulte a seção "Entidades Chave: `Job` e `AIAgent`" no documento `../target_architecture.md`.*

-   **`Tool` (Ferramenta):**
    -   **Propósito:** Uma capacidade ou função específica, pré-desenvolvida no código fonte do Project Wiz, que um `AgenteIA` (através do LLM) pode ser instruído a utilizar para interagir com o ambiente (sistema de arquivos, terminal, Git, APIs externas) ou para realizar ações concretas.
    -   **Atributos Chave (Conceituais):**
        *   `name`: Nome identificador da `Tool` (ex: `readFileTool`, `gitCommitTool`).
        *   `description`: Descrição funcional da `Tool`, seus parâmetros e o que ela retorna (usada pelo LLM para entender como usá-la).
        *   `input_schema` / `output_schema` (Conceitual): Define a estrutura esperada para os dados de entrada e saída da `Tool`.
    -   *Nota: Para detalhes sobre o `IToolRegistry` e como as `Tools` são disponibilizadas e executadas, veja `../target_architecture.md`.*

-   **`User` (Usuário):**
    -   **Propósito:** Representa um usuário humano que interage com a aplicação Project Wiz, delega tarefas às `Personas` (AgentesIA) e recebe os resultados.
    -   **Atributos Chave (Conceituais):**
        *   `id`: Identificador único do usuário.
        *   `name`: Nome do usuário.
        *   (Outros atributos podem incluir informações de perfil, preferências, etc.)

-   **Fila Nomeada (Conceito e Configuração):**
    -   **Propósito:** O sistema de gerenciamento de `Jobs` é baseado no conceito de múltiplas filas nomeadas, inspirado pelo BullMQ e implementado com persistência em SQLite. Cada `AgenteIA` opera sobre sua própria fila nomeada dedicada.
    -   **Função:**
        *   Cada `Job` é associado a uma `queueName` específica, que normalmente corresponde à fila do `AgenteIA` que o criou e será responsável por sua execução.
        *   O sistema garante o processamento confiável de `Jobs` dentro de cada fila, incluindo gerenciamento de status, dependências (entre `Jobs` na mesma fila, como `Sub-Jobs`), prioridades, e retentativas.
        *   A configuração de uma fila (ex: `defaultJobOptions` como número de tentativas, estratégia de backoff) é associada à `queueName` (conceito de `QueueDefinition`).
    -   *Nota: Detalhes sobre `IQueueRepository`, `QueueClient`, e o sistema de processamento assíncrono estão em `../target_architecture.md`.*

-   **`Worker` (Executor Conceitual):**
    -   **Propósito:** Um componente da infraestrutura que representa o loop de processamento de um `AgenteIA`. Ele monitora a Fila Nomeada específica do `AgenteIA` e executa os `Jobs` nela contidos, utilizando a função de processamento (`jobProcessor`) apropriada (fornecida pelo `AIAgentExecutionService`).
    -   *Nota: Para a descrição detalhada do `Worker` genérico e do `AgentLifecycleService` que gerencia os Workers, consulte `../target_architecture.md`.*

*Nota sobre `ActivityContext` e `AgentInternalState` da documentação anterior:*
Os conceitos detalhados de `ActivityContext` (como uma entidade separada com múltiplos campos para histórico de mensagens, notas, etc.) e `AgentInternalState` (com campos como `currentProjectId`, `generalNotes`, `promisesMade`) foram refinados na nova arquitetura.
O estado dinâmico de um `Job` em execução (anteriormente `ActivityContext`) é agora primariamente contido no campo `data` da entidade `Job` rica.
A memória de longo prazo e o conhecimento contextual do Agente (anteriormente `AgentInternalState`) são gerenciados pela `Persona Core Logic` (`AIAgentExecutionService`) e podem ser persistidos de forma associada à configuração do `AIAgent`, distinguindo entre conhecimento geral e específico por projeto. Consulte `../target_architecture.md` para a abordagem atualizada.*
