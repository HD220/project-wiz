# Ferramentas de Agente (Agent Tools)

As Ferramentas (Tools) são funcionalidades específicas e codificadas no sistema que os Agentes IA podem invocar, geralmente sob a direção do LLM, para interagir com o ambiente do projeto, o sistema de arquivos, serviços externos, ou para realizar ações concretas.

## Framework de Ferramentas:

*   **Registro de Ferramentas (`ToolRegistry`):**
    *   O sistema mantém um registro de todas as `Tools` disponíveis.
    *   Cada `Tool` registrada possui uma descrição clara de sua funcionalidade, os parâmetros de entrada que espera (com seus tipos e formatos) e o formato da saída que produz.
    *   Esta descrição é fornecida ao LLM para que ele possa entender quando e como utilizar cada `Tool`.
*   **Execução de Ferramentas:**
    *   Quando um Agente (via LLM) decide usar uma `Tool`, ele especifica o nome da `Tool` e os argumentos necessários.
    *   O `ToolRegistry` localiza e executa o código da `Tool` correspondente.
    *   A `Tool` retorna um resultado (sucesso, dados, ou erro) ao Agente, que então o utiliza para continuar seu processo de raciocínio com o LLM.
*   **Extensibilidade:** O framework é projetado para ser extensível, permitindo que desenvolvedores adicionem novas `Tools` customizadas.

## Conjunto de Ferramentas Essenciais:

A seguir, uma lista das `Tools` cruciais para a operação dos Agentes, com seu status atualizado com base na análise do código:

1.  **Ferramentas de Comunicação:**
    *   **`SendMessageToUserTool` (Implícita):** A capacidade dos Agentes de enviar mensagens ao usuário é fundamental e implementada através do sistema de chat e IPC, onde as respostas do Agente (incluindo as geradas pelo LLM e atualizações de status) são enviadas de volta à UI.
    *   **(Intenção Futura/Não Evidente no Código) `SendMessageToAgentTool` / `PostToChannelTool`:** Ferramentas explícitas para comunicação direta entre agentes ou postagem em canais internos do Project Wiz não foram diretamente identificadas como use cases ou tool files específicos. Tal comunicação pode ser conceitualmente possível através de outros mecanismos (ex: um Agente criando um Job para outro, ou usando uma `TerminalTool` para interagir com um message bus, se existente).

2.  **Ferramentas de Controle de Versão (Git):**
    *   **Status:** Operações Git são essenciais para o fluxo de trabalho dos Agentes em tarefas de código. Embora não existam `Tools` de Git de alto nível e individualmente nomeadas (como `GitCommitTool.ts`), a funcionalidade é alcançada através da **`TerminalTool` / `ExecuteCommandTool`**. Os Agentes instruem o LLM a gerar os comandos Git apropriados (`git commit -m "..."`, `git checkout -b ...`, etc.) que são então executados no terminal.
    *   **Operações Esperadas (via TerminalTool):**
        *   Clonar repositórios.
        *   Criar e mudar para branches.
        *   Adicionar arquivos ao staging.
        *   Realizar commits.
        *   Enviar alterações para repositórios remotos (push).
        *   Obter atualizações (pull, fetch).
        *   Verificar status.
    *   Os Agentes devem ser instruídos a operar em branches específicos para isolar o trabalho de cada Job.

3.  **Ferramentas de Sistema de Arquivos (`FilesystemTools`):**
    *   **Status:** Implementadas. O sistema possui `file-system.tool.ts` e `filesystem-list.tool.ts`.
    *   **Capacidades Confirmadas (baseado na existência dos arquivos de tool - escopo exato a ser verificado no código da tool):**
        *   Ler arquivos.
        *   Listar conteúdo de diretórios.
    *   **Capacidades Adicionais Documentadas (a serem confirmadas no código da tool ou consideradas como parte da intenção de design):**
        *   Escrever/sobrescrever arquivos (`WriteFileTool`).
        *   Criar diretórios (`CreateDirectoryTool`).
        *   Mover/renomear arquivos e diretórios.
        *   Remover arquivos e diretórios.
        *   Modificações cirúrgicas (diff/patch).
    *   Estas ferramentas permitem que os Agentes leiam, e potencialmente escrevam e manipulem, arquivos e diretórios dentro da `working_directory` do projeto.

