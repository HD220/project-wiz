# Fluxogramas Detalhados (Descrição)

Este documento descreve os fluxogramas essenciais para o entendimento do funcionamento do Sistema de Fábrica de Software Autônoma Local. Como não é possível gerar diagramas visuais diretamente, cada seção descreverá o fluxo de forma textual, detalhando os componentes, as ações e as decisões envolvidas.

## 1. Fluxo de Usuário: Criação de Projeto e Interação Inicial com Agente

**Componentes Envolvidos:** Usuário (PO), Interface do Usuário (Renderer Process), Processo Principal (Main Process), Sistema de Arquivos, Git.

**Descrição do Fluxo:**

1.  **Início:** Usuário abre a aplicação.
2.  **Ação do Usuário:** Usuário clica em "Criar Novo Projeto" na UI.
3.  **UI:** Exibe formulário para nome do projeto e caminho.
4.  **Ação do Usuário:** Usuário preenche e submete o formulário.
5.  **UI -> Main (IPC):** Envia comando `createProject` com dados do projeto.
6.  **Main Process:**
    *   Valida dados do projeto.
    *   Cria diretório do projeto no sistema de arquivos.
    *   Executa `git init` no diretório do projeto.
    *   Cria canal de comunicação padrão para o projeto.
    *   Persiste informações do projeto no banco de dados.
7.  **Main Process -> UI (IPC):** Envia evento `projectCreated` com sucesso/falha.
8.  **UI:** Atualiza lista de projetos e exibe o novo projeto.
9.  **Ação do Usuário:** Usuário seleciona o novo projeto.
10. **UI:** Exibe o canal de comunicação padrão do projeto.
11. **Ação do Usuário:** Usuário digita mensagem: `@DevAgent, por favor, crie um arquivo README.md`.
12. **UI -> Main (IPC):** Envia mensagem `sendMessage` para o canal do projeto.
13. **Main Process:**
    *   Recebe a mensagem.
    *   Identifica o(s) agente(s) alvo(s) com base no contexto da conversa ou menção explícita.
    *   Despacha a tarefa para a(s) fila(s) do(s) agente(s) identificado(s).
14. **Main Process -> DevAgent (Interno):** Notifica o agente sobre nova tarefa.
15. **DevAgent:**
    *   Processa a tarefa: "criar arquivo README.md".
    *   Executa `writeFile` via IPC para criar o arquivo.
    *   Envia mensagem de status: "README.md criado com sucesso." para o canal.
16. **DevAgent -> Main Process (IPC):** Envia mensagem `agentStatusUpdate`.
17. **Main Process -> UI (IPC):** Envia evento `newMessage` para o canal.
18. **UI:** Exibe a mensagem de status do `DevAgent` no canal.
19. **Fim.**

## 2. Fluxo de Comunicação entre Frontend, Backend e Agentes

**Componentes Envolvidos:** Renderer Process (UI), Main Process (Backend), Agentes LLM, CQRS Dispatcher, IPC Handlers, Event Bus.

**Descrição do Fluxo:**

1.  **Início:** Usuário interage com a UI (Renderer Process).
2.  **Renderer Process:** Dispara um evento de UI (ex: clique de botão, envio de formulário).
3.  **Renderer Process -> Main Process (IPC):** Envia uma mensagem IPC (ex: `ipcRenderer.invoke('channel:command', payload)`).
4.  **Main Process (IPC Handler):** Um `ipcMain.handle` correspondente no Processo Principal recebe a mensagem.
5.  **IPC Handler:**
    *   Valida o `payload` recebido.
    *   Cria um `Command` ou `Query` apropriado (padrão CQRS).
    *   Invoca o `CqrsDispatcher.dispatchCommand()` ou `CqrsDispatcher.dispatchQuery()`.
6.  **CQRS Dispatcher:**
    *   Identifica o `Handler` (UseCase) responsável pelo `Command`/`Query`.
    *   Executa o `Handler`.
7.  **Handler (UseCase):**
    *   Contém a lógica de negócio.
    *   Pode interagir com repositórios (para persistência), serviços de domínio, ou outros módulos.
    *   Pode emitir eventos de domínio via `Event Bus`.
