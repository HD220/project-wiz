# Casos de Uso Detalhados

Este documento detalha os principais casos de uso do sistema, descrevendo as interações entre o usuário (PO) e os agentes de IA, bem como as funcionalidades essenciais do sistema.

## 1. Caso de Uso: Criação de um Novo Projeto

*   **Ator:** Usuário (PO)
*   **Pré-condição:** O usuário está logado no sistema.
*   **Fluxo Principal:**
    1.  O usuário seleciona a opção "Criar Novo Projeto" na interface.
    2.  O sistema solicita o nome do projeto e, opcionalmente, uma descrição.
    3.  O usuário insere as informações e confirma.
    4.  O sistema cria um novo diretório local para o projeto.
    5.  O sistema inicializa um repositório Git vazio (`git init`) dentro do diretório do projeto.
    6.  O sistema cria um canal de comunicação padrão para o projeto (ex: `#general`).
    7.  O sistema exibe o novo projeto na lista de projetos do usuário.
*   **Fluxos Alternativos:**
    *   **A. Nome de Projeto Duplicado:** Se o nome do projeto já existir, o sistema informa o usuário e solicita um nome diferente.
    *   **B. Erro na Criação do Diretório:** Se houver um erro na criação do diretório, o sistema informa o usuário.
*   **Pós-condição:** Um novo projeto é criado, um repositório Git é inicializado e um canal de comunicação é estabelecido.

## 2. Caso de Uso: Interação com Agente de IA (Criação de Tarefa)

*   **Ator:** Usuário (PO), Agente de IA
*   **Pré-condição:** O usuário está em um canal de comunicação de um projeto ativo.
*   **Fluxo Principal:**
    1.  O usuário digita uma mensagem no canal, interagindo com um agente específico ou com o contexto geral do projeto (ex: `@DevAgent, precisamos de uma funcionalidade de login para o sistema`).
    2.  O sistema processa a mensagem e a encaminha para o(s) agente(s) relevante(s) com base no contexto ou menção.
    3.  O(s) agente(s) de IA analisam a conversa e identificam a necessidade de uma nova tarefa.
    4.  O(s) agente(s) criam uma nova tarefa no backlog do projeto, definindo título, descrição e prioridade, se necessário.
    5.  O(s) agente(s) enviam uma mensagem de confirmação ao usuário (ex: "Entendido. Criei a tarefa 'Implementar funcionalidade de login' no backlog.").
    6.  O(s) agente(s) podem, então, iniciar a execução da tarefa em segundo plano ou aguardar atribuição via sistema de issues.
    7.  O(s) agente(s) enviam atualizações de progresso e status para o canal conforme a tarefa avança.
*   **Fluxos Alternativos:**
    *   **A. Agente Não Encontrado:** Se o agente endereçado não existir, o sistema informa o usuário.
    *   **B. Tarefa Ambígua:** Se a solicitação for ambígua, o agente solicita mais informações ao usuário.
    *   **C. Atribuição via Issues:** O usuário pode atribuir uma tarefa a um agente diretamente no sistema de issues, ou pedir a um agente para "pegar" uma tarefa específica do backlog.
*   **Pós-condição:** Uma tarefa é criada no backlog do projeto pelos agentes, ou atribuída a um agente via sistema de issues, e sua execução é iniciada ou aguardada.

## 3. Caso de Uso: Visualização de Documentação Gerada

*   **Ator:** Usuário (PO)
*   **Pré-condição:** O usuário está em um projeto ativo e há documentação gerada pelos agentes.
*   **Fluxo Principal:**
    1.  O usuário navega até a seção de "Documentação" do projeto na interface.
    2.  O sistema exibe uma lista da documentação disponível (ex: README.md, docs técnicos, relatórios).
    3.  O usuário seleciona um item da lista.
    4.  O sistema carrega e exibe o conteúdo da documentação selecionada na interface, renderizando Markdown de forma similar à interface do GitHub.
*   **Fluxos Alternativos:**
    *   **A. Documento Não Encontrado:** Se o documento não puder ser carregado, o sistema informa o usuário.
*   **Pós-condição:** O usuário visualiza o conteúdo da documentação gerada pelos agentes.

## 4. Caso de Uso: Clonagem de Repositório Existente

*   **Ator:** Usuário (PO)
*   **Pré-condição:** O usuário está logado no sistema.
*   **Fluxo Principal:**
    1.  O usuário seleciona a opção "Clonar Repositório" na interface.
    2.  O sistema solicita a URL do repositório remoto (ex: GitHub, GitLab).
    3.  O usuário insere a URL e confirma.
    4.  O sistema executa o comando `git clone <URL>` para baixar o repositório para um diretório local.
    5.  O sistema exibe o novo projeto clonado na lista de projetos do usuário.
*   **Fluxos Alternativos:**
    *   **A. URL Inválida:** Se a URL for inválida, o sistema informa o usuário.
    *   **B. Erro de Conexão/Autenticação:** Se houver um erro ao clonar (ex: rede, credenciais), o sistema informa o usuário.
*   **Pós-condição:** Um novo projeto é criado a partir de um repositório Git remoto existente.

## 5. Caso de Uso: Agente Executa Comando de Shell

*   **Ator:** Agente de IA
*   **Pré-condição:** O agente recebeu uma tarefa que requer a execução de um comando de shell.
*   **Fluxo Principal:**
    1.  O agente identifica a necessidade de executar um comando (ex: `npm install`, `pytest`).
    2.  O agente constrói o comando de shell com os parâmetros necessários.
    3.  O agente solicita ao sistema a execução do comando, especificando o diretório de trabalho.
    4.  O sistema executa o comando em um ambiente seguro e isolado.
    5.  O sistema captura a saída (stdout e stderr) e o código de saída do comando.
    6.  O sistema retorna o resultado da execução ao agente.
    7.  O agente analisa o resultado e continua com a próxima etapa da tarefa ou reporta um erro.
*   **Fluxos Alternativos:**
    *   **A. Comando Inválido/Não Autorizado:** Se o comando for inválido ou não autorizado, o sistema nega a execução e informa o agente.
    *   **B. Erro de Execução:** Se o comando falhar, o sistema retorna o erro e o agente pode tentar uma recuperação ou reportar ao usuário.
*   **Pós-condição:** Um comando de shell é executado com segurança pelo sistema em nome do agente, e o resultado é retornado ao agente.
