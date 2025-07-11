# Guia de Implementação (Para Agentes LLM)

Este guia fornece instruções detalhadas para os Agentes LLM sobre como interpretar e implementar as funcionalidades do sistema, interagir com o ambiente operacional e gerenciar o controle de versão Git. O objetivo é garantir que os agentes possam operar de forma autônoma e eficaz dentro do ecossistema do Project Wiz.

## 1. Interpretação de Tarefas e Requisitos

*   **1.1 Compreensão da Intenção:** Ao receber uma tarefa do usuário (via mensagem nos canais), o agente DEVE primeiro analisar a mensagem para extrair a intenção principal e os requisitos específicos. Utilize técnicas de Processamento de Linguagem Natural (PLN) para identificar verbos de ação, entidades e restrições.
    *   **Exemplo:** `"@DevAgent, por favor, crie um novo arquivo chamado 'README.md' no diretório raiz do projeto com o título 'Meu Projeto' e uma seção de 'Visão Geral'."`
        *   **Intenção:** Criar arquivo.
        *   **Arquivo:** `README.md`.
        *   **Local:** Diretório raiz do projeto.
        *   **Conteúdo:** Título "Meu Projeto", seção "Visão Geral".

*   **1.2 Decomposição de Tarefas:** Para tarefas complexas, o agente DEVE decompor a tarefa principal em subtarefas menores e gerenciáveis. Cada subtarefa deve ter um objetivo claro e ser executável de forma independente.
    *   **Exemplo:** `"Implementar funcionalidade de login com autenticação de usuário." `
        *   **Subtarefa 1:** Criar estrutura de arquivos para o módulo de autenticação.
        *   **Subtarefa 2:** Implementar endpoint de registro de usuário.
        *   **Subtarefa 3:** Implementar endpoint de login de usuário.
        *   **Subtarefa 4:** Adicionar validação de entrada para credenciais.
        *   **Subtarefa 5:** Escrever testes unitários para os endpoints.

*   **1.3 Priorização:** As subtarefas DEVE ser priorizadas com base em dependências e importância. O agente DEVE sempre tentar resolver as dependências antes de prosseguir.

*   **1.4 Comunicação Baseada em Persona:** Os agentes DEVE se comunicar de forma humanizada, interpretando seus papéis (nome, papel, perfil, backstory, objetivo) em todas as interações. A comunicação NÃO DEVE ser robotizada.
    *   **Nome e Papel:** Utilizar o nome e o papel definidos em sua persona ao se apresentar ou ao se referir a si mesmo.
    *   **Tom de Voz:** Adaptar o tom de voz e o estilo de comunicação ao seu papel e contexto da conversa. Um "DevAgent" pode usar uma linguagem mais técnica, enquanto um "ProductOwnerAgent" pode focar mais em termos de negócio.
    *   **Backstory e Objetivo:** As decisões e comunicações do agente DEVE ser consistentes com sua backstory e objetivo, reforçando a imersão do usuário.
    *   **Exemplo:** Em vez de "Tarefa concluída.", um "DevAgent" pode dizer: "Finalizei a implementação da funcionalidade X. Os testes passaram e o código está pronto para revisão."

## 2. Interação com o Sistema de Arquivos

Os agentes têm acesso direto ao sistema de arquivos local. A comunicação com o processo principal via IPC é necessária apenas para atualização de progresso e comunicação com a UI.

*   **2.1 Leitura de Arquivos:** Para ler o conteúdo de um arquivo, o agente DEVE usar a função `readFile` (via IPC).
    *   **Pseudocódigo:**
        ```pseudocode
        function read_file(path):
            // Assume acesso direto à ferramenta de leitura de arquivos
            content = filesystem.readFile(path)
            if content is not null:
                return content
            else:
                log_error("Erro ao ler arquivo: " + path)
                return null
        ```

*   **2.2 Escrita de Arquivos:** Para escrever ou criar um arquivo, o agente DEVE usar a função `writeFile` (via IPC).
    *   **Pseudocódigo:**
        ```pseudocode
        function write_file(path, content):
            // Assume acesso direto à ferramenta de escrita de arquivos
            success = filesystem.writeFile(path, content)
            if success:
                log_info("Arquivo escrito com sucesso: " + path)
                return true
            else:
                log_error("Erro ao escrever arquivo: " + path)
                return false
        ```

*   **2.3 Criação de Diretórios:** Para criar um novo diretório, o agente DEVE usar a função `createDirectory` (via IPC).
    *   **Pseudocódigo:**
        ```pseudocode
        function create_directory(path):
            // Assume acesso direto à ferramenta de criação de diretórios
            success = filesystem.createDirectory(path)
            if success:
                log_info("Diretório criado com sucesso: " + path)
                return true
            else:
                log_error("Erro ao criar diretório: " + path)
                return false
        ```

*   **2.4 Listagem de Conteúdo de Diretório:** Para listar arquivos e subdiretórios, o agente DEVE usar a função `listDirectory` (via IPC).
    *   **Pseudocódigo:**
        ```pseudocode
        function list_directory(path):
            // Assume acesso direto à ferramenta de listagem de diretórios
            entries = filesystem.listDirectory(path)
            if entries is not null:
                return entries
            else:
                log_error("Erro ao listar diretório: " + path)
                return null
        ```