4.  **Ferramentas de Execução de Código e Terminal (`CodeExecutionTools` / `TerminalTools`):**
    *   **Status:** Implementadas. O sistema possui `execute-command.tool.ts` e `terminal.tool.ts`.
    *   **Capacidades Confirmadas:**
        *   Executar comandos de shell especificados (ex: `npm install`, `python -m unittest discover`, `flake8 .`) e retornar a saída padrão (stdout) e o erro padrão (stderr).
        *   Crucial para rodar linters, testes, scripts de build, e operações Git.
    *   *Considerações de Segurança:* A execução de comandos arbitrários deve ser cuidadosamente gerenciada, possivelmente com restrições, logging detalhado, ou exigindo confirmação do usuário para comandos potencialmente perigosos.

5.  **Ferramenta de Anotação/Notas (`AnnotationTool`):**
    *   **Status:** Implementada. O sistema possui `annotation.tool.ts` e Casos de Uso associados (`ListAnnotationsUseCase`, `RemoveAnnotationUseCase`, `SaveAnnotationUseCase`).
    *   **Capacidades Confirmadas:** Permite o gerenciamento estruturado de anotações (criar, listar, salvar, remover) pelos Agentes. Isso vai além de simplesmente usar o campo `activityNotes` no `ActivityContext`, oferecendo uma funcionalidade mais dedicada.

6.  **Ferramenta de Memória (`MemoryTool`):**
    *   **Status:** Implementada. O sistema possui `memory.tool.ts`, `sqlite-memory-tool.ts`, e Casos de Uso associados (`RemoveMemoryItemUseCase`, `SaveMemoryItemUseCase`, `SearchMemoryItemsUseCase`, `SearchSimilarMemoryItemsUseCase`).
    *   **Capacidades Confirmadas:**
        *   Armazenar e recuperar informações de forma persistente.
        *   Suporte a busca semântica (`SearchSimilarMemoryItemsUseCase`), indicando o uso de embeddings e armazenamento vetorial.
        *   Esta é uma capacidade mais sofisticada do que apenas o `AgentInternalState` geral, permitindo aos Agentes construir e consultar bases de conhecimento mais ricas.

7.  **Ferramenta de Interação com Dados do Projeto (`ProjectDataTool` - Conceitual):**
    *   **Status:** Não identificado como uma `Tool` explícita ou conjunto de Casos de Uso no código analisado.
    *   **Funcionalidade Intencionada:** Permitir que Agentes interajam com os metadados do projeto gerenciados pelo próprio Project Wiz (além da criação inicial do projeto, que é coberta por `CreateProjectUseCase`).
    *   Exemplos: `createIssueInProjectWizInternal(...)`, `updateProjectChannelInternal(...)`.
    *   Atualmente, tais interações, se necessárias, teriam que ser implementadas ou feitas através de outros mecanismos.

8.  **Ferramenta de Manipulação de Tarefas/Jobs (`TaskTool` - Conceitual):**
    *   **Status:** Não identificado como uma `Tool` explícita ou conjunto de Casos de Uso no código analisado.
    *   **Funcionalidade Intencionada:** Para permitir que um Agente gerencie mais diretamente sua própria fila de Jobs ou modifique Jobs existentes (ex: `listMyPendingJobs()`, `prioritizeJob(jobId, newPriority)`).
    *   **Observação:** A capacidade dos Agentes de criar Sub-Jobs para si mesmos cobre uma parte do planejamento e decomposição de tarefas. A manipulação direta da fila pelo Agente não é uma funcionalidade evidente.

A disponibilidade e a sofisticação dessas `Tools` são diretamente proporcionais à capacidade dos Agentes de realizar tarefas complexas e úteis de forma autônoma. A implementação e o refinamento contínuo dessas `Tools` são essenciais para a evolução do Project Wiz.
