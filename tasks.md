# Project Wiz Frontend Migration Tasks

This document outlines the tasks required to migrate the legacy React frontend to a new application using Vite, Shadcn/UI, and Tanstack Router.

## Phase 1: Initial Analysis and Task Definition

### 1.1. Configuration Analysis
- [X] **Task 1.1.1:** Analyze `package.json` to identify all dependencies (production and development), scripts (build, start, test, lint, etc.), and project metadata.
    - *Sub-task:* Documented existing dependencies. Key findings:
        - Already uses Vite, React, Tailwind CSS, Radix UI, Tanstack Router, LinguiJS, React Hook Form, Zod. This aligns well with the target stack.
        - Shadcn/UI is not explicitly listed but its building blocks (Radix, Tailwind) are present.
        - `react-router-dom` is present alongside `Tanstack Router` - needs clarification.
        - No explicit global state manager like Redux/Zustand identified yet; Tanstack Query not explicitly listed.
    - *Sub-task:* Dependencies to be "replaced" are minimal as the stack is quite aligned. The main effort is adopting Shadcn/UI conventions over custom Radix implementations and ensuring Tanstack Router is the sole routing solution.
    - *Sub-task:* Most UI-related dependencies can be carried over. Versions should be checked for compatibility with the latest Shadcn/UI and Tanstack Router.
    - *Sub-task:* NPM scripts are Vite/Electron Forge based. These will be similar for the new application, possibly with adjustments if the new app is a separate module/package.
- [X] **Task 1.1.2:** Analyze Vite configuration files (`vite.renderer.config.mts`, `vite.main.config.mts`, `vite.preload.config.mts`) to understand the existing build process for the Electron renderer.
    - *Sub-task:* Analyzed `vite.renderer.config.mts`. Key findings:
        - Plugins: Tanstack Router (`routesDirectory: "./src/infrastructure/frameworks/react/pages"`), React SWC (with Lingui SWC plugin), TailwindCSS Vite, Lingui Vite.
        - Aliases for renderer: `@/refactored` -> `./src_refactored`, `@/components` -> `./src/infrastructure/frameworks/react/components`, `@/ui` -> `./src/infrastructure/frameworks/react/components/ui`, `@/lib`, `@/hooks`, `@/application`, `@/shared`, `@` -> `./src`.
    - *Sub-task:* Analyzed `vite.main.config.mts` and `vite.preload.config.mts`.
        - Main config externals: `better-sqlite3`.
        - Aliases for main/preload: `@/refactored`, `@/core`, `@/shared`, `@`.
        - No explicit env variable loading found in Vite configs; may be handled by Electron Forge or scripts.
    - *Sub-task:* This analysis confirms the tech stack and provides a template for the new Vite project's configuration (especially for the renderer), which will need its own paths for routes and aliases.
- [X] **Task 1.1.3:** Analyze Babel configuration.
    - *Sub-task:* Confirmed SWC (via `@vitejs/plugin-react-swc` in `vite.renderer.config.mts`) is used for React frontend transpilation. No root Babel config files (`.babelrc`, `babel.config.js`) found. Babel is not a primary concern for the new Vite-based React frontend.
- [X] **Task 1.1.4:** Analyze ESLint configuration (`eslint.config.js` based on `ls` output) and any Prettier setup.
    - *Sub-task:* Analyzed `eslint.config.js`. Key findings:
        - Uses ESLint flat config.
        - Plugins: `@typescript-eslint/eslint-plugin`, `eslint-plugin-import`, `eslint-plugin-vitest`.
        - Extends `eslint:recommended`, `plugin:@typescript-eslint/recommended`.
        - Strict rules for `no-explicit-any`, `naming-convention`.
        - Rules aligned with Object Calisthenics: `max-depth`, `no-else-return`, `max-lines-per-function` (15 lines), `max-statements` (10), `max-lines` (200 for .ts, 250 for .tsx, 100 for core domain/app).
        - `import/order` is configured with path groups for project aliases.
        - Ignores `src2/` and large parts of the original `src/` directory, focusing on `src_refactored/` or specific new code.
    - *Sub-task:* The new frontend project should adopt this ESLint configuration. Prettier usage is implied but not explicitly configured in ESLint; will assume it's run separately or via editor integration.
