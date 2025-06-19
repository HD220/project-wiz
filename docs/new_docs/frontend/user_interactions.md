# Interações do Usuário

Este documento descreve as principais formas como os usuários interagem com a aplicação Project Wiz para gerenciar seus fluxos de trabalho de desenvolvimento de software com Personas de IA.

## Navegando pelas Visualizações Principais

A aplicação fornece várias visualizações primárias para os usuários acessarem diferentes níveis de informação e controle:

*   **Home (Visão Geral Global):**
    *   Serve como o principal ponto de entrada, oferecendo uma visão consolidada de todos os projetos.
    *   **Acesso ao Dashboard Global:** Visualizar estatísticas de alto nível, status gerais de projetos e atividades recentes em todos os projetos.
    *   **Gerenciamento Consolidado de Tarefas:** Visualizar e gerenciar `Jobs` (tarefas criadas por Personas) em andamento de todos os projetos de forma centralizada.
    *   **Gerenciamento de Personas:** Acessar a seção "Agentes (Personas) da Fábrica" para listar, criar, gerar e configurar todas as `Personas` disponíveis no sistema.
    *   **Integrações:** Configurar e gerenciar integrações em todo o sistema com ferramentas externas (ex: GitHub, Jira).
    *   **MCPs (Programas de Controle Mestre):** Configurar servidores MCP que habilitam e gerenciam o acesso das `Personas` às suas `Tools` (ferramentas).
    *   **Analytics Globais:** Visualizar relatórios agregados sobre produtividade, desempenho das `Personas` e progresso geral dos projetos.
    *   **Chat Global:** Participar de comunicações gerais do sistema ou interagir com `Personas` fora de contextos específicos de projeto.

*   **Visualização por Projeto (Contexto por Projeto):**
    *   Acessada selecionando um projeto específico na Barra de Projetos/Servidores.
    *   **Acesso ao Dashboard do Projeto:** Visualizar métricas, status e atividades recentes específicas do projeto selecionado.
    *   **Gerenciamento de Tarefas Específico do Projeto:** Gerenciar e acompanhar `Jobs` atribuídos às `Personas` dentro do escopo deste projeto.
    *   **Fórum do Projeto:** Participar de discussões e colaborações relacionadas ao projeto.
    *   **Documentação do Projeto:** Acessar e gerenciar a documentação técnica e de negócios associada ao projeto.
    *   **Analytics do Projeto:** Revisar relatórios de desempenho e análises específicas do projeto.
    *   **Canais do Projeto:** Usar canais de chat dedicados para interações focadas com `Personas` trabalhando no projeto ou para anúncios específicos do projeto.
    *   **Configurações do Projeto:** Configurar detalhes específicos do projeto, como repositórios associados, membros (usuários e `Personas`), etc.

*   **Configurações da Aplicação:**
    *   Tipicamente acessadas através de um ícone de configurações dedicado ou menu.
    *   **Gerenciamento do Perfil do Usuário:** Atualizar informações pessoais, avatar, etc.
    *   **Gerenciamento da Conta:** Lidar com detalhes de login, configurações de segurança.
    *   **Preferências de Notificação:** Personalizar como e quando receber notificações sobre eventos na aplicação.
    *   **Tema da Interface:** Selecionar temas visuais (ex: modo claro/escuro).
    *   **Configurações de LLM:** Gerenciar configurações globais para provedores de Modelos de Linguagem Amplos (LLMs), se aplicável.

## Gerenciamento de Projetos

Usuários podem gerenciar seus projetos de software através das seguintes interações:

*   **Alternar Entre Projetos:** Clicar nos ícones de projeto na Barra de Projetos/Servidores à extrema esquerda.
*   **Criar Novos Projetos:**
    *   Iniciar a criação de projetos, potencialmente a partir da visão Home.
    *   Opção de criar projetos do zero ou vinculando-os a repositórios GitHub existentes.
*   **Configurar Definições do Projeto:**
    *   Dentro de uma Visualização de Projeto, acessar configurações para vincular/atualizar repositórios de código.
    *   Gerenciar membros do projeto, atribuindo papéis a usuários humanos e `Personas` de IA.

## Gerenciamento de Personas (Agentes)

Gerenciar `Personas` de IA é um aspecto central do Project Wiz:

*   **Acessar Lista de Personas:** Navegar para a seção "Agentes (Personas) da Fábrica" na visão Home para ver todas as `Personas`.
*   **Criar/Gerar Novas Personas:**
    *   Definir um **Nome** único para a `Persona`.
    *   Especificar seu **Papel** primário (ex: Engenheiro de Software, Analista de QA).
    *   Delinear seus **Objetivos** gerais.
    *   Fornecer um **Histórico (Backstory)** para influenciar seu estilo operacional ou áreas de conhecimento.
*   **Configurar Personas:**
    *   Selecionar o **provedor de LLM e modelo específico** que a `Persona` usará.
    *   Ajustar **parâmetros do LLM** como temperatura para refinar seu comportamento (planejado).
    *   **Habilitar ou desabilitar `Tools` específicas** para controlar suas capacidades e permissões.
    *   Potencialmente fornecer **conhecimento específico ou contexto** relevante para suas tarefas (funcionalidade avançada planejada).

## Gerenciamento de Jobs (Tarefas das Personas)

Usuários direcionam o trabalho das `Personas` principalmente através da interação, e então monitoram os `Jobs` que as `Personas` criam e executam:

