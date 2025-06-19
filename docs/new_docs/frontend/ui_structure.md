# Estrutura da Interface do Usuário (UI)

A interface da aplicação Project Wiz é projetada para navegação intuitiva e gerenciamento eficiente do fluxo de trabalho, inspirando-se no layout familiar de plataformas como o Discord. Geralmente, é organizada em três áreas hierárquicas principais:

1.  **Barra de Projetos/Servidores (Extrema Esquerda):**
    *   **Propósito:** Esta barra vertical, localizada na borda extrema esquerda da janela da aplicação, serve como a principal ferramenta de navegação para alternar entre diferentes `Projects` (Projetos). Cada `Project` pode ser pensado como um "servidor" ou um espaço de trabalho distinto. Clicar no ícone de um `Project` nesta barra carregará seu contexto específico nas áreas subsequentes da interface.

2.  **Barra de Canais e Contexto do Projeto (À Esquerda do Conteúdo Principal):**
    *   **Propósito:** Situada à direita da Barra de Projetos/Servidores, esta área é atualizada dinamicamente com base no `Project` selecionado. Seu papel primário é exibir navegação específica do projeto e informações contextuais.
    *   **Conteúdo Típico Inclui:**
        *   **Canais do Projeto:** Semelhantes a canais de chat, permitem comunicação focada, frequentemente com `Personas` específicas ou para aspectos particulares do projeto (ex: "dev-chat", "qa-updates", "general-discussion").
        *   **Seções do Projeto:** Links diretos para diferentes áreas funcionais dentro do `Project` selecionado, tais como:
            *   Tarefas (listas de `Jobs` e gerenciamento)
            *   Documentação específica do projeto
            *   Um Fórum ou painel de discussão específico do projeto
            *   Painéis de análise (analytics) específicos do projeto
            *   **Canais de Log:** Canais dedicados ou visualizações para acompanhar logs detalhados da atividade de uma `Persona` específica ou da execução de um `Job`.
        *   **Personas Ativas:** Uma lista ou representação visual das `Personas` (Agentes de IA) atualmente ativas ou atribuídas ao `Project` selecionado, potencialmente mostrando seu status.

3.  **Área de Conteúdo Principal (Centro/Direita):**
    *   **Propósito:** Esta é a maior e mais dinâmica parte da interface. Exibe o conteúdo detalhado selecionado tanto da Barra de Projetos/Servidores quanto da Barra de Canais e Contexto do Projeto.
    *   **Exemplos de Conteúdo:**
        *   **Interface de Chat:** Quando um canal de comunicação é selecionado, esta área mostra o histórico da conversa e campos de entrada para interagir com `Personas` ou outros usuários.
        *   **Dashboards:** Exibe dashboards globais ou específicos do projeto com métricas chave, gráficos e resumos.
        *   **Listas de Tarefas (Jobs):** Mostra listas detalhadas de `Jobs`, seus status, responsáveis (a `Persona` que o criou), e permite interações como visualizar detalhes do `Job`.
        *   **Painéis de Configuração:** Ao acessar configurações da aplicação ou do projeto, esta área apresenta as várias opções de configuração.
        *   **Visualizações de Interação com Persona:** Interfaces específicas para configurar `Personas`, monitorar sua atividade detalhada ou revisar seus resultados.
        *   **Visualizações de Documentação:** Renderiza documentação do projeto ou conteúdo de ajuda.
        *   **Tópicos de Fórum/Discussão:** Exibe tópicos de discussão e respostas.

Esta estrutura de três níveis visa fornecer uma clara separação de responsabilidades, permitindo que os usuários naveguem facilmente entre projetos de alto nível, contextos específicos de projetos e visualizações de conteúdo detalhado.
