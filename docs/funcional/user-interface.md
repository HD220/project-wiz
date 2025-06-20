# User Interface

Project Wiz features a user interface, built with React (vite), designed to be intuitive and facilitate interaction with its core functionalities. The UI is inspired by platforms like Discord, aiming for a familiar user experience.

## Key Functional Aspects & Supporting Components:

- **Interaction with Projects:**
    - Users can view, create, and manage their projects.
    - Supported by components like: `project-card.tsx`, `project-detail-page.tsx`, `project-list-page.tsx`, `project-form.tsx`.
- **Interaction with Personas (AI Agents):**
    - Users can define, configure, and likely monitor Personas.
    - Supported by components like: `persona-list.tsx` (seen in onboarding), potentially forms for persona creation/editing (e.g., `onboarding-page.tsx` might include this).
- **Interaction with Jobs/Activities:**
    - Users can likely create, assign, and track the progress of Jobs/Activities given to Personas.
    - Components like `job-list.tsx` (if present, or integrated into project/agent views) would support this. `activity-feed.tsx` might display ongoing job activities.
- **Communication:**
    - The UI provides means for users to communicate with Personas.
    - Supported by components like: `chat-input.tsx`, `chat-messages.tsx`, `chat-sidebar.tsx`.
- **LLM Configuration:**
    - Users can configure LLM providers and settings.
    - Supported by components like: `llm-config-form.tsx`, `llm-provider-config-page.tsx`.
- **General UI Elements:**
    - Common elements include: `button.tsx`, `input.tsx`, `modal.tsx`, `sidebar.tsx`, `navbar.tsx`, `table.tsx`, `tab.tsx`, `spinner.tsx`, `tooltip.tsx`, `dropdown.tsx`.

## Code Implementation Notes:
- The UI has a rich set of components available in `src/infrastructure/frameworks/react/components/`, indicating good coverage for core interactions like project management, persona display, chat, and LLM configuration.
- UI development follows standard React practices, likely managed with Vite.
- **Gap/Alignment:**
    - UI for interacting with the *specific Agent Tools* detailed in other documents (e.g., a UI to browse an agent's MemoryTool, or to view files manipulated by a FilesystemTool, or to see terminal output from TerminalTool) is unlikely to exist if the backend tools themselves are not implemented. The existing UI focuses on managing the primary entities (Projects, Personas, Jobs) and communication.
    - The presence of `CreateUserUseCase` in the backend suggests user accounts are a concept, so login/registration UI components (`login-form.tsx`, `signup-form.tsx`) are also likely present or planned.

*(Specific UI elements and detailed flows will be documented based on visual analysis and code inspection in later phases.)*
