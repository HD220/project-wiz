# Agent Capability: Project Data Interaction (ProjectTool)

Personas (AI Agents) in Project Wiz are documented to potentially use a ProjectTool to interact with the metadata and structure of the projects being managed within the Project Wiz application itself. This refers to Project Wiz's internal records about projects, not the project's source code files.

## Intended Key Operations (as per initial documentation):

- **Save (Project Information):**
    - Would allow an agent to create or update general information about a project, such as its name or description.
- **Channel (Communication Channel):**
    - Would allow an agent to create or update a communication channel within a specific project (managed by Project Wiz).
- **Forum (Discussion Topic):**
    - Would allow an agent to create or update a discussion topic in the forum associated with a project (managed by Project Wiz).
- **Issue (Work Item/Bug):**
    - Would allow an agent to create or update an issue (e.g., a task, bug report, feature request) linked to a project (managed by Project Wiz).

## Code Implementation Notes:
- **Status: Specific Agent Tool Not Found for Ongoing Management.**
- Initial project creation, including setting its name and basic structure, is handled by the `CreateProjectUseCase`.
- However, an agent-usable `ProjectTool` for ongoing, detailed management of Project Wiz's internal project entities (like channels, forums, or issues, by an agent *after* initial project setup) was not found in `src/core/application/tools/` during the code review.
- If agents need to, for example, file a bug report into Project Wiz's issue tracking system for the project they are working on, they would require such a tool. Currently, this capability is not confirmed in the analyzed toolset.

*(Further details to be consolidated from code analysis in Phase 2)*
