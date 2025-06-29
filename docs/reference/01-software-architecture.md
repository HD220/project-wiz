# Software Architecture - Project Wiz

This document describes the software architecture for Project Wiz. The architecture is designed to be robust, scalable, maintainable, and testable, adhering to modern best practices and the specific requirements of the project.

## 1. Core Architectural Principles

*   **Clean Architecture:** The system strictly follows the principles of Clean Architecture. This organizes the codebase into concentric layers (Domain, Application, Infrastructure), with dependencies flowing inwards. This ensures that the core business logic is independent of external frameworks and technologies.
*   **Object Calisthenics:** All nine rules of Object Calisthenics are to be mandatorily applied during development to promote extremely clean, readable, and maintainable object-oriented code.
*   **SOLID, DRY, KISS:** Standard software design principles like SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), DRY (Don't Repeat Yourself), and KISS (Keep It Simple, Stupid) are to be followed.
*   **Modularity and Separation of Concerns:** Each component and layer has well-defined responsibilities.

> **Nota sobre Componentes em Pesquisa:** As seções a seguir descrevem a arquitetura do sistema, incluindo componentes para a execução detalhada de Agentes IA (como `GenericAgentExecutor`, `ActivityContext`, o framework de `Tools` e `Tasks`). É importante notar que, enquanto o sistema de Jobs/Filas e Workers está definido e em implementação, os mecanismos internos específicos para a execução de agentes, suas ferramentas e gerenciamento de estado detalhado (além do Job em si) ainda estão em fase de análise e pesquisa. Portanto, as descrições desses componentes específicos representam o modelo conceitual e podem evoluir.

## 2. Key Technologies

*   **Application Framework:** ElectronJS (for desktop application structure).
*   **Frontend:** React, TypeScript, Tailwind CSS (styling), Vite (bundler).
    *   **Routing:** TanStack Router (`@tanstack/react-router`).
    *   **Internationalization (i18n):** LinguiJS (`@lingui/*`).
    *   **UI Components:** Extensive use of Radix UI primitives (`@radix-ui/*`), icons from Lucide React (`lucide-react`), notifications by Sonner (`sonner`), and charts by Recharts (`recharts`).
    *   **Form Handling:** React Hook Form (`react-hook-form`) with Zod for validation (`@hookform/resolvers` and `zod`).
*   **Backend/Core Logic:** TypeScript, Node.js.
    *   **Dependency Injection (DI):** InversifyJS (`inversify`, `reflect-metadata`) is used for managing dependencies, particularly in the backend services.
*   **AI/LLM Integration:** AI SDK (`ai` library) for interacting with Large Language Models (e.g., OpenAI via `@ai-sdk/openai`, DeepSeek via `@ai-sdk/deepseek`).
*   **Database/Persistence:** SQLite (via `better-sqlite3`) with Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
*   **API/Tooling:** Octokit (`octokit`) for GitHub interactions may be used.

## 3. Architectural Layers (Clean Architecture)

### 3.1. Domain Layer (Core)
*   **Purpose:** Contains the enterprise-wide business logic and policies. It is the most independent layer.
*   **Key Components:**
    *   **Entities:** Objects representing core business concepts, possessing an identity and a lifecycle (e.g., `Job`, `AgentInternalState`, `Project`, `LLMProviderConfig`, `User`, `Worker`, `Persona`). They encapsulate attributes and intrinsic validation rules. Adherence to Object Calisthenics means entities will be small and focused.
    *   **Value Objects (VOs):** Immutable objects representing descriptive aspects of the domain without a conceptual identity (e.g., `JobId`, `JobStatus`, `ActivityContext` and its components like `ActivityHistory`, `ProjectName`, `AgentId`, `PersonaRole`, `ActivityType`, `RetryPolicy`). They handle validation for their specific values.
    *   **Domain Events (Optional/Future):** Could be used to signal significant occurrences within the domain.
    *   **Repository Interfaces:** Define contracts for data persistence, implemented by the Infrastructure layer. They are defined in terms of domain objects (e.g., `IJobRepository`, `IAgentRepository`, `IAgentStateRepository`, `IPersonaRepository`, `IProjectRepository`).

### 3.2. Application Layer (Use Cases)
*   **Purpose:** Contains application-specific business logic. It orchestrates data flow to and from the Domain layer and directs the Domain entities to perform their logic.
*   **Key Components:**
    *   **Use Cases (Interactors):** Implement specific application operations or user stories (e.g., `CreateProjectUseCase`, `CreatePersonaUseCase`, `CreateJobUseCase`, `CreateAgentUseCase`, `ProcessJobUseCase`). They coordinate the retrieval and modification of domain entities via repository interfaces.
    *   **Application Services:** Coordinate tasks and operations, often encapsulating logic that doesn't fit neatly into a single use case or involves multiple domain entities (e.g., `GenericAgentExecutor` as an implementation of `IAgentExecutor`, `WorkerService`, `ProcessJobService`, `AgentServiceImpl` representing `AutonomousAgent` concepts).
    *   **Ports (Interfaces for Infrastructure):** Defines interfaces for outbound communication with the Infrastructure layer (e.g., `IJobQueue`, `IFileSystem`, `IVersionControlSystem`, `ILLM` interface, `IAgentTool` or `ITool` interface, `IWorkerPool`).
    *   **Data Transfer Objects (DTOs) / Input Schemas:** Zod schemas are used for input validation for use cases. DTOs may also be used to carry data between layers.
    *   **Factories:** Responsible for creating complex objects, ensuring they are instantiated correctly (e.g., `TaskFactoryImpl` or `TaskFactory` for creating `ITask` instances).

### 3.3. Infrastructure Layer (External Concerns)
*   **Purpose:** Contains all the details external to the application, such as UI, database access, external API integrations, and framework-specific code.
*   **Key Components:**
    *   **Persistence Implementations:** Concrete implementations of Repository Interfaces using Drizzle ORM and SQLite (e.g., `DrizzleJobRepository`, `JobDrizzleRepository`, `DrizzleAgentRepository`, `AgentStateDrizzleRepository`, `FileSystemAgentPersonaTemplateRepository`).
    *   **Queue Implementations:** Concrete implementation of the `IJobQueue` interface (e.g., `SqliteJobQueue` operating on `IJobRepository`, or using `better-sqlite3` directly).
    *   **Worker Pool Implementations:** Concrete implementation of `IWorkerPool` (e.g., `ChildProcessWorkerPoolService` using Node.js child processes, with `job-processor.worker.ts` as the worker entry point).
    *   **Tool Adapters (`IAgentTool` / `ITool`):** Concrete implementations of tool interfaces (e.g., `FileSystemTool`, `TerminalTool`, `MemoryTool`, `AnnotationTool`, `TaskTool`, `SearchTool`). These adapt specific technologies or libraries to the generic tool interface used by the Application layer.
    *   **LLM Adapters:** Concrete implementations of the `ILLM` interface using the AI SDK (e.g., `IPCLLMAdapter` for workers, `OpenAILLMAdapter`, `DeepSeekLLMAdapter`, or a direct implementation in an application service).
    *   **Electron Main Process & IPC:**
        *   The Electron main process handles window management, application lifecycle, and native OS interactions.
        *   Inter-Process Communication (IPC) handlers in the main process (defined using Electron's `ipcMain`) receive requests from the Renderer process (UI) and delegate to Application layer use cases/services, often resolved via InversifyJS.
    *   **UI (Frontend - React):** The user interface is a Single Page Application (SPA) built with React, TypeScript, and Vite. It resides in the Presentation layer (`src_refactored/presentation/ui/`) and interacts with the Electron main process via IPC. The detailed frontend architecture is described in Section 3.4.
    *   **External Service Integrations:** Any other interactions with third-party APIs (e.g., GitHub via Octokit).
    *   **`ToolRegistry`**: Singleton that stores and provides instances of `IAgentTool`.

### 3.4. Frontend Architecture (UI - React)

The user interface (UI) of Project Wiz is a Single Page Application (SPA) built with React, TypeScript, and Vite, located in `src_refactored/presentation/ui/`. It is responsible for all visual interaction with the user and communicates with the Electron main process via IPC (detailed in the frontend services layer and Electron preload configuration).

The internal organization of `src_refactored/presentation/ui/` aims for clarity, Developer Experience (DX), pragmatic separation of concerns, and scalability:

*   **Entry Point (`src_refactored/presentation/ui/`):**
    *   `index.html`: The root HTML file served by Vite for the Electron renderer process. Contains the `div#root` where the React application is mounted.
    *   `main.tsx`: The TypeScript/React entry point. Responsible for:
        *   Importing global styles (`./styles/globals.css`).
        *   Initializing and configuring essential global providers, such as:
            *   `ThemeProvider` (for light/dark themes).
            *   `QueryClientProvider` (for TanStack Query, managing server/IPC state).
            *   `RouterProvider` (from TanStack Router, to enable routing).
            *   `I18nProvider` (from LinguiJS, if i18n functionality is maintained/reimplemented).
        *   Rendering the React application into the DOM.

*   **Directory Organization in `src_refactored/presentation/ui/`:**

    *   `assets/`: Contains static resources like images, fonts, etc., directly used by the UI.

    *   `components/`: Stores React components reusable throughout the application, subdivided for clarity:
        *   `common/`: Generic, small, and highly reusable UI components without specific business logic (e.g., `LoadingSpinner`, `ErrorFallback`, `PageTitle`). These are basic building blocks.
        *   `layout/`: Components responsible for the main visual structure of pages and sections of the application (e.g., `AppShell` for the main container, `MainSidebar`, `ContextSidebar` for contextual sidebars, `PageHeader`).
        *   `ui/`: Base components from the Shadcn/UI library (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`). These are typically added via the Shadcn/UI CLI and can be customized to meet the `visual_style_guide.md`.

    *   `config/`: Centralizes main UI application configurations:
        *   `router.ts`: Creation and export of the main TanStack Router instance, configured with the generated `routeTree`.
        *   `queryClient.ts`: Creation and export of the TanStack Query `QueryClient` instance.
        *   `i18n.ts`: (If applicable) LinguiJS configuration, including loading message catalogs and locale activation.

    *   `features/`: This is a key directory for modular UI organization. Each subdirectory represents a major business functionality or domain of the application (e.g., `auth`, `project`, `dashboard`, `chat`, `settings`). Within each feature:
        *   `components/`: React components reusable *exclusively* within this feature.
        *   `hooks/`: Custom React hooks containing UI logic, state, and side effects specific to the feature.
        *   `pages/`: Complete page components that are entry points for the feature's routes (e.g., `ProjectListPage.tsx`, `AuthPage.tsx`).
        *   `services.ts`: (Optional, or could be in global `services/`) Functions encapsulating IPC calls specific to the feature, using the global IPC abstraction.
        *   `types.ts`: (Optional) TypeScript type definitions specific to this feature.
        *   `index.ts`: (Optional) May serve as an entry point for exporting public elements of the feature, facilitating imports.
        The `features/` structure promotes high cohesion (keeping artifacts of a functionality together) and low coupling (minimizing direct dependencies between features).

    *   `hooks/`: Contains global React hooks, which are utilities reusable across multiple features (e.g., `useDebounce`, `useLocalStorage`, `useAppTheme`).

    *   `lib/`: Pure JavaScript/TypeScript utility functions (non-React) that can be used anywhere in the frontend (e.g., `cn` for classnames, date utilities, string formatting).

    *   `services/`: Defines the abstraction layer for communication with the backend (Electron main process via IPC).
        *   `coreService.ts` (or similar): Exports functions that encapsulate `window.api.invoke("namespace:action", payload)` calls, providing a typed and centralized interface for backend interactions. This decouples UI logic from IPC implementation details.

    *   `store/`: For global client-side state management that isn't server state (already covered by TanStack Query).
        *   Examples: Context/store for UI theme (`ThemeContext`), user authentication state (`AuthUserContext` or a small Zustand/Jotai store).

    *   `styles/`: Global style files.
        *   `globals.css`: Contains base Tailwind imports, CSS variable definitions for themes (light/dark), and any other global styles or Tailwind base layers.

    *   `types/`: Global TypeScript type definitions for the frontend, usable across multiple features or components.

    *   `routeTree.gen.ts`: File automatically generated by the TanStack Router Vite plugin, containing the application's route tree based on files in `features/**/pages/`.

**Frontend Structure Rationale:**
This organization aims for:
*   **Developer Experience (DX):** Facilitate code location and understanding of each module's responsibilities through feature-based grouping and clear distinction between UI, feature logic, services, and state.
*   **Separation of Concerns:** Isolate pure UI components, presentation logic, backend communication logic, and state management.
*   **Scalability:** Allow new features to be added modularly and independently.
*   **Maintainability:** Reduce coupling between different parts of the application, easing modifications and refactorings.
*   **Testability:** Clear separation facilitates writing unit tests for components, hooks, and services, and integration tests for feature flows.
*   **Ecosystem Alignment:** Adopts common conventions of the React and Vite ecosystem and integrates well with libraries like TanStack Router, TanStack Query, and Shadcn/UI.

## 4. Key Design Patterns and Concepts

*   **Repository Pattern:** Decouples domain and application logic from data persistence mechanisms.
*   **Service Layer:** Encapsulates application logic not belonging to specific entities.
*   **Factory Pattern:** Used for creating instances of complex objects like Tasks.
*   **Value Objects:** Enforce validity and immutability for descriptive domain aspects.
*   **Entities:** Model core domain concepts with identity.
*   **Use Cases/Interactors:** Define specific application operations.
*   **Dependency Injection (DI):** InversifyJS is used to manage dependencies, providing them to classes (e.g., repositories to use cases, services to other services). This promotes loose coupling and testability by allowing dependencies to be easily swapped or mocked.
*   **Asynchronous Processing (Jobs & Queue):**
    *   **Jobs/Activities:** Represent units of work, often long-running or requiring background processing. Managed by the `Job` entity.
    *   **Queue (`IJobQueue` / `SqliteJobQueue`):** Manages the lifecycle of Jobs (pending, executing, delayed, finished, failed), including retries and dependencies.
    *   **Workers (`WorkerService`, `IWorkerPool`, `job-processor.worker.ts`):** Processes that pick up Jobs from the Queue. The `WorkerService` (domain) might use an `IAgentExecutor`. The `job-processor.worker.ts` (infrastructure) is a child process worker that uses IPC-based services.
    *   **Agents (`GenericAgentExecutor`, `AutonomousAgent`):** The intelligent entities (configured by `AgentPersonaTemplate` and instantiated as `Agent`) that perform the work of a Job.
    *   **Tools (`IAgentTool` / `ITool`):** Capabilities used by Agents/Tasks to interact with the environment. (Este framework de Tools está em fase de pesquisa).

## 5. Data Flow Example (Simplified: User Goal leading to Job Processing)

> **Nota:** O fluxo a seguir descreve como um objetivo de alto nível do usuário pode levar à criação e processamento de um Job interno. As etapas relativas à invocação e operação interna de um `GenericAgentExecutor` ou `AgentServiceImpl` (aproximadamente etapas 5 e 6 do fluxo original aqui descrito) referem-se a componentes cujo design detalhado para a execução do agente ainda está em pesquisa. O sistema de Jobs, Filas e Workers (criação interna do Job, enfileiramento, e processamento pelo Worker) está definido.

1.  **User Interaction (Goal Delegation via UI):** User interacts with the Personal Assistant AI via the React UI, describing a high-level goal or task.
2.  **IPC to Main Process:** The request (user's goal) is sent to the Electron Main Process via IPC.
3.  **Goal Handling (Main Process/Application Layer):** An IPC Handler receives the user's goal. This handler might invoke an application service or use case responsible for interpreting the goal with the Personal Assistant AI's logic (potentially involving an LLM).
4.  **Internal Task Formulation & Job Creation (by Agent/Assistant logic):**
    *   The Personal Assistant AI (or a specialized agent it delegates to) analyzes the user's goal.
    *   Internamente, ele formula um ou mais `Jobs` específicos necessários para alcançar o objetivo do usuário.
    *   This internal process would then use a `CreateJobUseCase` (Camada de Aplicação):
        *   Validates the formulated Job data (e.g., using a Zod schema).
        *   Creates a `Job` entity (`core/domain/`).
        *   Uses `IJobRepository` (Domain interface, implemented in `infrastructure/persistence/`) to persist the `Job`.
        *   Uses `IJobQueue` (Application port, implementada em `infrastructure/queue/`) para adicionar o `Job` à fila apropriada.
5.  **Worker (`WorkerService` / Worker Process - `core/application/` ou `infrastructure/worker-pool/`):** (Este passo e os seguintes descrevem o processamento do Job interno)
    *   Monitors the `IJobQueue`.
    *   Dequeues a pending `Job`.
    *   Invokes the `GenericAgentExecutor` or `AgentServiceImpl` (Application service - conceito em pesquisa para execução detalhada) with the `Job`.
6.  **Agent Execution (Conceptual - `GenericAgentExecutor` / `AgentServiceImpl` - `core/application/`):**
    *   Loads its `AgentInternalState` (`core/domain/`) via `IAgentRepository` or `IAgentStateRepository`.
    *   Uses LLM (via `ILLM` port) with `AgentInternalState` and `Job.data.agentState.activityContext` or `Job.context` (`core/domain/`) to decide the action.
    *   If a Task is needed, uses `ITaskFactory` (Application) to get an `ITask` instance.
    *   The `ITask` (Application/Domain) executes, potentially using `ITool`s (Application ports, implemented in `infrastructure/tools/`) and `ILLM`.
    *   Updates `Job.data.agentState.activityContext` or `Job.context` and determines if the Job is complete for this cycle.
7.  **Worker & Queue:** Worker receives the result from the Agent, notifies `IJobQueue` to update the Job status (e.g., finished, failed, delayed).

This architecture promotes a clear separation of concerns, making the system easier to develop, test, and maintain, while adhering to the project's quality standards.