8.  **Event Bus (Opcional):** Se um evento é emitido, `Listeners` registrados reagem a ele (ex: um agente escuta um evento de nova tarefa).
9.  **Agentes LLM:**
    *   Recebem tarefas (via Event Bus ou diretamente do Main Process).
    *   Processam a tarefa, que pode envolver:
        *   Leitura/Escrita no Sistema de Arquivos (via IPC para Main Process).
        *   Execução de Comandos de Shell (via IPC para Main Process).
        *   Interação com APIs de LLM externas.
        *   Operações Git (via IPC para Main Process).
    *   Enviam atualizações de status/progresso de volta para o Main Process (via IPC).
10. **Main Process:** Recebe atualizações dos agentes.
11. **Main Process -> Renderer Process (IPC):** Envia mensagens IPC (ex: `ipcMain.handle('channel:event', payload)`) para atualizar a UI.
12. **Renderer Process:** Atualiza a UI com base nas mensagens recebidas (ex: exibe nova mensagem no chat, atualiza status de tarefa).
13. **Fim.**

## 3. Fluxo de Trabalho Git dos Agentes (Criação de Branch, Commit, Merge, Worktree)

**Componentes Envolvidos:** Agente LLM, Main Process, Git CLI.

**Descrição do Fluxo:**

1.  **Início:** Agente recebe tarefa para implementar uma nova funcionalidade (ex: "Implementar funcionalidade X").
2.  **Sistema:** Cria e configura um `git worktree` dedicado para a tarefa do agente, com a branch apropriada.
3.  **Agente:** Opera dentro do `worktree` fornecido pelo sistema.
4.  **Agente:** Realiza as modificações no código (leitura/escrita de arquivos).
5.  **Agente:** Após as modificações, solicita execução de `git add .`.
6.  **Agente:** Solicita execução de `git commit -m "feat: Implementa funcionalidade X"`.
7.  **Agente:** Envia mensagem de status para o canal: "Funcionalidade X implementada e commitada na branch `feature/funcionalidade-x`."
8.  **Agente:** Solicita execução de testes automatizados no `worktree` (ex: `npm test`).
9.  **Agente:** Analisa o resultado dos testes.
    *   **Decisão:** Testes passaram?
        *   **SIM:** Prossegue para o merge.
        *   **NÃO:** Identifica erros, tenta corrigir, repete passos 4-9. Se não conseguir, reporta ao usuário.
10. **Sistema:** Após a conclusão da tarefa no `worktree` do agente, o sistema é responsável por realizar o merge da branch da funcionalidade na branch principal (ex: `main` ou `develop`).
11. **Sistema (Opcional):** O sistema pode remover o `worktree` e a branch após o merge bem-sucedido.
12. **Fim.****

## 4. Fluxo de Execução de Tarefas dos Agentes

**Componentes Envolvidos:** Agente LLM, Fila de Tarefas do Agente, Main Process (para ferramentas).

**Descrição do Fluxo:**

1.  **Início:** Agente está ocioso ou concluiu a tarefa anterior.
2.  **Agente:** Verifica sua Fila de Tarefas.
3.  **Decisão:** Há tarefas na fila?
    *   **NÃO:** Agente entra em estado de espera por novas tarefas.
    *   **SIM:** Agente pega a tarefa de maior prioridade da fila.
4.  **Agente:** Analisa a tarefa e a decompõe em subtarefas se necessário.
5.  **Agente:** Para cada subtarefa:
    *   **Ação:** Executa a subtarefa (ex: ler arquivo, escrever código, executar comando shell, operação Git).
    *   **Decisão:** Subtarefa concluída com sucesso?
        *   **SIM:** Marca subtarefa como concluída.
        *   **NÃO:** Registra erro, tenta recuperação (se possível), ou marca tarefa como falha e reporta ao usuário.
    *   **Comunicação:** Envia atualizações de progresso para o canal do projeto.
6.  **Decisão:** Todas as subtarefas da tarefa principal concluídas com sucesso?
    *   **SIM:** Marca tarefa principal como concluída.
    *   **NÃO:** Marca tarefa principal como falha.
7.  **Agente:** Envia status final da tarefa para o canal do projeto.
8.  **Agente:** Volta para o passo 2 (verifica fila de tarefas).
9.  **Fim.**
