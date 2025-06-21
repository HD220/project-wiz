# Interface de Usuário (UI) e Experiência do Usuário (UX)

O Project Wiz é uma aplicação desktop (Electron) com uma interface de usuário (UI) construída em React. A experiência do usuário (UX) é projetada para ser intuitiva, inspirando-se em plataformas de comunicação modernas como o Discord, para facilitar a interação com Agentes IA e o gerenciamento de projetos e tarefas.

## Funcionalidades e Componentes Chave da UI:

1.  **Aplicação Desktop Integrada:**
    *   Sendo uma aplicação Electron, o Project Wiz combina a robustez de uma aplicação nativa (acesso ao sistema de arquivos, execução de processos locais) com tecnologias web modernas para a UI.
    *   A comunicação entre o frontend (React, processo de renderização) e o backend (Node.js, processo principal do Electron) ocorre via IPC (Inter-Process Communication).

2.  **Interação Principal via Chat:**
    *   A forma primária de interação do usuário com as Personas (Agentes IA) é através de uma interface de chat.
    *   Usuários podem enviar mensagens de texto descrevendo suas necessidades, objetivos ou comandos.
    *   Agentes respondem no chat, apresentam planos, pedem aprovações, fornecem atualizações e resultados.
    *   **Suporte a Markdown:** As mensagens no chat suportam renderização de Markdown para melhor formatação de texto, listas, blocos de código (com syntax highlighting), links, etc. O conteúdo Markdown é sanitizado para segurança.

3.  **Gerenciamento de Projetos:**
    *   **Listagem e Criação:** UI para listar projetos existentes e criar novos projetos.
    *   **Painel de Detalhes do Projeto:** Uma visualização detalhada para cada projeto, que pode incluir abas como:
        *   Visão Geral do Projeto.
        *   Tarefas/Jobs do Projeto.
        *   Discussões/Canais do Projeto.
        *   Configurações do Projeto.
    *   Componentes visuais como `project-card.tsx` para resumos e `project-list-page.tsx`, `project-detail-page.tsx`.

4.  **Gerenciamento de Personas (Agentes IA):**
    *   **Listagem e Configuração:** UI para listar Personas existentes.
    *   Formulários para criar novas Personas e configurar seus atributos (nome, papel, objetivo, backstory, modelo LLM associado, `Tools` habilitadas).
    *   Componentes como `persona-list.tsx`.

5.  **Configuração de LLM:**
    *   Interface para configurar os provedores de LLM (ex: inserir chaves de API, selecionar modelos padrão).
    *   Componentes como `llm-config-form.tsx`.

6.  **Acompanhamento de Jobs/Atividades:**
    *   Visualizações para que o usuário possa acompanhar o status e o progresso dos Jobs e Sub-Jobs que os Agentes estão executando.
    *   Pode incluir um painel de controle (`dashboard/user-dashboard.tsx`) com um feed de atividades recentes ou uma lista de Jobs por projeto ou Persona.
    *   Componentes como `dashboard/activity-list-item.tsx`.

7.  **Navegação e Layout Geral:**
    *   A UI é inspirada no layout do Discord, potencialmente com:
        *   **Sidebars:** Para navegação entre projetos, Personas, chats, configurações (ex: `sidebar/app-sidebar.tsx`, `sidebar/project-sidebar.tsx`).
        *   **Área de Conteúdo Principal:** Onde os detalhes do projeto, chat, ou configurações são exibidos.
    *   **Navbar:** Para ações globais ou navegação de topo.

8.  **Componentes de UI Reutilizáveis:**
    *   Um conjunto de componentes de UI padrão e estilizados (ex: `button.tsx`, `input.tsx`, `modal.tsx`, `table.tsx`, `tab.tsx`, `spinner.tsx`, `tooltip.tsx`, `dropdown.tsx`) para construir as diversas telas e interações.
    *   Provavelmente construídos sobre ou inspirados por bibliotecas como Radix UI e estilizados com Tailwind CSS (conforme `package.json`).

9.  **Temas (Dark/Light Mode):**
    *   Suporte para alternância entre tema claro e escuro (`mode-toggle.tsx`).

10. **Autenticação de Usuário (Implícito):**
    *   Com a existência de `CreateUserUseCase`, espera-se que haja componentes de UI para login e registro de usuários (`login-form.tsx`, `signup-form.tsx`).

## Foco na Experiência do Usuário:

*   **Intuitividade:** Facilitar a compreensão e o uso das funcionalidades complexas de IA e automação.
*   **Feedback Claro:** Fornecer feedback constante ao usuário sobre o que os Agentes estão fazendo, o status dos Jobs e quaisquer problemas ou necessidade de intervenção.
*   **Controle do Usuário:** Embora os Agentes operem autonomamente, o usuário mantém o controle final, aprovando planos, revisando resultados e podendo intervir quando necessário.
*   **Eficiência:** Ajudar o usuário a realizar tarefas de desenvolvimento de forma mais rápida e eficiente.

A UI é a principal porta de entrada para o poder do Project Wiz, e sua clareza e usabilidade são cruciais para o sucesso da plataforma.
