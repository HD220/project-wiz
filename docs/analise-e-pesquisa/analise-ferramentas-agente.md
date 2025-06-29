> **Nota sobre o Status:** Este documento descreve uma análise e proposta de design para o framework de Ferramentas de Agente (`IAgentTool`) e um conjunto de ferramentas que poderiam ser utilizadas pelos Agentes IA no Project Wiz. Estes conceitos representam áreas de pesquisa ativa e podem não refletir o estado atual ou final da implementação ou das ferramentas efetivamente disponíveis para os agentes. O único subsistema relacionado que está definido e em implementação é o de Filas/Workers, que será utilizado pela futura arquitetura de execução de agentes.

# Análise: Ferramentas de Agente (Proposta de Design)

As Ferramentas (`IAgentTool`) são concebidas como funcionalidades específicas que os Agentes IA (via um `GenericAgentExecutor` proposto) poderiam invocar, sob a direção do LLM, para interagir com o ambiente do projeto, sistema de arquivos, serviços externos, ou para realizar ações concretas.

## Framework de Ferramentas Proposto:

*   **Interface `IAgentTool`:** Definiria o contrato para todas as ferramentas, especificando `name`, `description` (para o LLM), `parameters` (schema Zod) e um método `execute(params, executionContext?)`.
*   **Registro de Ferramentas (`ToolRegistry`):**
    *   Um sistema de registro manteria as definições de `IAgentTool` disponíveis.
    *   A descrição e o schema de parâmetros seriam fornecidos ao LLM para que ele possa entender como utilizar cada `Tool`.
*   **Execução de Ferramentas:**
    *   O `GenericAgentExecutor` proposto invocaria o método `execute` da `IAgentTool`.
    *   O resultado da `Tool` seria adicionado ao `conversationHistory` para o LLM.
*   **Extensibilidade:** Novas `Tools` poderiam ser criadas implementando `IAgentTool`.

## Conjunto de Ferramentas Propostas/Analisadas:

1.  **Ferramentas de Comunicação:**
    *   **Comunicação Agente-Usuário (Implícita):** Seria realizada através do sistema de chat da UI e IPC.

2.  **Ferramentas de Controle de Versão (Git):**
    *   **Realização via `terminal.executeCommand`:** Operações Git seriam executadas através de uma `TerminalTool` proposta.

3.  **Ferramentas de Sistema de Arquivos (`FileSystemTool` Proposta):**
    *   **Nomes das Tools no Registro (Exemplos):** `fileSystem.readFile`, `fileSystem.writeFile`, etc.
    *   **Capacidades:** Leitura, escrita, listagem, etc., de arquivos/diretórios.

4.  **Ferramenta de Terminal (`TerminalTool` Proposta):**
    *   **Nome da Tool no Registro (Exemplo):** `terminal.executeCommand`.
    *   **Capacidades:** Executar comandos de shell.

5.  **Ferramenta de Anotação/Notas (`AnnotationTool` Proposta):**
    *   **Nomes das Tools no Registro (Exemplos):** `annotation.list`, `annotation.save`.
    *   **Capacidades:** Gerenciamento estruturado de anotações.

6.  **Ferramenta de Memória (`MemoryTool` Proposta):**
    *   **Nomes das Tools no Registro (Exemplos):** `memory.save`, `memory.search`.
    *   **Capacidades:** Armazenar e recuperar informações, potencialmente com busca semântica.

7.  **Ferramenta de Gerenciamento de Tarefas/Jobs (`TaskManagerTool` Proposta):**
    *   **Nomes das Tools no Registro (Exemplos):** `taskManager.listJobs`, `taskManager.saveJob`.
    *   **Capacidades:** Permitiria que Agentes gerenciassem Jobs, essencial para decomposição de tarefas.

## Ferramentas Conceituais Adicionais (Intenção Futura):

*   **`SendMessageToAgentTool` / `PostToChannelTool`:** Para comunicação inter-agente.
*   **`ProjectDataTool`:** Para interação com metadados internos do Project Wiz.

A definição e implementação de um conjunto robusto de `Tools` seriam cruciais para a capacidade dos Agentes de realizar tarefas complexas. Este documento serve como base para essa pesquisa e design.
