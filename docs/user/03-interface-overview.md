# Visão Geral da Interface do Usuário

Bem-vindo à Visão Geral da Interface do Usuário do Project Wiz!

Este documento descreve as principais seções e elementos que você encontrará ao navegar pela aplicação. A interface do Project Wiz é projetada para ser familiar e intuitiva, seguindo um layout similar ao Discord.

**Foco na Experiência do Usuário (UX):**
A UI/UX do Project Wiz é guiada pelos seguintes princípios:
*   **Intuitividade:** Facilitar a compreensão e o uso das funcionalidades complexas de IA e automação.
*   **Feedback Claro:** Fornecer feedback constante ao usuário sobre as ações dos Agentes e o status dos Jobs.
*   **Controle do Usuário:** Embora os Agentes operem autonomamente, o usuário mantém o controle final e a capacidade de intervir.
*   **Eficiência:** Ajudar o usuário a realizar tarefas de desenvolvimento de forma mais rápida e eficiente.

*(Nota: Esta visão geral descreve a interface planejada para o Project Wiz, incluindo funcionalidades que podem estar em desenvolvimento ou programadas para versões futuras. A interface atual pode variar.)*

## Estrutura Principal

A interface é geralmente dividida em três áreas principais:

1.  **Barra Lateral de Servidores (Projetos):** Localizada na extrema esquerda, permite que você alterne entre os diferentes projetos (servidores) aos quais tem acesso.
2.  **Barra Lateral de Canais e Contexto do Projeto:** Uma vez dentro de um projeto, esta barra (geralmente à esquerda da área de conteúdo) exibe os canais de comunicação, seções específicas do projeto (como tarefas, documentação, fórum) e a lista de Personas (agentes) ativas no projeto.
3.  **Área de Conteúdo Principal:** É a maior seção da tela e exibe o conteúdo da seleção atual, seja um canal de chat, um dashboard de projeto, uma lista de tarefas, configurações, ou a interface de interação com uma Persona.

## Seções Detalhadas da Interface

A seguir, detalhamos as funcionalidades encontradas nas principais visualizações da aplicação:

### Home (Visão Geral Global - Acessível geralmente pela rota `/`)

Esta é a tela inicial ou painel principal que oferece uma visão agregada de todos os seus projetos e atividades.

*   **Dashboard Global:** Apresenta um overview de todos os projetos ativos, status geral e atividades recentes em toda a "fábrica de software".
*   **Tarefas Globais/Consolidadas:** Permite visualizar e gerenciar tarefas de alto nível (semelhantes a issues ou épicos) de todos os projetos de forma centralizada. Estas são as tarefas que os usuários definem para orientar o trabalho dos agentes.
*   **Agentes (Personas) da Fábrica:** Área para listar e gerenciar todas as Personas disponíveis na sua instância do Project Wiz. Aqui você poderá cadastrar ou gerar novas Personas.
*   **Integrações:** Permite configurar e gerenciar integrações com sistemas externos como GitHub, Confluence, Jira, etc., para toda a aplicação.
*   **MCP (Model Context Protocol):** (Planejado/Pesquisa) Refere-se a um protocolo conceitual, como o Model Context Protocol da Anthropic, para habilitar e gerenciar o acesso de LLMs a ferramentas e capacidades. Detalhes específicos para o Project Wiz estão em definição.
*   **Analytics Globais:** Exibe relatórios e análises sobre a produtividade geral, desempenho dos agentes e progresso dos projetos de forma consolidada.
*   **Chat Global:** Funcionalidade de chat para interagir com Personas específicas fora do contexto de um projeto, ou para comunicações gerais do sistema.

### Visão por Projeto (Acessível geralmente pela rota `/project/{projectId}`)

Quando você seleciona um projeto específico, a interface se adapta para fornecer informações e ferramentas contextuais a esse projeto.

*   **Dashboard do Projeto:** Overview com métricas, status e atividades recentes específicas do projeto selecionado.
*   **Tarefas do Projeto:** Gerenciamento das tarefas de alto nível definidas pelo usuário para o projeto (ex: funcionalidades a serem desenvolvidas, bugs a serem corrigidos, documentação a ser escrita). Similar a um sistema de issues, futuramente podendo ser integrado com plataformas como GitHub Issues ou Jira. Estas tarefas guiam os objetivos delegados aos Agentes IA.
*   **Fórum do Projeto:** Espaço dedicado para discussões, troca de ideias e colaboração entre usuários e Personas relacionadas ao projeto.
*   **Documentação do Projeto:** Acesso e gerenciamento da documentação técnica e de negócios associada ao projeto.
*   **Analytics do Projeto:** Relatórios e análises de desempenho específicos do projeto.
*   **Canais do Projeto:** Canais de comunicação (chat, logs) específicos para o contexto do projeto, permitindo interações focadas com as Personas que trabalham nele.
*   **Configurações do Projeto:** Opções específicas para configurar o projeto atual, como repositórios associados, membros (usuários e Personas), etc.
*   *(Nota: A funcionalidade de "Cadastro de Projetos", permitindo criar projetos do zero ou a partir de um repositório GitHub, também se relaciona com esta visão, embora possa ser acessada inicialmente pela "Home".)*

### Configurações Gerais da Aplicação (Acessível geralmente pela rota `/settings`)

Esta seção é dedicada às configurações globais que afetam toda a aplicação Project Wiz.

*   **Perfil do Usuário:** Personalização de avatar, informações de perfil, etc.
*   **Gerenciamento de Conta:** Detalhes de login, segurança.
*   **Preferências de Notificação:** Como você deseja ser notificado sobre eventos na aplicação.
*   **Tema da Interface:** Opções de personalização visual (ex: modo claro/escuro).
*   **Configurações de Modelos de Linguagem (LLM):** Configurações globais para os provedores de LLM, se aplicável.

## Conclusão

Esta visão geral fornece um mapa básico da interface do Project Wiz. Cada seção mencionada possui funcionalidades ricas que serão exploradas em detalhes em outros guias.

Para aprender sobre os primeiros passos práticos com a aplicação, consulte o [Guia de Início Rápido](./02-getting-started.md). Se você quiser entender como gerenciar seus projetos, siga para o guia [Gerenciando Projetos](./core-concepts/projects.md).

Este documento será expandido e atualizado conforme a interface do usuário evolui.
