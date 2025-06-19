# User Interactions

This document outlines the key ways users interact with the Project Wiz application to manage their software development workflows with AI Personas.

## Navigating Main Views

The application provides several primary views for users to access different levels of information and control:

*   **Home (Global Overview):**
    *   Serves as the main entry point, offering a consolidated view across all projects.
    *   **Accessing Global Dashboard:** View high-level statistics, overall project statuses, and recent activities from all projects.
    *   **Consolidated Task Management:** View and manage ongoing Jobs from all projects in a centralized list.
    *   **Persona Management:** Access the "Agentes (Personas) da Fábrica" section to list, create, generate, and configure all available Personas in the system.
    *   **Integrations:** Configure and manage system-wide integrations with external tools (e.g., GitHub, Jira).
    *   **MCPs (Master Control Programs):** Configure servers that manage Persona access to their Tools.
    *   **Global Analytics:** View aggregated reports on productivity, Persona performance, and overall project progress.
    *   **Global Chat:** Engage in general system communications or interact with Personas outside specific project contexts.

*   **Project View (Per-Project Context):**
    *   Accessed by selecting a specific project from the Projects/Servers Bar.
    *   **Accessing Project Dashboard:** View metrics, status, and recent activities specific to the selected project.
    *   **Project-Specific Task Management:** Manage and track Jobs assigned to Personas within the context of this project.
    *   **Project Forum:** Participate in discussions and collaborations related to the project.
    *   **Project Documentation:** Access and manage technical and business documentation for the project.
    *   **Project Analytics:** Review performance reports and analyses specific to the project.
    *   **Project Channels:** Use dedicated chat channels for focused interactions with Personas working on the project or for project-specific announcements.
    *   **Project Settings:** Configure project-specific details like associated repositories, members (users and Personas), etc.

*   **Application Settings:**
    *   Typically accessed via a dedicated settings icon or menu.
    *   **Managing User Profile:** Update personal information, avatar, etc.
    *   **Account Management:** Handle login details, security settings.
    *   **Notification Preferences:** Customize how and when to receive notifications about application events.
    *   **UI Theme:** Select visual themes (e.g., light/dark mode).
    *   **LLM Configurations:** Manage global settings for Large Language Model providers, if applicable.

## Project Management

Users can manage their software projects through the following interactions:

*   **Switching Between Projects:** Click on project icons in the far-left Projects/Servers Bar.
*   **Creating New Projects:**
    *   Initiate project creation, potentially from the Home view.
    *   Option to create projects from scratch or by linking to existing GitHub repositories.
*   **Configuring Project Settings:**
    *   Within a Project View, access settings to link/update code repositories.
    *   Manage project members, assigning roles to both human users and AI Personas.

## Persona (Agent) Management

Managing AI Personas is a core aspect of Project Wiz:

*   **Accessing Persona List:** Navigate to the "Agentes (Personas) da Fábrica" section in the Home view to see all Personas.
*   **Creating/Generating New Personas:**
    *   Define a unique **Name** for the Persona.
    *   Specify its primary **Role** (e.g., Software Engineer, QA Analyst).
    *   Outline its general **Goals** or objectives.
    *   Provide a **Backstory** to influence its operational style or knowledge areas.
*   **Configuring Personas:**
    *   Select the **LLM provider and specific model** the Persona will use.
    *   Adjust **LLM parameters** like temperature to fine-tune its behavior (planned).
    *   **Enable or disable specific Tools** to control its capabilities and permissions.
    *   Potentially provide **specific knowledge or context** relevant to its tasks (advanced planned feature).

## Job (Task) Management

Users direct the work of Personas by managing Jobs:

*   **Accessing Job Lists:**
    *   View a consolidated list of all Jobs in the Home view.
    *   View project-specific Jobs within a Project View's "Tasks" section.
*   **Creating Jobs:**
    *   Define a clear **Name** and **Description** for the task.
    *   Provide **Input Data/Parameters** (e.g., links, code snippets, specific settings).
    *   Specify **Acceptance Criteria** or the expected outcome.
    *   Define **Dependencies:** Specify if this Job depends on the completion of other Jobs (`depends_on_job_ids`).
    *   Define **Hierarchy:** Link to a `parent_job_id` if this Job is a sub-task of a larger Job.
*   **Assigning Jobs to Personas:** Select the most suitable Persona for the Job based on its role and configured skills.
*   **Managing Job Priority:** While the Agent/LLM might dynamically manage priorities based on context, the user can influence this by assigning due dates, discussing urgency in chat with the Persona, or setting a base priority if the system allows.
*   **Initiating/Scheduling Jobs:** Start a Job immediately or add it to the Queue for a Persona to pick up.
*   **Monitoring Job Progress & Details:**
    *   View the current **Status** of Jobs (e.g., Pending, Waiting, Executing, Completed, Failed, Delayed).
    *   Access **Execution Logs** (potentially in dedicated Log Channels) for detailed step-by-step information from the Persona.
    *   Review **Results/Artifacts** upon Job completion.
    *   Visualize **Dependencies and Hierarchies:** View how Jobs are connected, perhaps through lists in Job details, a visual graph, or timeline view.
*   **Receiving Notifications:** Get alerts for significant Job status changes (e.g., completion, failure, blocked by dependency).

## Interaction with Personas

Direct interaction with Personas, and observing their interactions, is key:

*   **Communicating via Chat:**
    *   Give additional **instructions** or context for ongoing Jobs directly to a Persona.
    *   Ask for **clarifications** on a Persona's progress or understanding.
    *   Receive **notifications**, updates, and results directly from Personas in chats.
*   **Inter-Persona Communication Visibility:** Users may have visibility (e.g., in Project Channels or a Forum) into communications between different Personas if they are collaborating on tasks. Personas can use specific Tools to send messages to other Agents, post to channels, or update forum topics.
*   **Responding to Persona Requests:** Personas may proactively ask the user for more information, decisions on critical steps, or approval via chat.
*   **Cancelling/Interrupting Jobs:** Users have the ability to request the cancellation or interruption of a Job that is currently in progress.

## Monitoring, Errors, and Analytics

*   **Error Presentation:**
    *   Job-specific errors are displayed clearly within the context of the Job (e.g., in its details view or log).
    *   Application-level errors might appear as dismissible notifications or "toasts," with links to more details if available.
    *   Visual indicators (e.g., color-coding, icons) are used to denote error states.
*   **Analytics and Metrics:**
    *   The "Analytics" sections (Global and Project-specific) provide insights into:
        *   Job completion rates, average execution times, failure rates.
        *   Persona activity levels, number of Jobs processed, Tools most frequently used.
        *   Queue statistics (e.g., number of pending Jobs, wait times).
*   **Persona Status and Activity:**
    *   Similar to Discord, users can see a Persona's current status (e.g., Active, Idle, Processing Job X).
    *   The Persona's profile or a dedicated view might show its current Job queue/history of recently processed Jobs.

## UI Component Philosophy

*   The development of the Project Wiz interface emphasizes the creation of specific, reusable UI components for its core concepts (e.g., Job cards, Persona profiles, Task lists). This follows the Single Responsibility Principle, promoting maintainability and a consistent user experience. These components are built upon foundational libraries (like those inspiring shadcn/ui) and styled with Tailwind CSS.