- [X] **Task 1.1.5:** Analyze `tsconfig.json` (root, `src2/tsconfig.json`, `src2/tsconfig.app.json`, `src2/tsconfig.node.json`) for TypeScript settings.
    - *Sub-task:* Analyzed TypeScript configurations. Key findings:
        - Root `tsconfig.json`: Targets ESNext, module ESNext, bundler resolution, strict, JSX react-jsx, extensive path aliases for `src/` and `src_refactored/`. Includes `experimentalDecorators`. `noEmit: false`.
        - `src2/tsconfig.app.json` (legacy app): Targets ES2020, module ESNext, bundler resolution, strict, JSX react-jsx, `noEmit: true`. More typical for a Vite renderer.
        - The new frontend's `tsconfig.json` should be based on modern practices (like root or `src2/tsconfig.app.json` for renderer parts), ensuring `strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, and appropriate `target`/`module`. `noEmit: true` is standard for Vite projects. Path aliases will need to be specific to the new project. `experimentalDecorators` likely not needed for frontend.
    - *Sub-task:* Plan for `tsconfig.json` in the new Vite project:
        - Set `target` to ESNext or similar modern target.
        - `module` to ESNext.
        - `moduleResolution` to `bundler`.
        - `jsx` to `react-jsx`.
        - `strict` to `true`.
        - `noEmit` to `true`.
        - `skipLibCheck` to `true`.
        - Define relevant `paths` for the new project structure.
        - Include appropriate `lib` (e.g., ["DOM", "DOM.Iterable", "ESNext"]).
        - `types` should include `vite/client` and testing types like `vitest`.
- [X] **Task 1.1.6:** Investigate the usage of `react-router-dom` alongside `@tanstack/react-router` (from `package.json` analysis).
    - *Sub-task:* `react-router-dom` is listed as a dependency in `package.json`. However, grep searches for direct imports (e.g., `from "react-router-dom"`) did not yield any results in the codebase.
    - *Sub-task:* `@tanstack/react-router` is also a dependency and its Vite plugin is actively configured, pointing to route generation within `src/infrastructure/frameworks/react/`. This strongly suggests Tanstack Router is the active routing solution.
    - *Sub-task:* Strategy: The new application will exclusively use Tanstack Router as per requirements. `react-router-dom` appears to be an unused or transitive dependency; its removal could be considered as a cleanup task later.
- [X] **Task 1.1.7:** Investigate current global state management solution (if any beyond local state/Context) and server state fetching.
    - *Sub-task:* Searched for common global state libraries (Redux, Zustand, Jotai) and Tanstack Query. No direct imports or dependencies found for these in `package.json` or via grep.
    - *Sub-task:* This suggests global state (if any significant amount exists) is likely managed via React Context API or custom solutions. Server state is likely handled via direct `fetch`/IPC calls or custom hooks, not Tanstack Query.
    - *Sub-task:* Plan for the new app:
        - Implement Tanstack Query for server state management (fetching, caching, synchronization).
        - Use React Context for simple global client state.
        - Consider Zustand or Jotai if complex global client state needs are identified during deeper code analysis.

