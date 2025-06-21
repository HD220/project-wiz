# Agent Capability: Filesystem Operations (FilesystemTool)

Personas (AI Agents) in Project Wiz are documented to potentially be equipped with a FilesystemTool, granting them the ability to interact with the file system of the project they are working on.

## Intended Key Operations (as per initial documentation):

- **ReadFile:** Reads the content of a specified file.
- **WriteFile:** Writes or overwrites content in a specified file.
- **MoveFile:** Moves or renames a file.
- **RemoveFile:** Deletes a file.
- **ListDirectory:** Lists the content (files and subdirectories) of a specified directory.
- **CreateDirectory:** Creates a new directory.
- **MoveDirectory:** Moves or renames a directory.
- **RemoveDirectory:** Deletes a directory (often requires the directory to be empty).

## Code Implementation Notes:
- **Status: General Agent Tool Not Found.**
- No generic, agent-callable `FilesystemTool` was found in `src/core/application/tools/` during the code review.
- Specific use cases, such as `CreateProjectUseCase`, perform direct filesystem operations (e.g., `fs.mkdirSync`, `fs.writeFileSync` for initial `.gitattributes` and `.gitignore`) as part of their workflow. These are system-level actions for project setup, not general-purpose tools for an agent to use dynamically on arbitrary files within an existing project's `source-code` directory.
- For agents to modify project code or manage files as part of development tasks, a dedicated and secure FilesystemTool would be essential. Its absence in the analyzed toolset is a significant gap if agents are expected to perform such operations.

*(Further details to be consolidated from code analysis in Phase 2)*
