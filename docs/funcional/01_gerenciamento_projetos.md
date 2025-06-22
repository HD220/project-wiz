# Gerenciamento de Projetos

O Project Wiz permite aos usuários gerenciar seus projetos de software de forma centralizada.

## Funcionalidades Principais:

1.  **Criação de Projetos:**
    *   Usuários podem criar novos projetos de software dentro do Project Wiz.
    *   Na criação, o sistema pode inicializar uma estrutura de pastas base para o projeto, como:
        *   `source-code/`: Para o código fonte principal.
        *   `docs/`: Para documentação do projeto.
        *   `worktrees/` (ou similar): Para áreas de trabalho temporárias ou específicas de Jobs dos Agentes.
    *   Um repositório Git é inicializado automaticamente na raiz do novo projeto.

2.  **Configuração de Projetos:**
    *   Usuários podem definir e modificar configurações e parâmetros específicos para cada projeto.
    *   Cada projeto possui um `caminho_working_directory` (diretório de trabalho) principal, que é a localização base no sistema de arquivos onde os Agentes realizarão operações de código e manipulação de arquivos.

3.  **Visualização e Listagem:**
    *   A interface do usuário permite listar todos os projetos gerenciados.
    *   Os usuários podem visualizar detalhes de um projeto específico.

4.  **Contexto para Agentes:**
    *   O projeto ativo fornece contexto para os Agentes IA, incluindo o `caminho_working_directory` e informações sobre o repositório Git associado.
    *   Agentes operam no código fonte e outros artefatos dentro da estrutura do projeto.

## (Intenção Futura/Avançada) Interação de Agentes com Metadados do Projeto:
*   Agentes poderão, através de `Tools` específicas, interagir com metadados do projeto gerenciados pelo Project Wiz (ex: criar ou atualizar issues internas, postar em canais de discussão do projeto dentro da plataforma). A funcionalidade atual foca na criação do projeto e no trabalho dos agentes *dentro* dos arquivos do projeto.
