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

A seguir, uma lista das `Tools` cruciais para a operação dos Agentes, com seu status atualizado com base na análise do código e documentação existente:

1.  **Ferramentas de Comunicação:**
    *   **`SendMessageToUserTool` (Implícita/Interface de Chat):** A capacidade dos Agentes de enviar mensagens ao usuário é fundamental e realizada através do sistema de chat da UI e IPC. As respostas do Agente, incluindo as geradas pelo LLM e atualizações de status, são enviadas de volta à UI.
    *   **(Intenção Futura) `SendMessageToAgentTool` / `PostToChannelTool`:** Ferramentas explícitas para comunicação direta entre agentes ou postagem em canais internos do Project Wiz.

2.  **Ferramentas de Controle de Versão (Git):**
    *   **Realização via `TerminalTool` / `ExecuteCommandTool`:** Operações Git são essenciais. Os Agentes instruem o LLM a gerar os comandos Git apropriados (`git commit`, `git checkout`, etc.) que são executados no terminal.
    *   **Operações Esperadas:** Clonar repositórios, criar/mudar branches, adicionar arquivos ao staging, realizar commits, push, pull, fetch, verificar status.
    *   Agentes devem operar em branches Git específicos para isolar o trabalho de cada Job.

3.  **Ferramentas de Sistema de Arquivos (`FileSystemTools`):**
    *   **Implementação Existente:** `file-system.tool.ts`, `filesystem-list.tool.ts`.
    *   **Capacidades Documentadas/Esperadas:**
        *   Ler arquivos.
        *   Listar conteúdo de diretórios.
        *   Escrever/sobrescrever arquivos.
        *   Criar diretórios.
        *   Mover/renomear arquivos e diretórios.
        *   Remover arquivos e diretórios.
        *   Modificações cirúrgicas (diff/patch) (avançado).
    *   Estas ferramentas permitem que os Agentes manipulem arquivos e diretórios na `working_directory` do projeto.

4.  **Ferramentas de Execução de Código e Terminal (`CodeExecutionTools` / `TerminalTools`):**
    *   **Implementação Existente:** `execute-command.tool.ts`, `terminal.tool.ts`.
    *   **Capacidades Confirmadas:**
        *   Executar comandos de shell especificados (ex: `npm install`, `python -m unittest`) e retornar stdout/stderr.
        *   Crucial para rodar linters, testes, scripts de build, e operações Git.
    *   *Considerações de Segurança:* Execução de comandos deve ser gerenciada com segurança (logging, restrições, confirmação do usuário para comandos sensíveis).

5.  **Ferramenta de Anotação/Notas (`AnnotationTool`):**
    *   **Implementação Existente:** `annotation.tool.ts` e Casos de Uso associados.
    *   **Capacidades Confirmadas:** Gerenciamento estruturado de anotações (criar, listar, salvar, remover) pelos Agentes.

6.  **Ferramenta de Memória (`MemoryTool`):**
    *   **Implementação Existente:** `memory.tool.ts`, `sqlite-memory-tool.ts`, e Casos de Uso associados.
    *   **Capacidades Confirmadas:**
        *   Armazenar e recuperar informações de forma persistente.
        *   Suporte a busca semântica (uso de embeddings e armazenamento vetorial).

7.  **Ferramenta de Interação com Dados do Projeto (`ProjectDataTool` - Intenção Futura):**
    *   **Funcionalidade Intencionada:** Permitir que Agentes interajam com metadados do projeto gerenciados pelo Project Wiz (além da criação inicial do projeto). Exemplos: `createIssueInProjectWizInternal(...)`.

8.  **Ferramenta de Manipulação de Tarefas/Jobs (`TaskTool` - Intenção Futura/Parcialmente Coberta):**
    *   **Funcionalidade Intencionada:** Permitir que um Agente gerencie mais diretamente sua própria fila de Jobs (ex: `listMyPendingJobs()`).
    *   **Observação:** Agentes já podem criar Sub-Jobs para si. A manipulação direta da fila pelo Agente de forma mais ampla é uma capacidade futura.

A disponibilidade e a sofisticação dessas `Tools` são diretamente proporcionais à capacidade dos Agentes de realizar tarefas complexas e úteis de forma autônoma.
