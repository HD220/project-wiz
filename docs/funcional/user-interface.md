# User Interface

Project Wiz features a user interface, built with React (vite), designed to be intuitive and facilitate interaction with its core functionalities. The UI is inspired by platforms like Discord, aiming for a familiar user experience.

## Key Functional Aspects & Supporting Components:

- **Interaction with Projects:**
    - Users can view, create, and manage their projects. Functionality for forms is likely integrated into project creation and detail pages.
    - Supported by components like: `project-card.tsx`, `project-list-page.tsx`.
    - Páginas de detalhe de projeto (`project-detail-page.tsx`) podem incluir abas para Visão Geral (`project-overview-tab.tsx`), Tarefas (`project-tasks-tab.tsx`), Discussões (`project-discussions-tab.tsx`) e Equipe (`project-team-tab.tsx`).
- **Interaction with Personas (AI Agents):**
    - Users can define, configure, and likely monitor Personas.
    - Supported by components like: `persona-list.tsx` (seen in onboarding), `onboarding/user-info-form.tsx`, potentially forms for persona creation/editing (e.g., `onboarding-page.tsx` might include this).
- **Interaction with Jobs/Activities:**
    - Usuários podem acompanhar atividades e o progresso de Jobs/Tasks. Isso pode ser suportado por componentes como `dashboard/user-dashboard.tsx` (para uma visão geral das atividades), `projects/details/project-tasks-tab.tsx` (para tarefas dentro de um projeto específico), e `dashboard/activity-list-item.tsx` (para itens individuais em um feed de atividades).
- **Communication:**
    - The UI provides means for users to communicate with Personas.
    - Supported by components like: `chat-input.tsx`, `chat-messages.tsx`, `chat/chat-thread.tsx`.
    - Sidebars específicos como `sidebar/app-sidebar.tsx` ou `sidebar/project-sidebar.tsx` podem integrar funcionalidades de navegação para threads de chat ou interações com agentes.
- **LLM Configuration:**
    - Users can configure LLM providers and settings.
    - Supported by components like: `llm-config-form.tsx` (potentially handling provider configuration within the onboarding or a dedicated settings area).
- **Dashboard e Navegação Principal:**
    - A interface principal pode incluir um painel de controle do usuário (`dashboard/user-dashboard.tsx`) e múltiplos sidebars para navegação, como `sidebar/app-sidebar.tsx`, `sidebar/project-sidebar.tsx`, e `sidebar/user-sidebar.tsx`.
    - Componente `mode-toggle.tsx` para a funcionalidade de alternância de tema também está presente.
- **General UI Elements:**
    - Common elements include: `button.tsx`, `input.tsx`, `modal.tsx`, `sidebar.tsx`, `navbar.tsx`, `table.tsx`, `tab.tsx`, `spinner.tsx`, `tooltip.tsx`, `dropdown.tsx`.

## Code Implementation Notes:
- A UI possui um conjunto rico de componentes reutilizáveis (em `components/ui/`) e componentes específicos de funcionalidades (em `components/chat/`, `components/projects/`, etc.), indicando boa cobertura para interações centrais como gerenciamento de projetos, exibição de personas, chat e configuração de LLM.
- UI development follows standard React practices, likely managed with Vite.
- **Gap/Alignment:**
    - UI for interacting with the *specific Agent Tools* detailed in other documents (e.g., a UI to browse an agent's MemoryTool, or to view files manipulated by a FilesystemTool, or to see terminal output from TerminalTool) is unlikely to exist if the backend tools themselves are not implemented. The existing UI focuses on managing the primary entities (Projects, Personas, Jobs) and communication.
    - The presence of `CreateUserUseCase` in the backend suggests user accounts are a concept, so login/registration UI components (`login-form.tsx`, `signup-form.tsx`) are also likely present or planned.

*(Specific UI elements and detailed flows will be documented based on visual analysis and code inspection in later phases.)*
