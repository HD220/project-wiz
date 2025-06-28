# Interface de Usuário (UI) e Experiência do Usuário (UX)

O Project Wiz é uma aplicação desktop (Electron) com uma interface de usuário (UI) construída em React. A experiência do usuário (UX) é projetada para ser intuitiva, inspirando-se em plataformas de comunicação modernas como o Discord, para facilitar a interação com Agentes IA e o gerenciamento de projetos e tarefas.

## Funcionalidades e Componentes Chave da UI (Confirmados e Inferidos do Código):

1.  **Aplicação Desktop Integrada:**
    *   Electron com comunicação IPC entre o frontend (React, processo de renderização) e o backend (Node.js, processo principal).

2.  **Interação Principal via Chat:**
    *   Realizada através de componentes como `ChatThread` (encontrado em `src/infrastructure/frameworks/react/components/chat/chat-thread.tsx`) e a página de DM (`src/infrastructure/frameworks/react/pages/(logged)/user/dm/$id/index.tsx`).
    *   Agentes respondem no chat, apresentam planos, pedem aprovações, fornecem atualizações e resultados.
    *   **Suporte a Markdown:** As mensagens no chat suportam renderização de Markdown (componente `MarkdownRenderer` existe), com sanitização para segurança.

3.  **Gerenciamento de Projetos:**
    *   **Listagem e Criação:** A página `src/infrastructure/frameworks/react/pages/(logged)/project/index.tsx` renderiza `ProjectListPage` (de `src/infrastructure/frameworks/react/components/projects/project-list-page.tsx`), que lida com a listagem. A criação é iniciada a partir desta interface, invocando `CreateProjectUseCase`.
    *   **Painel de Detalhes do Projeto:** O componente `ProjectDetailPage` (em `src/infrastructure/frameworks/react/components/projects/project-detail-page.tsx`) exibe detalhes do projeto, possivelmente com abas para visão geral, tarefas, discussões, etc.
    *   Componentes visuais como `project-card.tsx` são usados para resumos.

4.  **Gerenciamento de Personas (Agentes IA) e Configuração de Agentes:**
    *   **Listagem e Seleção de Personas:** O componente `PersonaList` (em `src/infrastructure/frameworks/react/components/onboarding/persona-list.tsx`) permite listar e selecionar `AgentPersonaTemplate`.
    *   **Criação/Configuração:** Formulários para criar novos `AgentPersonaTemplate` (via `CreatePersonaUseCase`) e para criar/configurar instâncias de `Agent` (vinculando Persona a LLM Config via `CreateAgentUseCase`) são esperados.

5.  **Configuração de LLM:**
    *   Interface para configurar os provedores de LLM (ex: inserir chaves de API). O componente `llm-config-form.tsx` (em `src/infrastructure/frameworks/react/components/onboarding/llm-config-form.tsx`) suporta isso, provavelmente usando `CreateLLMProviderConfigUseCase`.

6.  **Acompanhamento de Jobs/Atividades:**
    *   Visualizações para que o usuário possa acompanhar o status e o progresso dos Jobs.
    *   O componente `activity-list-item.tsx` (em `src/infrastructure/frameworks/react/components/dashboard/activity-list-item.tsx`) é usado para exibir itens individuais em um feed de atividades ou lista de Jobs, provavelmente dentro do `user-dashboard.tsx`.

7.  **Navegação e Layout Geral:**
    *   A UI é inspirada no layout do Discord:
        *   **Sidebars:** Componentes como `app-sidebar.tsx`, `project-sidebar.tsx`, `user-sidebar.tsx` (em `src/infrastructure/frameworks/react/components/sidebar/`) gerenciam a navegação.
        *   **Área de Conteúdo Principal:** Onde os detalhes do projeto, chat, ou configurações são exibidos.
    *   **Roteamento:** Gerenciado por TanStack Router (configurado em `src/infrastructure/frameworks/react/pages/__root.tsx` e arquivos de rota).

8.  **Componentes de UI Reutilizáveis:**
    *   Um extenso conjunto de componentes de UI padrão e estilizados (ex: `button.tsx`, `input.tsx`, `card.tsx`, `modal.tsx`, `table.tsx`, `tabs.tsx`, `spinner.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`) está presente em `src/infrastructure/frameworks/react/components/ui/`.
    *   Construídos com Radix UI primitives e estilizados com Tailwind CSS, seguindo convenções ShadCN UI.

9.  **Temas (Dark/Light Mode):**
    *   Suporte para alternância entre tema claro e escuro via `mode-toggle.tsx` e variáveis CSS em `globals.css`.

10. **Autenticação de Usuário:**
    *   A existência de `CreateUserUseCase` e a estrutura de rotas com grupos `(logged)` e `(public)` implicam que o sistema suporta autenticação de usuário (provavelmente com formulários como `login-form.tsx`, `signup-form.tsx`, embora não analisados em detalhe).
    *   Internacionalização (`i18n`) é suportada via LinguiJS.

## Foco na Experiência do Usuário:

*   **Intuitividade:** Facilitar a compreensão e o uso das funcionalidades complexas de IA e automação.
*   **Feedback Claro:** Fornecer feedback constante ao usuário sobre as ações dos Agentes e o status dos Jobs.
*   **Controle do Usuário:** Embora os Agentes operem autonomamente, o usuário mantém o controle final.
*   **Eficiência:** Ajudar o usuário a realizar tarefas de desenvolvimento de forma mais rápida e eficiente.

A UI é a principal porta de entrada para o poder do Project Wiz, e sua clareza e usabilidade são cruciais para o sucesso da plataforma.