### 1.2. Documentation Review
- [ ] **Task 1.2.1:** Review all Markdown files (`.md`) in the `docs/` directory and repository root.
    - *Sub-task:* Read `docs/funcional/00_visao_geral_sistema.md`. Identified key UI areas:
        - Chat interface for agent interaction.
        - Display for agent-generated plans and "Definition of Ready".
        - Job progress tracking views (lists, dashboards).
        - UI for presenting job results.
        - Project management UI (create, list, organize).
        - Persona/Agent management UI (define templates, create instances, link to LLMs).
        - Job/Queue system UI (view jobs, status, dependencies).
        - LLM configuration UI.
        - Potential visibility for Agent Tools.
    - *Sub-task:* Reviewed `docs/funcional/01_gerenciamento_projetos.md` through `07_interface_usuario_ux.md`. These documents confirm and detail the UI components and functionalities. `07_interface_usuario_ux.md` is particularly rich, providing paths to existing React components in `src/infrastructure/frameworks/react/components/` and `src/infrastructure/frameworks/react/pages/` for chat, project management, persona management, LLM config, dashboards, sidebars, and common UI elements (button, input, etc.). This provides a strong map to the legacy UI structure.
    - *Sub-task:* Reviewed `docs/tecnico/visual_style_guide.md`. Confirmed Tailwind CSS, Shadcn/UI conventions, dual-theme (light/dark) via CSS variables in `globals.css`, specific color palette, typography, spacing, and component style examples (button, card, input). This is a key document for visual replication.
    - *Sub-task:* Reviewed `docs/tecnico/requisitos.md`. Extracted detailed Functional Requirements (RFs) for UI (RF-UI-001 to RF-UI-011) and noted Non-Functional Requirements (RNFs) like RNF-CMP-001 (visual identity with pre-implementation), RNF-USA-001 (usability), RNF-PER-001 (UI performance), RNF-I18N-001 (LinguiJS).
    - *Sub-task:* **Key Constraint:** RNF-CMP-001 requires the new frontend to be *visually identical* to the pre-implementation described in the visual style guide (which seems to be based on `src/`). This means the task is a faithful re-implementation using the target stack, not a redesign.
    - *Sub-task:* Extract detailed functional requirements for each UI area from `docs/funcional/01-07` and `docs/tecnico/requisitos.md` (Completed through initial pass; these documents provide extensive details).
    - *Sub-task:* Reviewed User Guides (`docs/user-guide/01-06`) and Use Cases (`docs/tecnico/casos-de-uso/*`). These documents detail:
        - Overall UI structure (Discord-inspired: Project/Server sidebar, Channel/Context sidebar, Main Content area).
        - Key views: Home (global dashboard, tasks, personas, integrations, chat), Project-specific view (dashboard, tasks, forum, docs, channels, settings), Global Settings (profile, theme, LLM configs).
        - User flows for creating projects, personas, jobs, and configuring LLMs via UI forms and interactions.
        - Chat as a primary interface for task initiation and agent communication (plan approval).
- [X] **Task 1.2.2:** Review any other document files (e.g., `.docx`, `.pdf`) if present in `docs/`. (Status: No other relevant document types like .docx or .pdf were found in the `docs/` directory from `ls` output. Marking as complete for now.)
- [X] **Task 1.2.3:** Review `AGENTS.md` again for any further UI/UX or frontend-specific guidelines relevant to the new application.
    - *Sub-task:* Re-scanned `AGENTS.md`. Confirmed tech stack (React, Vite, Shadcn/UI conventions, Tanstack Router, etc.). Object Calisthenics and SOLID principles apply to frontend code structure. No new explicit UI design directives beyond these. Visuals guided by `visual_style_guide.md` and RNF-CMP-001.
- [X] **Task 1.2.4:** Review `README.md` again for any further high-level feature descriptions that imply UI elements.
    - *Sub-task:* Re-scanned `README.md`. High-level features (Discord-inspired UI, Persona management, Job execution, LLM integration) are consistent with details found in functional docs and use cases. No new distinct UI features identified.

