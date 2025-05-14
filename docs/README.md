Interface
Barra lateral principal:
Home (/)
Add projeto (/project/new)
Projetos arquivados (switch)
Lista projetos
Projeto 1 (/project/{projectId})
...
Na parte inferior configuração geral (/settings)

    Home (/)
        Barra lateral:
            Lista de menus
                Dashboard (/ || /dashboard)
                Tarefas (/tasks)
                Agentes (/agents)
                Integrações (/integrations)
                MCPs (/mcps)
                Analytics (/analytics)

            Lista de conversas
                Chat 1 (/chat/{chatId})
                ...

        Conteudo
            Menus
                Dashboard (/ || /dashboard): Overview de todos os projetos
                Tarefas (/tasks): Tarefas em andamento em todos projetos
                Agentes (/agents): Lista de agentes da fabrica
                Forum (/project/{projectId}/forum): Forum de todos projetos
                Integrações (/integrations): Configurações para integrações sistemas externos (github, confluence, etc.)
                MCPs (/mcps): Tela para configuração de servidores MCP que habilitam tools para os agentes
                Analytics (/analytics): Relatórios de analise
            Conversa
                Chat 1 (/chat/{chatId}): Conversa com agente ou grupo de agentes, com opção de enviar mensagens

    Projeto (/project/{projectId})
        Barra Lateral:
            Lista de menus
                Dashboard (/project/{projectId} || /project/{projectId}/dashboard): Overview do projeto
                Tarefas (/project/{projectId}/tasks): Tarefas do projeto
                Forum (/project/{projectId}/forum): Forum do projeto
                Documentation (/project/{projectId}/documentation): Documentação do projeto
                Analytics (/project/{projectId}/analytics): Relatorios de analise

            Lista de canais
                channel 1 (/project/{projectId}/channel/{channelId})
                - Pode ter um agrupador de canais para listagem
        Conteudo
            Menu
            Conversa
