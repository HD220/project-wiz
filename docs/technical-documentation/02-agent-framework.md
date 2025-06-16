# Estrutura e Funcionamento dos Agentes (Personas)

Este documento detalha o conceito de Agente (frequentemente referido como Persona na interface do usuário) no Project Wiz. Explicaremos como os Agentes operam, interagem com tarefas (Jobs), gerenciam informações e utilizam suas ferramentas (Tools) para executar o trabalho de automação.

## 1. Conceito de Agente e Persona

No Project Wiz, o termo **Agente** refere-se à entidade técnica de backend responsável por executar Jobs e interagir com o sistema. É o "worker" inteligente que processa as tarefas.

O termo **Persona**, por outro lado, é como os Agentes são apresentados aos usuários na interface. Uma Persona possui atributos configuráveis como nome, papel (ex: Desenvolvedor, QA), objetivos e backstory, que ajudam a definir sua especialização e comportamento. Essencialmente, uma Persona é a configuração e a "personalidade" de um Agente técnico.

Para mais informações sobre como os usuários configuram e interagem com as Personas, consulte o [Guia do Usuário: Configurando e Utilizando Personas](../user-guide/05-personas-agents.md).

## 2. Comportamento do Agente e Execução de Jobs

Um Agente no Project Wiz opera como um worker que processa Jobs de uma fila. Ele executa um "step" (passo) de um Job por vez. Entre a execução desses steps, o Agente pode ser interrompido para processar outros Jobs de maior prioridade, especialmente aqueles originados por mensagens de usuários ou outros Agentes.

Essa capacidade de interrupção e re-prioritização permite que o Agente reaja dinamicamente a novas informações ou instruções, como:

*   **Cancelar um Job:** Se um usuário envia uma mensagem pedindo para parar um Job, o Agente pode usar sua `TaskTool` para remover o Job da fila.
*   **Modificar um Job em Andamento:** Se o usuário solicita uma alteração no escopo ou nos resultados esperados de um Job, o Agente pode atualizar o Job (ex: adicionando novos passos ou subtarefas).
*   **Aprender com Novas Informações:** Se o Agente recebe uma informação relevante (ex: um novo padrão de codificação a ser seguido), ele pode registrar isso usando sua `AnnotationTool` ou `MemoryTool` e aplicar esse conhecimento aos Jobs subsequentes ou atuais.

Este comportamento é crucial para a flexibilidade e a capacidade de resposta dos Agentes dentro da "fábrica de software autônoma".

### 2.1. Relação com a Arquitetura de Jobs & Workers

O Agente é um componente central na [Arquitetura do Sistema de Processamento Assíncrono](./01-architecture.md). Conforme descrito nesse documento, um **Worker** monitora a fila de Jobs. Quando um Job é selecionado para um Agente específico, o Worker invoca os métodos apropriados do Agente para executar a **Task** associada ao Job. O Agente, então, utiliza suas capacidades de processamento de linguagem (LLM) e suas **Tools** para realizar o trabalho.

## 3. Ferramentas do Agente (Tools)

As Tools são a interface primária pela qual os Agentes interagem com o sistema Project Wiz, o ambiente de desenvolvimento, e fontes de informação externas. Elas capacitam os Agentes a realizar ações concretas para completar seus Jobs. Para detalhes sobre como desenvolver novas tools, consulte o [Guia de Desenvolvimento de Tools](./03-developing-tools.md).

A seguir, uma descrição das Tools disponíveis para os Agentes:

### 3.1. MemoryTool

Permite ao Agente gerenciar uma memória de longo prazo, onde informações importantes podem ser armazenadas e recuperadas. Os dados são frequentemente acessados via técnicas de RAG (Retrieval Augmented Generation) para serem incluídos no contexto da LLM quando relevante.

*   **Write:** Cria ou atualiza registros na memória do Agente.
*   **Delete:** Remove informações específicas da memória, geralmente identificadas por um código ou chave.

### 3.2. TaskTool

Permite ao Agente gerenciar os Jobs em sua fila de execução. Tecnicamente, estes são "Jobs" na fila, que se tornam "Tasks" (a lógica de execução) quando o Agente os processa.

*   **View/List:** Lista os Jobs na fila do Agente, idealmente mostrando dependências e hierarquias.
*   **Save:** Cria um novo Job ou atualiza um Job existente. Pode permitir a mesclagem de informações ou a substituição completa da estrutura do Job.
*   **Remove:** Deleta um Job (e suas sub-Jobs/subtarefas dependentes) da fila.

### 3.3. AnnotationTool

Permite ao Agente criar anotações contextuais durante a execução de um Job. Essas anotações são tipicamente incluídas no prompt da LLM para Jobs subsequentes ou steps do mesmo Job, fornecendo contexto imediato. Elas também podem ser usadas para refinar buscas na `MemoryTool`.

*   **View/List:** Lista as anotações ativas.
*   **Save:** Cria ou atualiza uma anotação.
*   **Remove:** Remove uma anotação.

### 3.4. FilesystemTool

Concede ao Agente a capacidade de interagir com o sistema de arquivos do projeto.

*   **ReadFile:** Lê o conteúdo de um arquivo especificado.
*   **WriteFile:** Escreve (ou sobrescreve) conteúdo em um arquivo.
*   **MoveFile:** Move ou renomeia um arquivo.
*   **RemoveFile:** Deleta um arquivo.
*   **ListDirectory:** Lista o conteúdo (arquivos e subdiretórios) de um diretório.
*   **CreateDirectory:** Cria um novo diretório.
*   **MoveDirectory:** Move ou renomeia um diretório.
*   **RemoveDirectory:** Deleta um diretório (geralmente se estiver vazio).

### 3.5. TerminalTool

Permite ao Agente executar comandos no terminal (shell) do sistema operacional onde o Project Wiz está rodando (dentro de limites de segurança apropriados).

*   **ShellCommand:** Executa um comando shell especificado e retorna sua saída.

### 3.6. ProjectTool

Fornece ao Agente informações e capacidades de manipulação relacionadas à estrutura e metadados do projeto no qual ele está trabalhando dentro do Project Wiz.

*   **Save:** Cria ou atualiza informações gerais de um projeto (ex: Nome, Descrição).
*   **Channel:** Cria ou atualiza um canal de comunicação dentro de um projeto.
*   **Forum:** Cria ou atualiza um tópico de discussão no fórum de um projeto.
*   **Issue:** Cria ou atualiza uma issue (item de trabalho ou bug) associada ao projeto.

### 3.7. MessageTool

Permite ao Agente enviar mensagens, seja para notificar usuários sobre o progresso, fazer perguntas, ou comunicar-se com outros Agentes.

*   **Direct:** Envia uma mensagem direta para um usuário específico.
*   **Channel:** Envia uma mensagem para um canal específico de um projeto.
*   **Forum:** Posta uma mensagem em um tópico de fórum de um projeto.

## 4. Conclusão

A estrutura do Agente no Project Wiz é projetada para fornecer um framework poderoso e flexível para automação de tarefas de desenvolvimento de software. Ao combinar capacidades de processamento de linguagem natural (via LLMs) com um conjunto robusto de Tools, os Agentes podem realizar uma ampla gama de atividades, contribuindo significativamente para a visão do Project Wiz como uma fábrica de software autônoma. A interação dinâmica com Jobs e a capacidade de usar diferentes personas configuráveis tornam este framework adaptável a diversas necessidades de desenvolvimento.
