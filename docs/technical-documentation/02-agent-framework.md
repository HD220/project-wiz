# Estrutura e Funcionamento dos Agentes (Personas)

Este documento detalha o conceito de Agente (frequentemente referido como Persona na interface do usuário) no Project Wiz. Explicaremos como os Agentes operam, interagem com tarefas (Jobs), gerenciam informações e utilizam suas ferramentas (Tools) para executar o trabalho de automação.

## 1. Conceito de Agente e Persona

No Project Wiz, o termo **Agente** refere-se à entidade técnica de backend responsável por executar Jobs e interagir com o sistema. É o "worker" inteligente que processa as tarefas.

O termo **Persona**, por outro lado, é como os Agentes são apresentados aos usuários na interface. Uma Persona possui atributos configuráveis como nome, papel (ex: Desenvolvedor, QA), objetivos e backstory, que ajudam a definir sua especialização e comportamento. Essencialmente, uma Persona é a configuração e a "personalidade" de um Agente técnico.

Para mais informações sobre como os usuários configuram e interagem com as Personas, consulte o [Guia do Usuário: Configurando e Utilizando Personas](../user-guide/05-personas-agents.md).

## 2. Conceitos Chave do Framework de Agentes

### Activity Context

O `ActivityContext` é um componente fundamental no sistema de Agentes Autônomos, projetado para armazenar o estado e o contexto específico de uma **Activity** individual dentro de um **Job**. Ele reside no campo `data` da entidade `Job`, garantindo que cada Activity tenha seu próprio espaço isolado para gerenciar as informações relevantes para sua execução. Enquanto o `AgentInternalState` representa o estado global e persistente de um Agente, o `ActivityContext` é efêmero e específico para a execução de uma única Activity. Ele contém todas as informações que o Large Language Model (LLM) precisa para raciocinar e tomar decisões focadas na tarefa atual.

Principais campos do `ActivityContext`:
- `messageContent`: O conteúdo da mensagem ou instrução inicial.
- `sender`: Identifica a origem da mensagem.
- `toolName`: Nome da ferramenta utilizada ou sugerida.
- `toolArgs`: Argumentos para a execução da ferramenta.
- `activityNotes`: Notas relevantes geradas durante a execução.
- `activityHistory`: Histórico de interações e resultados dentro desta Activity.

A gestão do `activityHistory` é um ponto de atenção, pois seu crescimento pode impactar o desempenho do LLM, exigindo estratégias como sumarização.

### Activity

A **Activity** representa a unidade fundamental de trabalho para o Agente, sendo a menor porção de uma tarefa que o Agente processa. A **Job** é a representação persistida da Activity no sistema, contendo o `ActivityContext` no seu campo `data`.

Principais atributos de uma Activity:
- `id`: Identificador único.
- `type`: Categoria da Activity (ex: `USER_REQUEST`, `PLANNING`).
- `description`: Descrição textual da tarefa.
- `status`: Estado atual (ex: `PENDING`, `IN_PROGRESS`).
- `priority`: Valor de urgência.
- `createdAt` / `lastUpdatedAt`: Timestamps.
- `context`: Objeto com dados específicos, incluindo `activityNotes` e `activityHistory`.
- `parentId` / `relatedActivityIds`: Para relações hierárquicas ou de dependência.

O `ActivityContext` (especialmente o `activityHistory`) é vital para o LLM, fornecendo contexto isolado para a Activity em processamento.

### Agent Internal State

O `AgentInternalState` representa o estado global de negócio de um Agente Autônomo. Diferente do `ActivityContext` (que é específico de uma Activity), o `AgentInternalState` encapsula informações de alto nível e conhecimento que o Agente acumula e mantém ao longo de seu ciclo de vida e através de múltiplas atividades. Ele é persistido separadamente para garantir a continuidade das operações do Agente.

**Distinção:**
- **AgentInternalState:** Contexto global de negócio do Agente (projeto focado, issue principal, objetivo de alto nível, notas gerais, promessas). Persistido centralmente para o Agente.
- **Activity Context:** Contexto específico de uma Activity individual (histórico de mensagens da Activity, notas da Activity, passos planejados). Reside na Job.

Principais campos do `AgentInternalState`:
- `agentId`: Identificador do Agente.
- `generalNotes`: Notas gerais ou aprendizados do Agente.
- `promisesMade`: Compromissos que o Agente fez.

A persistência do `AgentInternalState` permite ao Agente manter foco, continuar raciocínio, cumprir compromissos e recuperar-se de falhas, complementando o `ActivityContext` para cada tarefa.

