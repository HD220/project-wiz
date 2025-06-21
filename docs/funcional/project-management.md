# Project Management

Project Wiz provides a centralized environment for managing software projects. Users can create, configure, and oversee their development projects within the application.

## Key Capabilities:

- **Project Creation:** Users can initiate new projects. The `CreateProjectUseCase` handles the creation of a base folder structure for the project, including `source-code`, `docs`, and `worktrees` directories, and initializes a git repository within the project's root.
- **Project Configuration:** Settings and parameters for projects can be defined and modified.
- **Project Information Management:**
    - Initial project setup (name, description, etc.) is handled via use cases like `CreateProjectUseCase`.
    - The initially envisioned agent-usable `ProjectTool` for ongoing management of detailed project aspects (like communication channels, forums, or specific issues by an agent post-creation) was not found implemented in the analyzed toolset (`src/core/application/tools/`).

## UI Components:
The frontend provides components for project interaction, including:
- `project-card.tsx`: For displaying summary information of a project.
- `project-detail-page.tsx`: For viewing detailed aspects of a specific project.
- `project-list-page.tsx`: For listing available projects.
- Various tabs within the project detail view likely allow access to different project sections.

## Code Implementation Notes:
- Project creation is well-supported by `CreateProjectUseCase`.
- Frontend components suggest good user interaction capabilities for project listing and viewing.
- **Gap:** The `ProjectTool` as a distinct, agent-callable tool for ongoing, detailed project data manipulation (channels, forums, issues within Project Wiz by an agent) is not confirmed in the reviewed code sections. While agents can work on project *code* via filesystem/terminal tools (if those were available), direct manipulation of Project Wiz's own project metadata by agents seems limited to initial setup or would require different mechanisms.

*(Further details to be consolidated from code analysis in Phase 2)*
