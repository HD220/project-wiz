# Ferramentas de Agente (Agent Tools)

As Ferramentas (`IAgentTool`) são funcionalidades específicas e codificadas no sistema que os Agentes IA (via `GenericAgentExecutor`) podem invocar, geralmente sob a direção do LLM, para interagir com o ambiente do projeto, o sistema de arquivos, serviços externos, ou para realizar ações concretas.

## Framework de Ferramentas:

*   **Interface `IAgentTool`:** Define o contrato para todas as ferramentas, especificando `name` (string única, ex: `fileSystem.readFile`), `description` (para o LLM), `parameters` (schema Zod para os argumentos de entrada) e um método `execute(params, executionContext?)`.
*   **Registro de Ferramentas (`ToolRegistry`):**
    *   O sistema (em `src/infrastructure/tools/tool-registry.ts`) mantém um registro de todas as instâncias de `IAgentTool` disponíveis.
    *   A descrição e o schema de parâmetros são fornecidos ao LLM pelo `GenericAgentExecutor` para que ele possa entender quando e como utilizar cada `Tool`.
*   **Execução de Ferramentas:**
    *   O `GenericAgentExecutor`, sob direção do LLM (via `ai-sdk`), invoca o método `execute` da `IAgentTool` correspondente do `ToolRegistry`.
    *   O resultado da `Tool` é adicionado à `conversationHistory` para o LLM.
*   **Extensibilidade:** Novas `Tools` podem ser criadas implementando `IAgentTool` e adicionadas ao `ToolRegistry` através de uma função `get<ToolName>ToolDefinitions`.

## Conjunto de Ferramentas Implementadas:

1.  **Ferramentas de Comunicação:**
    *   **Comunicação Agente-Usuário (Implícita):** Realizada através do sistema de chat da UI e IPC, onde as respostas do `GenericAgentExecutor` são enviadas à UI. Não há uma `Tool` explícita como `SendMessageToUserTool` que o Agente invoque.

2.  **Ferramentas de Controle de Versão (Git):**
    *   **Realização via `terminal.executeCommand`:** Operações Git são executadas através da `TerminalTool`. O LLM gera os comandos Git apropriados.
    *   **Operações Comuns:** `git clone`, `git checkout -b <branch>`, `git add .`, `git commit -m "..."`, `git push`, `git pull`, `git status`.
    *   Agentes devem operar em branches Git específicos.

3.  **Ferramentas de Sistema de Arquivos (`FileSystemTool`):**
    *   **Implementação:** `src/infrastructure/tools/file-system.tool.ts` (classe `FileSystemTool`).
    *   **Nomes das Tools no Registro:**
        *   `fileSystem.readFile`
        *   `fileSystem.writeFile`
        *   `fileSystem.moveFile`
        *   `fileSystem.removeFile`
        *   `fileSystem.listDirectory`
        *   `fileSystem.createDirectory`
        *   `fileSystem.moveDirectory`
        *   `fileSystem.removeDirectory`
    *   **Capacidades:** Leitura, escrita, listagem, criação, movimentação e remoção de arquivos/diretórios. Opera com um CWD configurável e verificações básicas de segurança.

4.  **Ferramenta de Terminal (`TerminalTool`):**
    *   **Implementação:** `src/infrastructure/tools/terminal.tool.ts` (classe `TerminalTool`).
    *   **Nome da Tool no Registro:**
        *   `terminal.executeCommand`
    *   **Capacidades:** Executa comandos de shell, retornando stdout, stderr e exit code. Opera com CWD configurável. Usada para builds, testes, linters, e operações Git.

5.  **Ferramenta de Anotação/Notas (`AnnotationTool`):**
    *   **Implementação:** `src/infrastructure/tools/annotation.tool.ts` (classe `AnnotationTool`).
    *   **Nomes das Tools no Registro:**
        *   `annotation.list`
        *   `annotation.save`
        *   `annotation.remove`
    *   **Capacidades:** Gerenciamento estruturado de anotações (criar, listar, salvar, remover) pelos Agentes, com persistência.

6.  **Ferramenta de Memória (`MemoryTool`):**
    *   **Implementação:** `src/infrastructure/tools/memory.tool.ts` (classe `MemoryTool`).
    *   **Nomes das Tools no Registro:**
        *   `memory.save`
        *   `memory.search` (realiza busca semântica)
        *   `memory.remove`
    *   **Capacidades:** Armazena e recupera informações de forma persistente. A busca semântica utiliza embeddings (via `EmbeddingService`) e `sqlite-vec`.

7.  **Ferramenta de Gerenciamento de Tarefas/Jobs (`TaskManagerTool`):**
    *   **Implementação:** `src/infrastructure/tools/task.tool.ts` (classe `TaskTool`).
    *   **Nomes das Tools no Registro:**
        *   `taskManager.listJobs`
        *   `taskManager.saveJob`
        *   `taskManager.removeJob`
    *   **Capacidades:** Permite que Agentes listem, criem/atualizem (salvem) e removam Jobs. Essencial para decomposição de tarefas e criação de Sub-Jobs.

## Ferramentas Conceituais (Não Implementadas / Intenção Futura):

*   **`SendMessageToAgentTool` / `PostToChannelTool` (Não Implementada):** Ferramentas explícitas para comunicação direta entre diferentes Agentes ou para postagem em canais de discussão internos do Project Wiz.
*   **`ProjectDataTool` (Não Implementada):** Ferramenta para Agentes interagirem com metadados internos do Project Wiz (ex: issues do sistema, canais de projeto, configurações específicas do projeto).
*   **Manipulação Avançada de Fila pela `TaskManagerTool` (Parcialmente Coberta):** Enquanto a `TaskManagerTool` permite criar, listar e remover jobs, funcionalidades mais avançadas como re-priorizar jobs diretamente pela ferramenta não são explícitas.

A disponibilidade e a sofisticação das `Tools` implementadas são cruciais para a capacidade dos Agentes de realizar tarefas complexas de forma autônoma.