### Autonomous Agent

O `AutonomousAgent` é a classe central que implementa o "Loop Agente", responsável pelo raciocínio, tomada de decisões e orquestração de atividades. Opera de forma contínua e orientada a atividades, processando um backlog de atividades dinamicamente.

Principais responsabilidades:
- **Raciocínio e Tomada de Decisão:** Utiliza um LLM com base no `AgentInternalState` (estado global) e no `ActivityContext` (contexto da tarefa específica).
- **Gerenciamento de Activities:** Interage com a `Queue` (via `QueueService` ou `JobRepository`) para obter `Jobs` (Activities) e atualiza o `ActivityContext` na `Job`.
- **Despacho de Tasks:** Utiliza uma interface (`IAgentService`) para despachar a execução de `Tasks` quando uma ação concreta é necessária.
- **Gerenciamento de Estado Interno:** Atualiza seu `AgentInternalState` com informações relevantes.

O `AutonomousAgent` é invocado por um `Worker` que lhe passa uma `Job` (Activity) da `Queue`. O Agente executa uma iteração do seu loop de raciocínio, decide a próxima ação e pode despachar `Tasks`.

### IAgentService

O `IAgentService` é uma interface que permite ao `AutonomousAgent` despachar `Tasks` para execução por um `Worker`. Ele abstrai como a Task será executada, focando em expor a capacidade de "fazer" algo.

Quando o `AutonomousAgent` decide uma ação, ele invoca o `IAgentService`, que pode:
1.  Criar novas `Jobs` (Activities) na fila para processamento assíncrono.
2.  Encaminhar a `Job` (Activity) atual para um `TaskFactory` para instanciar e executar a `Task` correta.

Após a execução da `Task`, o `IAgentService` retorna o resultado ao `AutonomousAgent`, permitindo que o Agente continue seu ciclo de raciocínio.

### Job

Uma **Job** é a representação persistida de uma unidade de trabalho, gerenciada pela **Queue**. No contexto dos Agentes Autônomos, a Job encapsula uma **Activity** completa, armazenando o `ActivityContext` em seu campo `data`.

Principais atributos da Job:
- `id`, `name`, `payload` (entrada inicial, não mutável internamente).
- `data`: Armazena informações mutáveis, incluindo o `ActivityContext` e `activityHistory`.
- `result`: Resultado final da Job.
- `max_attempts`, `attempts`, `max_retry_delay`, `retry_delay`, `delay`.
- `priority`: Menor número significa MAIOR prioridade.
- `status`: Estado atual (`pending`, `waiting`, `delayed`, `finished`, `executing`, `failed`).
- `depends_on`: Lista de `jobIds` dos quais esta Job depende.
- `parentId`: ID da Job pai (opcional).

Estados do Status da Job:
- `pending`: Pronta para execução.
- `waiting`: Aguardando dependências.
- `delayed`: Atrasada (delay inicial ou retentativa).
- `finished`: Concluída (sucesso ou erro final).
- `executing`: Em processamento por um Worker.
- `failed`: Erro após todas as tentativas.

### Process Job Service

O `ProcessJobService` é o ponto de entrada para a criação e iniciação de novas Jobs (ou Activities). Ele recebe a solicitação, valida os dados, cria uma nova entidade `Job` (que representa a Activity inicial) com status `pending` ou `waiting`, e a adiciona à `Queue` usando o `QueueService` ou `JobRepository`. A `Queue` então notifica os `Workers` disponíveis. Essencialmente, ele transforma uma requisição externa em uma `Job`/`Activity` válida e a enfileira para processamento.

### Queue

A **Queue** (Fila) gerencia o ciclo de vida das Jobs/Activities. É o componente central que armazena, organiza e controla as tarefas assíncronas.

Principais Responsabilidades:
1.  **Persistir Estado:** Salva e recupera o estado das Jobs/Activities (inicialmente em SQLite).
2.  **Controlar Transições de Status:** Única entidade que altera o status persistido de uma Job/Activity (`pending`, `waiting`, `delayed`, `executing`, `finished`, `failed`).
3.  **Gerenciar Retentativas e Atrasos:** Controla `attempts`, `retry_delay` (com backoff exponencial), e `delay`.
4.  **Gerenciar Dependências (`depends_on`):** Coloca Jobs em `waiting` se dependências não estiverem `finished`, monitora e as move para `pending` quando concluídas.