### 1.3. Codebase Analysis (`src/` and `src2/`) - Iteration 1: Pages and Routing
- [ ] **Task 1.3.1:** Identify all top-level pages/views in `src/` and `src2/`.
    - *Sub-task:* Analyzed `src/infrastructure/frameworks/react/pages/` directory structure. Identified TanStack Router file-based routing.
        - Key files: `__root.tsx` (root layout), `index.tsx` (landing/redirect).
        - Route groups: `(public)` (with `home/index.tsx`, `onbording/index.tsx`) and `(logged)` (with nested `project/`, `user/` routes including dynamic routes like `project/$id/` and `user/dm/$id/`).
    - *Sub-task:* Analyzed `src2/src/App.tsx`. This appears to be a single-page test application for the job queue system, with no complex routing or multiple pages. It's not representative of a full application structure. `src2/` will largely be ignored for UI migration tasks unless specific logic needs to be extracted.
    - *Sub-task:* Documented primary purposes and inferred URLs for pages in `src/`:
        - `/` (`pages/index.tsx`): Initial landing/redirect.
        - `/home` (`pages/(public)/home/index.tsx`): Public home page.
        - `/onbording` (`pages/(public)/onbording/index.tsx`): Onboarding, login, registration.
        - `/project` (`pages/(logged)/project/index.tsx`): Project listing.
        - `/project/:id` (`pages/(logged)/project/$id/index.tsx`): Project detail view.
        - `/user` (`pages/(logged)/user/index.tsx`): User dashboard/profile.
        - `/user/dm/:id` (`pages/(logged)/user/dm/$id/index.tsx`): Direct messaging.
        - `/user/user-guides` (`pages/(logged)/user/user-guides/index.tsx`): In-app user guides.
        - Layouts: `__root.tsx`, `(logged)/route.tsx`, `(logged)/project/route.tsx`, `(logged)/user/route.tsx`.
    - *Sub-task:* Routing mechanism for `src/` is confirmed as TanStack Router.
    - *Sub-task:* Corresponding tasks to implement these pages in the new application will be created. These include: "Implement Root Layout", "Implement Public Layout", "Implement Logged-In Layout", "Implement Project Layout", "Implement User Area Layout", "Implement Public Home Page", "Implement Onboarding Page", "Implement Project List Page", "Implement Project Detail Page", "Implement User Dashboard Page", "Implement DM Page", "Implement User Guides Page". Visual style must adhere to `docs/tecnico/visual_style_guide.md` (RNF-CMP-001).
    - *Note:* The new application will use Tanstack Router. Visual style should adhere to `docs/tecnico/visual_style_guide.md` and RNF-CMP-001 (visual identity).

### 1.4. Codebase Analysis (`src/` and `src2/`) - Iteration 2: UI Components
- [ ] **Task 1.4.1:** Catalogue all common/reusable UI components from `src/infrastructure/frameworks/react/components/`.
    - *Sub-task:* Identified Shadcn/UI-like primitive components in `components/ui/` (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `table.tsx`, etc.). These are the base building blocks.
    - *Sub-task:* Identified more complex, composite components in other subdirectories of `components/` such as:
        - `chat/` (chat input, message, thread)
        - `dashboard/` (activity list item, user dashboard)
        - `onboarding/` (LLM config form, persona list, user info form)
        - `projects/` (project card, detail page, list page, specific tabs for project details)
        - `sidebar/` (app, project, user sidebars)
        - `markdown-render.tsx`, `mode-toggle.tsx`, typography components.
    - *Sub-task:* `src2/` does not appear to have a comparable reusable component library for the full UI. Focus is on `src/`.
    - *Sub-task:* For each identified component (both primitive and composite) from `src/`:
        - Briefly document its primary purpose and observed props/variants (detailed analysis later during implementation task).
        - Plan for re-implementation in the new application:
            - For `ui/` primitives: Use `npx shadcn-ui@latest add <component>` in the new project, then customize to match existing visual style and behavior from `src/` and `docs/tecnico/visual_style_guide.md`.
            - For composite components: Re-implement them using the new Shadcn/UI primitives, aiming for functional and visual parity with the versions in `src/`.
    - *Sub-task:* Create high-level tasks for implementing these component categories in the new application. Examples:
        - "Implement Base UI Primitives (Shadcn/UI based, styled for visual identity)"
        - "Implement Chat Components (Input, Message, Thread)"
        - "Implement Dashboard Components"
        - "Implement Onboarding Forms and Components"
        - "Implement Project Management Components (List, Card, Detail Page, Tabs)"
        - "Implement Sidebar Components"
        - "Implement Markdown Renderer and Mode Toggle"
    - *Style Note:* All components in the new application must adhere to Shadcn/UI conventions, be customizable via props, and strictly follow the visual style defined in `docs/tecnico/visual_style_guide.md` to meet RNF-CMP-001.

