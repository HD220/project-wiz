# Core Concept: Gerenciando Projetos

No Project Wiz, um **Projeto** é o principal espaço de trabalho onde seus Agentes de Inteligência Artificial (Personas) operam. Pense nele como um contêiner dedicado para cada iniciativa de software ou repositório em que você está trabalhando.

Este guia detalha como você pode criar, configurar e gerenciar seus projetos dentro do Project Wiz.

## O que é um Projeto no Project Wiz?

Dentro de um projeto, você pode:

*   **Definir o Escopo:** Clarificar os objetivos e limites do trabalho de desenvolvimento.
*   **Atribuir Personas:** Designar Agentes de IA específicos para realizar tarefas dentro do contexto do projeto.
*   **Gerenciar Jobs:** Criar, monitorar e gerenciar tarefas (Jobs) que as Personas executarão.
*   **Estrutura Organizada:** Cada projeto tem sua própria estrutura de arquivos gerenciada pelo Project Wiz, incluindo áreas para código-fonte, documentação e arquivos de trabalho dos agentes.
*   **Controle de Versão:** Projetos são inicializados com um repositório Git, facilitando o rastreamento de mudanças desde o início.
*   *(Planejado)* **Colaboração:** Funcionalidades futuras podem incluir espaços para discussão (Fórum) e acompanhamento de progresso (Analytics) específicos do projeto.

## Criando um Novo Projeto

Você normalmente encontrará a opção para adicionar um novo projeto na área principal ou "Home" da aplicação Project Wiz.

Ao criar um novo projeto:

1.  **Informações Iniciais:** Você fornecerá um **Nome** para o projeto e, opcionalmente, uma **Descrição** mais detalhada.
2.  **Criação Automática:** O Project Wiz então:
    *   Gera um `ID de Projeto` único para identificação interna.
    *   Cria uma entidade de `Projeto` no sistema com o nome e a descrição fornecidos.
    *   No seu sistema de arquivos, estabelece uma estrutura de pastas base dentro de um diretório nomeado com o `ID de Projeto`. Essa estrutura geralmente inclui:
        *   `source-code/`: Para o código-fonte principal do seu software.
        *   `source-code/docs/`: Para a documentação específica do código do projeto (diferente da documentação do Project Wiz em si).
        *   `worktrees/`: Para áreas de trabalho temporárias ou específicas que os Agentes utilizam ao executar Jobs.
    *   Inicializa um repositório Git dentro da pasta `source-code/`.
    *   Registra informações sobre os caminhos do código-fonte e da documentação do projeto.

*(Nota: Funcionalidades futuras podem incluir a criação de projetos a partir de repositórios GitHub existentes, o que facilitaria a integração com código-fonte e issues já existentes.)*

## Configurando seu Projeto

Após a criação, algumas configurações podem ser ajustadas (geralmente acessíveis através de uma visão detalhada ou painel de configurações do projeto):

*   **Informações Básicas:** Editar o nome e a descrição do projeto.
*   *(Planejado)* **Repositórios Associados:** Vincular ou atualizar links para repositórios de código externos (ex: GitHub, GitLab).
*   *(Planejado)* **Membros e Personas:**
    *   Convidar outros usuários humanos para colaborar (se a funcionalidade de equipe estiver disponível).
    *   Atribuir ou desatribuir Personas (Agentes de IA) para trabalhar especificamente neste projeto.
*   *(Planejado)* **Configurações de Integração:** Definir como o projeto interage com ferramentas externas, se aplicável.

## Contexto para Agentes

O projeto ativo fornece o contexto essencial para os Agentes IA, incluindo:

*   O **caminho do diretório de trabalho principal** (a pasta `source-code/` do projeto).
*   Informações sobre o repositório Git associado.

Os Agentes operam no código-fonte e outros artefatos dentro da estrutura definida do projeto.

## Próximos Passos

*   **Personas e Agentes IA:** Aprenda a criar e configurar os [Agentes de IA (Personas)](./personas-and-agents.md) que darão vida ao seu projeto.
*   **Jobs e Automação:** Descubra como definir e delegar trabalho através do sistema de [Jobs e Automação](./jobs-and-automation.md).
*   **Visão Geral da Interface:** Se ainda não o fez, familiarize-se com a [Interface do Usuário](../03-interface-overview.md) do Project Wiz.

Este guia será atualizado à medida que as funcionalidades de gerenciamento de projetos forem evoluindo.