Interage com `WorkerPool` (notificando sobre novas Jobs) e `Workers` (recebendo Jobs e atualizando seu status após execução). A Queue garante a integridade do sistema de processamento assíncrono.

### Task

Uma **Task** representa a lógica de execução em memória para um tipo específico de trabalho, encapsulando uma ação acionável dentro do contexto de uma Job/Activity. Ela interage com LLMs e Tools, operando em memória sem se preocupar com persistência ou filas. A Task recebe dados da Job (incluindo `ActivityContext`) e Tools injetadas pelo Agente.

Retornos da Task e suas consequências:
1.  **Sucesso:** A Task concluiu. O Worker pode prosseguir ou finalizar a Job.
2.  **Vazio/Re-agendamento:** A Task precisa ser re-executada. O Worker pode recolocar a Job na Queue.
3.  **Erro (throw):** Falha na execução. O Worker trata conforme a política de retentativa da Job.

### Tool

As **Tools** são as capacidades que um agente possui para interagir com o mundo externo e outros sistemas, permitindo ações concretas. São utilizadas pelas **Tasks** quando o LLM decide que uma ação externa é necessária.

Tipos de Tools:
- **Tools do Agente:** Genéricas, úteis para diversos agentes e tarefas (ex: manipulação de arquivos).
- **Tools da Task/Job:** Específicas para o contexto de uma Task ou tipo de Job. A classe `Task` define quais Tools específicas são acessíveis.

Tools bem definidas, com interfaces claras, são cruciais para que o LLM as utilize eficazmente.

### Worker Pool