*   **Acessar Listas de Jobs:**
    *   Visualizar uma lista consolidada de todos os `Jobs` (criados pelas Personas) na visão Home.
    *   Visualizar `Jobs` específicos do projeto na seção "Tarefas" ou "Atividades" de uma Visualização de Projeto.
*   **(Nota: A criação direta de Jobs por formulário pelo usuário foi removida. A criação de Jobs é uma ação da Persona em resposta a uma conversa/solicitação do usuário - ver "Interação com Personas" abaixo).**
*   **Gerenciar Prioridade de Jobs:** Embora a prioridade detalhada seja gerenciada dinamicamente pela `Persona` para seus próprios `Jobs`, o usuário pode influenciar isso ao discutir a urgência de uma tarefa ou projeto em chat com a `Persona`.
*   **Monitorar Progresso e Detalhes de Jobs:**
    *   Visualizar o **Status** atual dos `Jobs` (ex: Pendente, Aguardando Dependência, Em Execução, Concluído, Falhou, Atrasado).
    *   Acessar **Logs de Execução** (potencialmente em Canais de Log dedicados) para informações detalhadas passo a passo da `Persona`.
    *   Revisar **Resultados/Artefatos** após a conclusão de um `Job`.
    *   Visualizar **Dependências e Hierarquias:** Ver como os `Jobs` estão conectados, talvez através de listas nos detalhes do `Job`, um grafo visual ou uma visualização de linha do tempo.
*   **Receber Notificações:** Receber alertas sobre mudanças significativas no status dos `Jobs` (ex: conclusão, falha, bloqueado por dependência).

## Interação com Personas

A interação direta com as Personas (Agentes) é o principal meio de iniciar e gerenciar trabalho no Project Wiz:

*   **Iniciando Trabalho via Chat (Criação Conversacional de Jobs):**
    *   O usuário descreve uma necessidade, um objetivo de projeto, ou uma tarefa específica em uma conversa (chat) com uma `Persona`.
    *   A `Persona`, utilizando seu LLM configurado, analisa a solicitação do usuário.
    *   Com base nessa análise, a `Persona` pode decidir criar um ou mais `Jobs` para si mesma para atender ao pedido. Ela define os detalhes desses `Jobs`, como o tipo de tarefa, o "payload" (carga de dados) inicial (baseado na conversa), e possíveis dependências com outros `Jobs` que ela já esteja gerenciando.
    *   A UI não apresenta um formulário tradicional de "Criar Job"; a criação é uma consequência da interação inteligente com a `Persona`.
*   **Fornecendo Instruções e Contexto:**
    *   Dar instruções adicionais ou fornecer contexto para `Jobs` em andamento diretamente à `Persona` via chat.
    *   Pedir esclarecimentos sobre o progresso de um `Job` ou o plano de ação da `Persona`.
*   **Recebendo Notificações e Resultados:**
    *   Receber notificações, atualizações de status de `Jobs`, e resultados/artefatos diretamente das `Personas` no chat ou em canais de projeto.
*   **Visibilidade da Comunicação Inter-Persona:** Usuários podem ter visibilidade (ex: em Canais de Projeto dedicados ou no Fórum do projeto) de comunicações relevantes entre diferentes `Personas`, caso elas estejam colaborando em tarefas complexas. As `Personas` utilizam `Tools` específicas para enviar mensagens a outros Agentes, postar em canais ou atualizar tópicos de fórum.
*   **Respondendo a Solicitações da Persona:** `Personas` podem proativamente pedir ao usuário mais informações, clarificações sobre requisitos, ou aprovação para passos críticos durante a execução de um `Job`, tudo através da interface de chat.
*   **Cancelando/Interrompendo Jobs:** O usuário pode, através de uma conversa com a `Persona` responsável ou por uma ação na UI (se disponível para `Jobs` em andamento), solicitar o cancelamento ou interrupção de um `Job`.

## Monitoramento, Erros e Analytics

*   **Apresentação de Erros:**
    *   Erros específicos de `Jobs` são exibidos claramente no contexto do `Job` (ex: em sua visualização de detalhes ou log).
    *   Erros em nível de aplicação podem aparecer como notificações dispensáveis ou "toasts", com links para mais detalhes, se disponíveis.
    *   Indicadores visuais (ex: codificação por cores, ícones) são usados para denotar estados de erro.
*   **Analytics e Métricas:**
    *   As seções de "Analytics" (Global e Específico do Projeto) fornecem insights sobre:
        *   Taxas de conclusão de `Jobs`, tempos médios de execução, taxas de falha.
        *   Níveis de atividade das `Personas`, número de `Jobs` processados, `Tools` mais frequentemente usadas.
        *   Estatísticas da `Queue` (Fila) (ex: número de `Jobs` pendentes, tempos de espera).
*   **Status e Atividade da Persona:**
    *   Semelhante ao Discord, usuários podem ver o status atual de uma `Persona` (ex: Ativa, Ociosa, Processando Job X).
    *   O perfil da `Persona` ou uma visualização dedicada pode mostrar sua fila de `Jobs` atual/histórico de `Jobs` recentemente processados.

## Filosofia de Componentes da UI

*   O desenvolvimento da interface do Project Wiz enfatiza a criação de componentes de UI específicos e reutilizáveis para seus conceitos centrais (ex: cards de `Job`, perfis de `Persona`, listas de tarefas). Isso segue o Princípio da Responsabilidade Única, promovendo a manutenibilidade e uma experiência de usuário consistente. Estes componentes são construídos sobre bibliotecas fundamentais (como aquelas que inspiram shadcn/ui) e estilizados com Tailwind CSS.
