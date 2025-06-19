# UI Structure

The Project Wiz application interface is designed for intuitive navigation and efficient workflow management, drawing inspiration from the familiar layout of platforms like Discord. It is generally organized into three main hierarchical areas:

1.  **Projects/Servers Bar (Far Left):**
    *   **Purpose:** This vertical bar, located on the extreme left edge of the application window, serves as the primary navigation tool for switching between different Projects. Each Project can be thought of as a "server" or a distinct workspace. Clicking on a Project icon in this bar will load its specific context into the subsequent interface areas.

2.  **Channels & Project Context Bar (Left of Main Content):**
    *   **Purpose:** Situated to the right of the Projects/Servers Bar, this area dynamically updates based on the selected Project. Its primary role is to display Project-specific navigation and contextual information.
    *   **Content Typically Includes:**
        *   **Project Channels:** Similar to chat channels, these allow for focused communication, often with specific Personas or for particular aspects of the project (e.g., "dev-chat," "qa-updates," "general-discussion").
        *   **Project Sections:** Direct links to different functional areas within the selected Project, such as:
            *   Tasks (Job lists and management)
            *   Documentation specific to the project
            *   A project-specific Forum or discussion board
            *   Project-specific analytics or dashboards
            *   **Canais de Log:** Canais dedicados ou visualizações para acompanhar logs detalhados da atividade de uma Persona específica ou da execução de um Job.
        *   **Active Personas:** A list or visual representation of Personas (AI Agents) currently active or assigned to the selected Project, potentially showing their status.

3.  **Main Content Area (Center/Right):**
    *   **Purpose:** This is the largest and most dynamic part of the interface. It displays the detailed content selected from either the Projects/Servers Bar or the Channels & Project Context Bar.
    *   **Content Examples:**
        *   **Chat Interface:** When a communication channel is selected, this area shows the conversation history and input fields for interacting with Personas or other users.
        *   **Dashboards:** Displays global or project-specific dashboards with key metrics, charts, and summaries.
        *   **Task Lists:** Shows detailed lists of Jobs, their statuses, assignees, and allows for interaction like creating new Jobs or viewing Job details.
        *   **Settings Panels:** When accessing application or project settings, this area presents the various configuration options.
        *   **Persona Interaction Views:** Specific interfaces for configuring Personas, monitoring their detailed activity, or reviewing their outputs.
        *   **Documentation Views:** Renders project documentation or help content.
        *   **Forum/Discussion Threads:** Displays discussion topics and replies.

This three-tiered structure aims to provide a clear separation of concerns, allowing users to easily navigate between high-level projects, project-specific contexts, and detailed content views.