O **WorkerPool** gerencia um conjunto de [Workers](#worker), orquestrando a execução concorrente de Jobs (Activities). Ele monitora a [Queue](#queue) por Jobs `pending` e as atribui a Workers ociosos. Suporta escalabilidade horizontal para lidar com aumento de carga de trabalho.

### Worker

O **Worker** orquestra a execução de Jobs (Activities), atuando como ponte entre a [Queue](#queue) e o `AutonomousAgent`. Ele não contém a lógica de negócio da tarefa, mas coordena sua execução.

Funcionamento:
1.  **Obter Job:** Conecta-se à `Queue` e solicita uma Job `pending`.
2.  **Invocar Agente:** Recebe o ID do agente e a função de processamento. Invoca o `AutonomousAgent` com a Job.
3.  **Notificar Queue:** Após a execução pelo Agente:
    - Sucesso: Notifica a Queue para marcar Job como `finished`.
    - Retorno Vazio (não concluído, sem erro): Notifica para marcar Job como `delayed` (re-agendamento).
    - Exceção (erro): Captura e notifica a Queue.

A `Queue` gerencia a política de retentativa. O Worker delega essa lógica à Queue, garantindo que falhas temporárias não interrompam o processamento permanentemente.

## 3. Comportamento do Agente e Execução de Jobs

Um Agente no Project Wiz opera como um worker que processa Jobs de uma fila. Ele executa um "step" (passo) de um Job por vez. Entre a execução desses steps, o Agente pode ser interrompido para processar outros Jobs de maior prioridade, especialmente aqueles originados por mensagens de usuários ou outros Agentes.

Essa capacidade de interrupção e re-prioritização permite que o Agente reaja dinamicamente a novas informações ou instruções, como:

*   **Cancelar um Job:** Se um usuário envia uma mensagem pedindo para parar um Job, o Agente pode usar sua `TaskTool` para remover o Job da fila.
*   **Modificar um Job em Andamento:** Se o usuário solicita uma alteração no escopo ou nos resultados esperados de um Job, o Agente pode atualizar o Job (ex: adicionando novos passos ou subtarefas).
*   **Aprender com Novas Informações:** Se o Agente recebe uma informação relevante (ex: um novo padrão de codificação a ser seguido), ele pode registrar isso usando sua `AnnotationTool` ou `MemoryTool` e aplicar esse conhecimento aos Jobs subsequentes ou atuais.

Este comportamento é crucial para a flexibilidade e a capacidade de resposta dos Agentes dentro da "fábrica de software autônoma".

### 3.1. Relação com a Arquitetura de Jobs & Workers

O Agente é um componente central na [Arquitetura do Sistema de Processamento Assíncrono](./01-architecture.md). Conforme descrito nesse documento, um **Worker** monitora a fila de Jobs. Quando um Job é selecionado para um Agente específico, o Worker invoca os métodos apropriados do Agente para executar a **Task** associada ao Job. O Agente, então, utiliza suas capacidades de processamento de linguagem (LLM) e suas **Tools** para realizar o trabalho.

## 4. Ferramentas do Agente (Tools)

As Tools são a interface primária pela qual os Agentes interagem com o sistema Project Wiz, o ambiente de desenvolvimento, e fontes de informação externas. Elas capacitam os Agentes a realizar ações concretas para completar seus Jobs. Para detalhes sobre como desenvolver novas tools, consulte o [Guia de Desenvolvimento de Tools](./03-developing-tools.md).

A seguir, uma descrição das Tools disponíveis para os Agentes:

### 4.1. MemoryTool

Permite ao Agente gerenciar uma memória de longo prazo, onde informações importantes podem ser armazenadas e recuperadas. Os dados são frequentemente acessados via técnicas de RAG (Retrieval Augmented Generation) para serem incluídos no contexto da LLM quando relevante.

*   **Write:** Cria ou atualiza registros na memória do Agente.
*   **Delete:** Remove informações específicas da memória, geralmente identificadas por um código ou chave.

### 4.2. TaskTool

Permite ao Agente gerenciar os Jobs em sua fila de execução. Tecnicamente, estes são "Jobs" na fila, que se tornam "Tasks" (a lógica de execução) quando o Agente os processa.

*   **View/List:** Lista os Jobs na fila do Agente, idealmente mostrando dependências e hierarquias.
*   **Save:** Cria um novo Job ou atualiza um Job existente. Pode permitir a mesclagem de informações ou a substituição completa da estrutura do Job.
*   **Remove:** Deleta um Job (e suas sub-Jobs/subtarefas dependentes) da fila.

### 4.3. AnnotationTool

Permite ao Agente criar anotações contextuais durante a execução de um Job. Essas anotações são tipicamente incluídas no prompt da LLM para Jobs subsequentes ou steps do mesmo Job, fornecendo contexto imediato. Elas também podem ser usadas para refinar buscas na `MemoryTool`.

*   **View/List:** Lista as anotações ativas.
*   **Save:** Cria ou atualiza uma anotação.
*   **Remove:** Remove uma anotação.

### 4.4. FilesystemTool

Concede ao Agente a capacidade de interagir com o sistema de arquivos do projeto.

*   **ReadFile:** Lê o conteúdo de um arquivo especificado.
*   **WriteFile:** Escreve (ou sobrescreve) conteúdo em um arquivo.
*   **MoveFile:** Move ou renomeia um arquivo.
*   **RemoveFile:** Deleta um arquivo.
*   **ListDirectory:** Lista o conteúdo (arquivos e subdiretórios) de um diretório.
*   **CreateDirectory:** Cria um novo diretório.
*   **MoveDirectory:** Move ou renomeia um diretório.
*   **RemoveDirectory:** Deleta um diretório (geralmente se estiver vazio).

### 4.5. TerminalTool

Permite ao Agente executar comandos no terminal (shell) do sistema operacional onde o Project Wiz está rodando (dentro de limites de segurança apropriados).

*   **ShellCommand:** Executa um comando shell especificado e retorna sua saída.

### 4.6. ProjectTool

Fornece ao Agente informações e capacidades de manipulação relacionadas à estrutura e metadados do projeto no qual ele está trabalhando dentro do Project Wiz.

*   **Save:** Cria ou atualiza informações gerais de um projeto (ex: Nome, Descrição).
*   **Channel:** Cria ou atualiza um canal de comunicação dentro de um projeto.
*   **Forum:** Cria ou atualiza um tópico de discussão no fórum de um projeto.
*   **Issue:** Cria ou atualiza uma issue (item de trabalho ou bug) associada ao projeto.

### 4.7. MessageTool

Permite ao Agente enviar mensagens, seja para notificar usuários sobre o progresso, fazer perguntas, ou comunicar-se com outros Agentes.

*   **Direct:** Envia uma mensagem direta para um usuário específico.
*   **Channel:** Envia uma mensagem para um canal específico de um projeto.
*   **Forum:** Posta uma mensagem em um tópico de fórum de um projeto.

## 5. Conclusão

A estrutura do Agente no Project Wiz é projetada para fornecer um framework poderoso e flexível para automação de tarefas de desenvolvimento de software. Ao combinar capacidades de processamento de linguagem natural (via LLMs) com um conjunto robusto de Tools, os Agentes podem realizar uma ampla gama de atividades, contribuindo significativamente para a visão do Project Wiz como uma fábrica de software autônoma. A interação dinâmica com Jobs e a capacidade de usar diferentes personas configuráveis tornam este framework adaptável a diversas necessidades de desenvolvimento.
