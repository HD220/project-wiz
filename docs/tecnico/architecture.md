# Software Architecture

This document describes the software architecture for Project Wiz. The architecture is designed to be robust, scalable, maintainable, and testable, adhering to modern best practices.

## 1. Core Architectural Principles

- **Clean Architecture:** The system strictly follows the principles of Clean Architecture. This organizes the codebase into concentric layers (Domain, Application, Infrastructure), with dependencies flowing inwards. This ensures that the core business logic is independent of external frameworks and technologies.
- **Object Calisthenics:** All nine rules of Object Calisthenics are to be mandatorily applied during development to promote extremely clean, readable, and maintainable object-oriented code.
- **SOLID, DRY, KISS:** Standard software design principles like SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), DRY (Don't Repeat Yourself), and KISS (Keep It Simple, Stupid) are to be followed.
- **Modularity and Separation of Concerns:** Each component and layer has well-defined responsibilities.

## 2. Key Technologies

- **Application Framework:** ElectronJS (for desktop application structure).
- **Frontend:** React, TypeScript, Tailwind CSS (styling), Vite (bundler).
    - **Routing:** TanStack Router (`@tanstack/react-router`).
    - **Internationalization (i18n):** LinguiJS (`@lingui/*`).
    - **UI Components:** Extensive use of Radix UI primitives (`@radix-ui/*`), icons from Lucide React (`lucide-react`), notifications by Sonner (`sonner`), and charts by Recharts (`recharts`).
    - **Form Handling:** React Hook Form (`react-hook-form`) with Zod for validation (`@hookform/resolvers` and `zod`).
- **Backend/Core Logic:** TypeScript, Node.js.
    - **Dependency Injection:** InversifyJS (`inversify`, `reflect-metadata`) is used for managing dependencies, particularly in the backend services.
- **AI/LLM Integration:** AI SDK (`ai` library) for interacting with Large Language Models (e.g., OpenAI via `@ai-sdk/openai`, DeepSeek via `@ai-sdk/deepseek`).
- **Database/Persistence:** SQLite (via `better-sqlite3`) with Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
- **API/Tooling:** Octokit (`octokit`) for GitHub interactions may be used.

## 3. Architectural Layers (Clean Architecture)

### 3.1. Domain Layer (Core)
- **Purpose:** Contains the enterprise-wide business logic and policies. It is the most independent layer.
- **Key Components:**
    - **Entities:** Objects representing core business concepts, possessing an identity and a lifecycle (e.g., `Job`, `AgentInternalState`, `Persona`, `Project`). They encapsulate attributes and intrinsic validation rules. Adherence to Object Calisthenics means entities will be small and focused.
    - **Value Objects (VOs):** Immutable objects representing descriptive aspects of the domain without a conceptual identity (e.g., `JobId`, `JobStatus`, `ActivityType`, `PersonaName`, `RetryPolicy`). They handle validation for their specific values.
    - **Domain Events (Optional/Future):** Could be used to signal significant occurrences within the domain.
    - **Repository Interfaces:** Define contracts for data persistence, implemented by the Infrastructure layer. They are defined in terms of domain objects (e.g., `IJobRepository`, `IAgentStateRepository`).

### 3.2. Application Layer (Use Cases)
- **Purpose:** Contains application-specific business logic. It orchestrates data flow to and from the Domain layer and directs the Domain entities to perform their logic.
- **Key Components:**
    - **Use Cases (Interactors):** Implement specific application operations or user stories (e.g., `CreateJobUseCase`, `ProcessJobUseCase`, `CreatePersonaUseCase`). They coordinate the retrieval and modification of domain entities via repository interfaces.
    - **Application Services:** Coordinate tasks and operations, often encapsulating logic that doesn't fit neatly into a single use case or involves multiple domain entities (e.g., `AgentServiceImpl` which likely represents the `AutonomousAgent` concept, `ProcessJobService`).
    - **Ports (Interfaces for Infrastructure):** Defines interfaces for outbound communication with the Infrastructure layer (e.g., `IJobQueue`, `IWorkerPool`, `IAgentService`'s connection to actual task execution mechanisms, `ILLM` interface, `ITool` interface).
    - **Data Transfer Objects (DTOs) / Input Schemas:** Zod schemas are used for input validation for use cases. DTOs may also be used to carry data between layers, particularly to/from the presentation layer, without exposing domain entities directly if needed.
    - **Factories:** Responsible for creating complex objects, ensuring they are instantiated correctly (e.g., `TaskFactory`).

### 3.3. Infrastructure Layer (External Concerns)
- **Purpose:** Contains all the details external to the application, such as UI, database access, external API integrations, and framework-specific code.
- **Key Components:**
    - **Persistence Implementations:** Concrete implementations of Repository Interfaces using Drizzle ORM and SQLite (e.g., `JobDrizzleRepository`, `AgentStateDrizzleRepository`).
    - **Queue Implementations:** Concrete implementation of the `IJobQueue` interface (e.g., using `better-sqlite3` directly or a library built on top, like `SqliteQueue`).
    - **Worker Pool Implementations:** Concrete implementation of `IWorkerPool` (e.g., `ChildProcessWorkerPoolService` using Node.js child processes).
    - **Tool Adapters:** Concrete implementations of `ITool` interfaces (e.g., `SearchTool` (placeholder), and future tools like `FilesystemToolAdapter`, `TerminalToolAdapter`). These adapt specific technologies or libraries to the generic tool interface used by the Application layer.
    - **LLM Adapters:** Concrete implementations of the `ILLM` interface using the AI SDK (e.g., `OpenAILLMAdapter`, `DeepSeekLLMAdapter`).
    - **Electron Main Process & IPC:**
        - The Electron main process handles window management, application lifecycle, and native OS interactions.
        - Inter-Process Communication (IPC) handlers in the main process (defined using Electron's `ipcMain`) receive requests from the Renderer process (UI) and delegate to Application layer use cases/services, often resolved via InversifyJS.
    - **UI (Frontend - React):**
        - Built with React, TypeScript, and Vite.
        - Components interact with the backend via IPC calls initiated from React components, custom hooks, or through services provided by TanStack Router loaders/actions.
        - Styling is managed by Tailwind CSS, leveraging a themable system (light/dark modes) defined in `globals.css` and component-specific styles using conventions like ShadCN UI.
    - **External Service Integrations:** Any other interactions with third-party APIs (e.g., GitHub via Octokit) or systems.

## 4. Key Design Patterns and Concepts

- **Repository Pattern:** Decouples domain and application logic from data persistence mechanisms.
- **Service Layer:** Encapsulates application logic not belonging to specific entities.
- **Factory Pattern:** Used for creating instances of complex objects like Tasks.
- **Value Objects:** Enforce validity and immutability for descriptive domain aspects.
- **Entities:** Model core domain concepts with identity.
- **Use Cases/Interactors:** Define specific application operations.
- **Dependency Injection (DI):** InversifyJS is used to manage dependencies, providing them to classes (e.g., repositories to use cases, services to other services). This promotes loose coupling and testability by allowing dependencies to be easily swapped or mocked.
- **Asynchronous Processing (Jobs & Queue):**
    - **Jobs/Activities:** Represent units of work, often long-running or requiring background processing. Managed by the `Job` entity.
    - **Queue (`IJobQueue`):** Manages the lifecycle of Jobs (pending, executing, delayed, finished, failed), including retries and dependencies.
    - **Workers (`IWorkerPool`):** Processes that pick up Jobs from the Queue.
    - **Agents (`AgentServiceImpl` / `AutonomousAgent`):** The intelligent entities (often referred to as Personas) that perform the actual work of a Job, using Tasks and Tools. Invoked by a Worker.
    - **Tasks (`ITask`):** The in-memory logic for a specific type of Job, executed by an Agent.
    - **Tools (`ITool`):** Capabilities used by Tasks/Agents to interact with the environment (filesystem, terminal, LLMs, etc.).

## 5. Data Flow Example (Simplified: Creating and Processing a Job)

1.  **UI/External Trigger:** User action in React UI (Infrastructure) initiates a request, possibly via a form handled by React Hook Form.
2.  **IPC:** Request is sent to Electron Main Process via IPC (Infrastructure), e.g., using `ipcRenderer.invoke`.
3.  **IPC Handler (Main Process - Infrastructure):** Receives the request via `ipcMain.handle`. It resolves the appropriate Application layer Use Case (e.g., `CreateJobUseCase`) using the DI container (InversifyJS).
4.  **Use Case (`CreateJobUseCase` - Application):**
    - Validates input (potentially using a Zod schema).
    - Creates a `Job` entity (Domain).
    - Uses `IJobRepository` (Domain interface, implemented in Infrastructure) to persist the Job.
    - Uses `IJobQueue` (Application port, implemented in Infrastructure) to add the Job to the queue.
5.  **Worker (`WorkerProcess` - Infrastructure):**
    - Part of the `IWorkerPool`, monitors the `IJobQueue`.
    - Dequeues a pending `Job`.
    - Invokes the `AgentServiceImpl` (Application service) with the `Job`.
6.  **Agent (`AgentServiceImpl` - Application):**
    - Loads its `AgentInternalState` (Domain) via `IAgentStateRepository`.
    - Uses LLM (via `ILLM` port) with `AgentInternalState` and `Job.context` (Domain) to decide action.
    - If a Task is needed, uses `ITaskFactory` (Application) to get a `ITask` instance.
    - The `ITask` (Application/Domain) executes, potentially using `ITool`s (Application ports, implemented in Infrastructure) and `ILLM`.
    - Updates `Job.context` and determines if Job is complete for this cycle.
7.  **Worker & Queue:** Worker receives result from Agent, notifies `IJobQueue` to update Job status (e.g., finished, failed, delayed).

This architecture promotes a clear separation of concerns, making the system easier to develop, test, and maintain while adhering to the project's quality standards.
