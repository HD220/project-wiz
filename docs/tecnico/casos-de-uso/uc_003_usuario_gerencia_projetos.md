# UC-003: Usuário Gerencia Projetos

**ID:** UC-003
**Nome do Caso de Uso:** Usuário Gerencia Projetos
**Ator Principal:** Usuário
**Nível:** Usuário-Meta (User Goal)
**Prioridade:** Média
**Referência Funcional:** `docs/funcional/01_gerenciamento_projetos.md`, `docs/funcional/07_interface_usuario_ux.md`

## Descrição Breve:
Este caso de uso descreve como um usuário cria, visualiza, lista e (futuramente) edita projetos dentro do Project Wiz.

## Pré-condições:
1.  O usuário está autenticado no sistema Project Wiz.

## Fluxo Principal (Criação de Projeto):
1.  **Usuário Solicita Criação:** O Usuário navega para a seção de gerenciamento de projetos na UI (ex: `ProjectListPage`) e inicia a ação de criar um novo projeto.
2.  **Sistema Apresenta Formulário:** A UI exibe um formulário para o Usuário inserir os detalhes do novo projeto (Nome, Descrição opcional).
3.  **Usuário Preenche Detalhes:** O Usuário insere as informações solicitadas e submete o formulário.
4.  **UI Envia Requisição:** A UI envia uma requisição para o backend (via IPC) para criar o projeto, contendo os dados fornecidos.
5.  **Backend Processa Criação:**
    *   O manipulador IPC invoca o `CreateProjectUseCase`.
    *   `CreateProjectUseCase` valida os dados.
    *   Cria a entidade `Project` e a entidade `SourceCode` associada.
    *   Persiste as entidades usando `IProjectRepository` e `ISourceCodeRepository`.
    *   Inicializa a estrutura de pastas no sistema de arquivos (incluindo `source-code/`, `docs/`, `worktrees/`) e um repositório Git em `source-code/`.
6.  **Sistema Confirma Criação:** O backend retorna uma confirmação de sucesso (com o `projectId`) para a UI.
7.  **UI Atualiza Visualização:** A UI atualiza a lista de projetos para incluir o novo projeto criado, e pode navegar para a página de detalhes do novo projeto.

## Fluxo Principal (Listagem de Projetos):
1.  **Usuário Navega para Lista:** O Usuário acessa a seção de listagem de projetos na UI (ex: `ProjectListPage`).
2.  **UI Solicita Dados:** A UI envia uma requisição para o backend (via IPC) para obter a lista de todos os projetos do usuário.
3.  **Backend Recupera Projetos:** O manipulador IPC invoca um caso de uso (ex: `ListProjectsUseCase`, não explicitamente visto, mas implícito) que utiliza `IProjectRepository` para buscar todos os projetos.
4.  **Sistema Retorna Dados:** O backend retorna a lista de projetos para a UI.
5.  **UI Exibe Lista:** A UI renderiza a lista de projetos, permitindo que o usuário veja nomes e, possivelmente, outras informações resumidas (ex: usando `ProjectCard`).

## Fluxo Principal (Visualização de Detalhes do Projeto):
1.  **Usuário Seleciona Projeto:** Na lista de projetos, o Usuário seleciona um projeto específico para ver seus detalhes.
2.  **UI Solicita Detalhes:** A UI navega para uma rota de detalhes do projeto (ex: `/project/$id`) e/ou envia uma requisição para o backend (via IPC) para obter os detalhes completos do projeto selecionado (incluindo `SourceCode`, etc.).
3.  **Backend Recupera Detalhes:** O manipulador IPC invoca um caso de uso (ex: `GetProjectDetailsUseCase`, não explicitamente visto, mas implícito) que utiliza `IProjectRepository` e `ISourceCodeRepository` para buscar os dados do projeto.
4.  **Sistema Retorna Detalhes:** O backend retorna os detalhes do projeto para a UI.
5.  **UI Exibe Detalhes:** A UI (ex: `ProjectDetailPage`) renderiza as informações detalhadas do projeto, possivelmente em abas (Visão Geral, Tarefas, Discussões, etc.).

## Fluxos Alternativos:
*   **FA-003.1: Falha na Validação (Criação):** Se os dados fornecidos para um novo projeto forem inválidos (Passo 5 da Criação), o `CreateProjectUseCase` retorna um erro. A UI exibe a mensagem de erro ao Usuário.
*   **FA-003.2: Falha na Persistência/Criação de Pastas (Criação):** Se ocorrer um erro durante a persistência no banco de dados ou na criação das pastas/Git repo (Passo 5 da Criação), o UseCase retorna um erro. A UI informa o Usuário sobre a falha.
*   **FA-003.3: Nenhum Projeto Encontrado (Listagem):** Se não houver projetos para listar (Passo 5 da Listagem), a UI exibe uma mensagem apropriada (ex: "Nenhum projeto criado ainda. Crie um novo projeto para começar!").
*   **FA-003.4: Projeto Não Encontrado (Detalhes):** Se o projeto selecionado para visualização de detalhes não existir (Passo 4 da Visualização), o backend retorna um erro. A UI exibe uma mensagem de erro apropriada.

## Pós-condições:
*   **Criação Bem-sucedida:** Um novo projeto é criado, persistido, sua estrutura de pastas e repositório Git são inicializados, e ele está disponível para listagem e visualização.
*   **Listagem Bem-sucedida:** A lista de projetos do usuário é exibida na UI.
*   **Visualização Bem-sucedida:** Os detalhes do projeto selecionado são exibidos na UI.
*   **Falha:** O sistema informa o usuário sobre o erro e permanece em um estado consistente.

## Requisitos Especiais (Futuro):
*   Interface para editar configurações de projetos existentes (nome, descrição, `working_directory` se permitido).
*   Interface para arquivar ou deletar projetos.