## 3. Execução de Comandos de Shell

Os agentes podem executar comandos de shell para compilação, testes, instalação de dependências, etc. Todos os comandos DEVE ser executados através de uma função `executeShellCommand`.

*   **3.1 Execução de Comandos:** O agente DEVE executar comandos de shell. O sistema DEVE identificar e alertar se um comando de shell tenta operar fora do `worktree` do agente.
    *   **Pseudocódigo:**
        ```pseudocode
        function execute_shell_command(command, args, working_directory):
            // Assume acesso direto à ferramenta de execução de shell
            result = shell.executeCommand(command, args, working_directory)
            if result.success:
                log_info("Comando executado com sucesso. Stdout: " + result.stdout)
                return { stdout: result.stdout, stderr: result.stderr, exit_code: result.exit_code }
            else:
                log_error("Erro na execução do comando: " + result.error + ". Stderr: " + result.stderr)
                return { error: result.error, stderr: result.stderr, exit_code: result.exit_code }
        ```

*   **3.2 Análise de Saída:** Após a execução de um comando, o agente DEVE analisar `stdout`, `stderr` e `exit_code` para determinar o sucesso ou falha da operação e extrair informações relevantes.

## 4. Gerenciamento Git

Os agentes DEVE interagir com o Git para gerenciar o controle de versão do projeto. O uso de `git worktree` é mandatório para isolamento de ambientes.

*   **4.1 Inicialização de Repositório:** Ao criar um novo projeto, o agente DEVE inicializar um repositório Git.
    *   **Comando:** `git init`

*   **4.2 Clonagem de Repositório:** Ao clonar um projeto existente, o agente DEVE usar o comando `git clone`.
    *   **Comando:** `git clone <URL> <diretorio>`

*   **4.3 Criação e Gerenciamento de Worktree por Tarefa:** Para cada tarefa de implementação ou correção atribuída a um agente, o sistema DEVE criar e gerenciar automaticamente um `git worktree` dedicado. O agente operará dentro deste `worktree` isolado, que já estará configurado com a branch apropriada para a tarefa. O agente NÃO é responsável pela criação ou remoção do `worktree`.


*   **4.4 Criação de Branch:** Dentro do `worktree`, o agente DEVE criar uma nova branch para a funcionalidade.
    *   **Comando:** `git checkout -b <nome_branch>`

*   **4.5 Adição e Commit de Mudanças:** Após realizar as modificações no código, o agente DEVE adicionar os arquivos e fazer um commit.
    *   **Comandos:**
        *   `git add .`
        *   `git commit -m "feat: Implementa <descrição da funcionalidade>"`

*   **4.6 Merge de Branches:** Após a conclusão e validação da funcionalidade no `worktree`, o agente DEVE mesclar a branch de funcionalidade na branch principal (ex: `main` ou `develop`). Isso DEVE ser feito a partir da branch principal.
    *   **Pseudocódigo:**
        ```pseudocode
        function merge_feature_branch(feature_branch_name):
            // Mudar para a branch principal (ex: main) no worktree principal ou em um worktree dedicado para merges
            execute_shell_command("git", ["checkout", "main"], main_worktree_path)
            // Fazer o merge da branch da funcionalidade
            execute_shell_command("git", ["merge", feature_branch_name], main_worktree_path)
            // Opcional: Remover o worktree e a branch após o merge bem-sucedido
            // execute_shell_command("git", ["worktree", "remove", "--force", worktree_path])
            // execute_shell_command("git", ["branch", "-d", feature_branch_name])
        ```

*   **4.7 Validação de Workflow:** Antes de qualquer operação de merge, o agente DEVE executar testes automatizados e verificações de linting para garantir a qualidade do código e evitar quebras na branch principal.

## 5. Comunicação e Relatórios

*   **5.1 Atualizações de Status:** O agente PODE enviar atualizações para o canal de comunicação do projeto ou mensagens diretas, focando em marcos importantes ou quando solicitado. A comunicação NÃO precisa ser constante.
*   **5.2 Status Visual:** O sistema DEVE exibir visualmente a tarefa atual que o agente está executando (similar ao status "jogando" do Discord).
*   **5.3 Perfil do Agente:** O usuário DEVE poder acessar o perfil do agente para visualizar seu log de execução, tarefas concluídas e tarefas pendentes.
*   **5.2 Solicitação de Esclarecimentos:** Se uma tarefa for ambígua ou o agente precisar de mais informações, ele DEVE solicitar esclarecimentos ao usuário de forma clara e concisa.
*   **5.3 Relatórios de Erro:** Em caso de falha na execução de uma tarefa ou comando, o agente DEVE reportar o erro detalhadamente, incluindo mensagens de erro, logs e possíveis causas.

## 6. Geração de Documentação

*   **6.1 Geração Automática:** O agente DEVE ser capaz de gerar ou atualizar documentação relevante (ex: `README.md`, documentação de API, guias de uso) como parte da conclusão de uma funcionalidade.
*   **6.2 Formato:** A documentação DEVE ser gerada em formatos legíveis (ex: Markdown) e armazenada em locais padronizados dentro do repositório do projeto.