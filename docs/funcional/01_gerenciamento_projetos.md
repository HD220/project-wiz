# Gerenciamento de Projetos

O Project Wiz permite aos usuários gerenciar seus projetos de software de forma centralizada. A criação e configuração inicial são gerenciadas pelo `CreateProjectUseCase`.

## Funcionalidades Principais:

1.  **Criação de Projetos:**
    *   Usuários podem criar novos projetos de software (com nome e descrição opcional) dentro do Project Wiz.
    *   O `CreateProjectUseCase` é responsável por:
        *   Gerar um `ProjectId` único.
        *   Criar uma entidade `Project` com nome e descrição.
        *   Persistir a entidade `Project`.
        *   No sistema de arquivos, criar uma estrutura de pastas base dentro de um diretório nomeado com o `ProjectId`, incluindo:
            *   `<ProjectId>/source-code/`: Para o código fonte principal.
            *   `<ProjectId>/source-code/docs/`: Para documentação do projeto.
            *   `<ProjectId>/worktrees/`: Para áreas de trabalho temporárias ou específicas de Jobs dos Agentes.
        *   Inicializar um repositório Git dentro da pasta `<ProjectId>/source-code/`.
        *   Criar e persistir uma entidade `SourceCode` que vincula o `ProjectId` aos caminhos (`RepositoryPath` para `source-code/` e `RepositoryDocsPath` para `docs/`).

2.  **Configuração de Projetos:**
    *   Após a criação, o projeto tem um `caminho_working_directory` principal (o diretório `<ProjectId>/source-code/`) que é a localização base para operações de Agentes.
    *   Funcionalidades para modificar configurações do projeto (além do nome/descrição iniciais) após a criação não foram detalhadamente exploradas no código atual (além da estrutura da entidade `Project` permitir atualizações).

3.  **Visualização e Listagem:**
    *   A interface do usuário (componente `ProjectListPage`) permite listar todos os projetos gerenciados.
    *   Os usuários podem visualizar detalhes de um projeto específico (componente `ProjectDetailPage`).

4.  **Contexto para Agentes:**
    *   O projeto ativo fornece contexto para os Agentes IA, incluindo o `caminho_working_directory` (via entidade `SourceCode`) e informações sobre o repositório Git associado.
    *   Agentes operam no código fonte e outros artefatos dentro da estrutura do projeto.

## (Intenção Futura/Avançada) Interação de Agentes com Metadados do Projeto:
*   Agentes poderão, através de `Tools` específicas (como uma `ProjectDataTool`, atualmente não implementada), interagir com metadados do projeto gerenciados pelo Project Wiz (ex: criar ou atualizar issues internas, postar em canais de discussão do projeto dentro da plataforma). A funcionalidade atual foca na criação do projeto e no trabalho dos agentes *dentro* dos arquivos do projeto.