### 1.5. Codebase Analysis (`src/` and `src2/`) - Iteration 3: Functionalities and Business Logic
- [ ] **Task 1.5.1:** For each identified page and component from `src/`, map out user interactions and associated business logic.
    - *Sub-task: Project List Page (`ProjectListPage.tsx`)*
        - Data Fetching: Uses `useSyncedProjectList()` hook, which relies on `project-list-store.ts`.
        - `project-list-store.ts`: Fetches initial list via IPC `window.api.invoke("query:get-projects")` and subscribes to `window.electronAPI.onProjectListChanged` for real-time updates. Manages state with `useSyncExternalStore` pattern.
        - Project Creation: "Criar Novo Projeto" button exists. Logic likely involves a Dialog (not directly in `ProjectListPage.tsx`'s render but possibly controlled by its state or a global command palette) that uses a form. Submission would call a use case via `useCore()` (e.g., `core.usecase.createProject`).
        - Navigation: Project card navigation is stubbed with `console.log`; would use TanStack Router's `navigate`.
    - *Sub-task: Onboarding Page (`onbording/index.tsx`)*
        - Form Handling: Uses `react-hook-form` with Zod for user info and LLM config. Composes `UserInfoForm` and `LLMConfigForm`.
        - Submission: `handleSubmit` function calls `core.usecase.createLLMProviderConfig` and then `core.usecase.createUser` (both are abstracted IPC calls via `useCore()`).
        - Error Handling: Uses `tryCatch` utility and `toast` for notifications, mapping error codes.
        - Routing: `beforeLoad` guard checks for existing user and redirects. `router.invalidate()` used after successful onboarding.
    - *Sub-task: IPC Abstraction (`use-core.ts`)*
        - Provides `useCore()` hook returning namespaced functions for `usecase` and `query` invocations.
        - These functions wrap `window.api.invoke("namespace:action", payload)` calls.
        - Standardizes IPC calls and error handling (`createAppError`, `AppErrorCode`).
    - *Sub-task: General Pattern for Create/Update Operations*
        - UI (Page/Dialog) -> `react-hook-form` for data collection -> `onSubmit` handler -> `useCore().usecase.<actionName>(data)` -> IPC call.
    - *Sub-task: Command Palette (`command.tsx`)*
        - UI components for a command palette (`CommandDialog` using `cmdk`) exist.
        - However, direct usage for actions like "Create Project" or how commands are populated is not yet clear from analyzed files. It might be a less used feature or dynamically populated.
    - *Sub-task:* For the new application, these functionalities will be re-implemented:
        - Data fetching (e.g., project list) will primarily use TanStack Query, with IPC events triggering query invalidation for real-time updates.
        - Forms will continue to use React Hook Form + Zod.
        - Backend interactions will be through a similar IPC abstraction layer.
        - Dialogs (likely from Shadcn/UI) will be used for modal forms (e.g., project creation).
        - Visual and behavioral aspects will be replicated to meet RNF-CMP-001.
    - *Sub-task:* Create detailed tasks for implementing core functionalities:
        - "Implement Project List Display (using TanStack Query and IPC-triggered invalidation)"
        - "Implement Project Creation Flow (Dialog, Form, IPC via useCore pattern)"
        - "Implement Onboarding Flow (Forms, IPC via useCore pattern)"
        - "Implement Chat Functionality (Message display, input, IPC for sending/receiving)"
        - "Implement User Profile/Settings Management"
        - "Implement LLM Configuration Management"

### 1.6. Codebase Analysis (`src/` and `src2/`) - Iteration 4: State Management
- [ ] **Task 1.6.1:** Identify how global and local state are managed in `src/`.
    - *Sub-task:* No common global state libraries (Redux, Zustand, Jotai) or TanStack Query are used in `src/` for client-side state.
    - *Sub-task: Data from Main Process (Server State)*
        - Project List: Managed by a custom store (`project-list-store.ts`) using `useSyncExternalStore` and `useSyncedProjectList()` hook. Fetches initial data via IPC (`query:get-projects`) and updates via IPC events (`onProjectListChanged`).
        - Current User Data: Likely managed by a similar custom store (`user-data-store.ts` inferred) and `useSyncedCurrentUser()` hook. Authentication status is checked in TanStack Router `beforeLoad` guards using `userQuery()`. User data is then available via the sync store.
    - *Sub-task: Global UI State*
        - Theme (Light/Dark): Managed by `ThemeProviderContext` using React Context and `localStorage`.
    - *Sub-task: Local Component and Form State*
        - Managed by `useState`, `useReducer` within components.
        - `react-hook-form` manages form state.
    - *Sub-task: Command Palette State*
        - State management for the `CommandDialog` (visibility, content) is not yet clearly identified; could be local to where it's invoked or via a yet-to-be-found global context/store if it's a global feature.
    - *Sub-task: State Management Strategy for the New Application*
        - **Server State (Data from IPC):** Consistently use TanStack Query.
            - Example: `useQuery(['projects'], () => core.query.projects())`. IPC events from main will trigger `queryClient.invalidateQueries()`.
            - Example: `useQuery(['currentUser'], () => core.query.user())` for user data.
        - **Global Client UI State:**
            - Theme: Continue with a React Context provider.
            - Other simple global UI states (e.g., command palette visibility, if global): React Context or a lightweight store like Zustand/Jotai if complexity grows.
        - **Local Component/Form State:** Continue with React local state (`useState`) and `react-hook-form`.
    - *Sub-task:* Create tasks for setting up the chosen state management solution and refactoring state logic. Example: "Setup Tanstack Query for API data fetching and caching", "Refactor User Profile State using React Context". (Task 1.6.1 is now complete with this summary).

### 1.7. Codebase Analysis (`src/` and `src2/`) - Iteration 5: Communication with API/Main Thread (IPC)
- [X] **Task 1.7.1:** Document all interactions with the Electron main process (IPC calls) from `src/`.
    - *Sub-task:* Reviewed `docs/ipc-technical-documentation.md`: Confirms `ipcMain.handle` for request/response and main-to-renderer events. Mentions `Result<T>` error handling.
    - *Sub-task:* Analyzed `src/electron/preload.ts` (primary preload):
        - Exposes `window.api.invoke(channel, data)` for generic request/response. This is used by `use-core.ts`.
        - Exposes `window.api.onUserDataChanged(cb)` (for `"ipc:user-data-changed"`) and `window.api.onProjectListChanged(cb)` (for `"ipc:project-list-changed"`). These are used by custom data stores.
    - *Sub-task:* Analyzed `src/infrastructure/electron/preload.ts` (secondary/specific preload):
        - Exposes direct functions like `window.api.enqueueJob()`, `listAIAgents()`, `createAIAgent()`, `sendMessageToAgent()`, and an `onChatStreamEvent` listener. These seem for more specific features like job queue interaction and chat streaming, separate from the main CRUD/query pattern in `use-core.ts`.
    - *Sub-task: Identified IPC Channels (Request/Response via `use-core.ts` pattern)*
        - `"query:get-user"`: Fetches current user data.
        - `"query:llm-provider"`: Fetches available LLM providers.
        - `"query:get-projects"`: Fetches list of projects.
        - `"usecase:create-llm-provider-config"`: Saves LLM provider configuration. Params: `CreateLLMProviderConfigUseCaseInput`.
        - `"usecase:create-user"`: Creates a new user. Params: `CreateUserUseCaseInput`.
        - `"usecase:create-project"` (inferred): Creates a new project. Params: (e.g., `{ name: string, description?: string }`).
        - *(Further channels for chat, job management, etc., will be detailed as those specific components are analyzed deeper).*
    - *Sub-task: Identified IPC Channels (Event-driven, Main to Renderer)*
        - `"ipc:user-data-changed"`: Notifies renderer of user data updates. Payload: `UserQueryOutput`.
        - `"ipc:project-list-changed"`: Notifies renderer of project list updates. Payload: `ProjectType[]`.
        - `'chat:streamEvent'` (from secondary preload): For real-time chat message streaming. Payload: `RevisedLLMStreamEvent`.
    - *Sub-task: Data Schemas*
        - Input/Output types for use cases/queries invoked via `use-core.ts` are defined in `src/core/application/` and provide type safety.
        - Event payloads are also typed in their respective store/listener contexts.
    - *Sub-task: New Application IPC Strategy*
        - Continue using the `useCore()` abstraction pattern for `invoke` calls.
        - For data traditionally managed by custom stores + IPC events (like project list, user data), migrate to TanStack Query, using IPC events to trigger query invalidations.
        - For features like chat streaming, the specific listener (`onChatStreamEvent`) will need to be integrated.
    - *Sub-task:* Create tasks for defining and implementing IPC contracts/handlers in the new application, ensuring type safety (e.g., using Zod for runtime validation if not already strictly typed across boundary). Example: "Define and implement `getProjectList` IPC Query and Handler", "Setup Chat Streaming IPC". (Task 1.7.1 is now complete with this summary).

### 1.8. Codebase Analysis (`src/` and `src2/`) - Iteration 6: Layouts and Visual Structure
- [ ] **Task 1.8.1:** Identify main application layouts in `src/` and their structure.
    - *Sub-task:* Analyzed TanStack Router layout routes: `__root.tsx`, `(logged)/route.tsx`, `(logged)/project/route.tsx`, `(logged)/user/route.tsx`.
    - *Sub-task:* Documented the nested layout structure:
        1.  **Root Layout (`__root.tsx`):** Global providers (`ThemeProvider`, `I18nProvider`), main `<Outlet />`. Minimal visual structure.
        2.  **Authenticated Layout (`(logged)/route.tsx`):** Main shell after login. Contains:
            *   `<AppSidebar />` (far left: project/server list, home link, add project).
            *   Main content area (`<Outlet />`) for further nested layouts.
        3.  **Project Section Layout (`(logged)/project/route.tsx`):** Renders in Authenticated Layout's outlet. Contains:
            *   `<ProjectSidebar />` (left, resizable: project name, project-specific nav, channels).
            *   Project content area (`<Outlet />`) for project details.
        4.  **User Section Layout (`(logged)/user/route.tsx`):** Renders in Authenticated Layout's outlet. Contains:
            *   `<UserSidebar />` (left, resizable: user name, user-specific nav, DMs).
            *   User content area (`<Outlet />`) for user views.
    - *Sub-task:* Key layout components identified: `AppSidebar`, `ProjectSidebar`, `UserSidebar`, `ResizablePanelGroup` (for resizable sidebars), `ScrollArea`.
    - *Sub-task:* Create tasks to implement these layouts in the new application using Shadcn/UI components and Tailwind CSS, ensuring adherence to `docs/tecnico/visual_style_guide.md` and RNF-CMP-001 for visual identity. Examples:
        - "Implement Root Layout (Global Providers)"
        - "Implement Authenticated Main Layout (AppSidebar + Main Content Area)"
        - "Implement Project Section Layout (Resizable ProjectSidebar + Project Content Area)"
        - "Implement User Section Layout (Resizable UserSidebar + User Content Area)"
        - "Implement AppSidebar Component (Project list, Home link, Add Project)"
        - "Implement ProjectSidebar Component (Project nav, Channels list)"
        - "Implement UserSidebar Component (User nav, DM list)"
    - *Style Note:* Layouts must be responsive and visually identical to the `src/` implementation, using the defined theming and styling conventions.

### 1.9: Identifying Functional Gaps and New Core Requirements (Post-Analysis Review)
- [ ] **Task 1.9.1:** Define and implement Command Palette core actions.
    - *Sub-task:* Clarify all intended actions for the global Command Palette (e.g., "Create Project", "Navigate to X", "Open Settings").
    - *Sub-task:* Implement population of `CommandDialog` with these actions.
    - *Sub-task:* Ensure Command Palette is globally invocable and stylistically integrated.
    - *Core Impact:* New backend use cases and IPC handlers might be needed for new commands.
- [ ] **Task 1.9.2:** Finalize and implement Project Creation UI flow.
    - *Sub-task:* Confirm if project creation is via a dedicated dialog (triggered from `ProjectListPage` / `AppSidebar`) or via Command Palette. Implement the chosen UI flow.
    - *Sub-task:* Ensure `CreateProjectUseCase` IPC channel (`usecase:create-project`) is correctly implemented and used.
    - *Core Impact:* Verify `CreateProjectUseCase` in the backend is complete.
- [ ] **Task 1.9.3:** Implement dynamic data loading for sidebar/list contents.
    - *Sub-task:* For `ProjectSidebar`: Implement fetching of project-specific navigation items and channels (currently placeholders). Requires new IPC queries like `query:get-project-nav-items` and `query:get-project-channels`.
    - *Sub-task:* For `UserSidebar`: Implement fetching of Direct Message threads (currently placeholders). Requires new IPC query like `query:get-user-dm-threads`.
    - *Core Impact:* New backend query handlers and associated core logic needed for these IPC channels.
- [ ] **Task 1.9.4:** Implement "TODO" actions from existing UI components.
    - *Sub-task:* Implement "Adicionar Projeto" button action from `AppSidebar`.
    - *Sub-task:* Implement "Ver Arquivados" button action from `AppSidebar`. (Requires `query:get-archived-projects` and potentially `usecase:archive-project`, `usecase:unarchive-project`).
    - *Sub-task:* Implement "Novo Canal" button action from `ProjectSidebar`. (Requires `usecase:create-channel`).
    - *Sub-task:* Implement "Nova Mensagem (DM)" button action from `UserSidebar`. (Requires `usecase:create-dm-thread` or similar).
    - *Sub-task:* Implement navigation for project channels in `ProjectSidebar`.
    - *Core Impact:* New backend use cases/query handlers for each "TODO" that implies backend interaction.
- [ ] **Task 1.9.5:** Implement UI for features documented but not fully present in `src/`.
    - *Sub-task:* Design and implement UI for "Global Integrations Management". (Requires backend for storing/managing integration configs).
    - *Sub-task:* Design and implement UI for "MCP Configuration". (Requires backend for MCP data).
    - *Sub-task:* Design and implement UI for "Global Analytics View". (Requires backend for aggregating and providing analytics data).
    - *Sub-task:* Design and implement UI for "Project Forum View". (Requires backend for forum data, posts, threads).
    - *Sub-task:* Design and implement UI for "Project Documentation View" (if different from just navigating a docs folder). (May require backend if docs are managed in-app).
    - *Core Impact:* Significant backend development (new entities, use cases, IPC channels) for each of these features.

## Phase 2: Gap Analysis with `src_refactored/`
- [X] **Task 2.1.1:** After completing the initial analysis of `src/` and `src2/`, review the `src_refactored/infrastructure/frameworks/react/` directory.
    - *Sub-task:* The directory `src_refactored/infrastructure/frameworks/react/` was found to be empty.
    - *Sub-task:* This indicates that frontend refactoring/migration into the `src_refactored/` structure has not yet begun.
    - *Sub-task:* Therefore, there are no additional frontend features or components in `src_refactored/` to compare against or identify gaps from. The analysis of the existing `src/` frontend (which uses a modern stack) serves as the complete baseline for the new application's backlog.
    - *Sub-task:* The new frontend application will be built within `src_refactored/infrastructure/frameworks/react/` following the architectural guidelines in `AGENTS.md`, based on the requirements derived from `src/` and the documentation.

## Phase 3: Tooling and New Stack Setup
- [ ] **Task 3.1.1:** Initialize a new Vite project with React and TypeScript.
- [ ] **Task 3.1.2:** Install and configure Shadcn/UI.
- [ ] **Task 3.1.3:** Install and configure Tanstack Router.
- [ ] **Task 3.1.4:** Setup LinguiJS for i18n.
- [ ] **Task 3.1.5:** Setup React Hook Form and Zod for form handling and validation.
- [ ] **Task 3.1.6:** Configure ESLint, Prettier, and Stylelint for code quality.
- [ ] **Task 3.1.7:** Configure path aliases in Vite and `tsconfig.json` for cleaner imports.
- [ ] **Task 3.1.8:** Define a basic project structure (e.g., `src/pages`, `src/components`, `src/hooks`, `src/lib`, `src/routes`, `src/assets`, `src/layouts`, `src/store`).

## Phase 4: Implementation (Derived from Phase 1 & 2)
- This phase will consist of implementing the tasks defined in Phase 1 and 2, such as:
    - Implementing layouts.
    - Implementing pages and their routes.
    - Implementing shared UI components.
    - Implementing specific features and business logic.
    - Integrating IPC calls.
    - Setting up state management.
    - Styling and theming.

## Phase 5: Documentation and Finalization
- [ ] **Task 5.1.1:** Document the new frontend architecture, components, and development guidelines.
- [ ] **Task 5.1.2:** Create or update user guides relevant to the new UI.
- [ ] **Task 5.1.3:** Ensure all i18n translations are in place.
- [ ] **Task 5.1.4:** Perform thorough testing (unit, integration, E2E if applicable).

---
*This is a living document and will be updated as the analysis progresses.*
