# General Rules for All Modes

These rules apply to all modes in the system and must be followed without exception.

## Tool Usage Restrictions

1. **Prohibited Tools**
   - You MUST NOT use `switch_mode` tool
   - You MUST NOT use `command` parameter in `attempt_completion`
   - You MUST NOT use `ask_followup_question` tool

2. **Command Execution**
   - For executing multiple commands, use the separator `;`

## MCP Tools Usage

1. **Memory MCP Server as Knowledge Base**
   - All modes MUST use the memory MCP server as the primary knowledge base about the repository
   - ALWAYS check memory first before starting any task to understand repository context
   - ALWAYS update memory with new information discovered during task execution
   - Use `create_entities` to store important information about:
     - Repository structure and organization
     - Code patterns and conventions
     - Team preferences and standards
     - Technical decisions and their rationale
   - Use `create_relations` to establish connections between entities
   - Use `search_nodes` to retrieve relevant information before making decisions
   - Ensure proper entity naming for easy retrieval
   - Store user preferences and team standards for future reference

2. **GitHub MCP Server for Repository Management**
   - All modes MUST use the GitHub MCP server for repository interactions
   - ONLY the orchestrator mode should create and manage branches and pull requests
   - Other modes should work within the branches created by the orchestrator
   - All modes should use clear commit messages that describe the purpose of changes
   - All modes should follow the repository's commit message conventions
   - Code review requests should be coordinated through the orchestrator

## Mode Collaboration

1. **Task Delegation**
   - If a task requires capabilities outside your scope, request the orchestrator to create a task for the appropriate mode
   - Provide clear context and requirements when requesting assistance
   - Wait for task completion before proceeding with dependent tasks

2. **Information Sharing**
   - Use the memory MCP server to share long term information between modes
   - Use message of new_task for information context send another mode for task resolution
   - Document, memoryze important decisions and context for other modes to reference
   - Maintain consistent entity naming conventions for easy retrieval

3. **Task Workflow**
   - When receiving a task from orchestrator, check memory and files for relevant context
   - Understand the branch you should be working on
   - Follow the specific workflow for your mode
   - When complete, use attempt_completion with a clear summary of what was done

## Quality Standards

1. **Code Quality**
   - All code must follow clean code and clean architecture principles
   - Follow SOLID principles for object-oriented design:
     - Single Responsibility: Each class/function should have only one reason to change
     - Open/Closed: Open for extension, closed for modification
     - Liskov Substitution: Subtypes must be substitutable for their base types
     - Interface Segregation: Clients should not depend on interfaces they don't use
     - Dependency Inversion: Depend on abstractions, not concretions
   - Maintain proper error handling and logging
   - Keep methods small and focused (< 30 lines preferred)
   - Ensure cyclomatic complexity is manageable (< 10 per method)
   - Use meaningful variable and function names
   - Write comprehensive unit tests with good coverage (>80%)
   - Follow repository-specific conventions (check memory for established patterns)

2. **Documentation**
   - Ensure documentation is clear and comprehensive
   - Follow established documentation standards
   - Separate end-user documentation from technical documentation
   - Keep documentation up-to-date with code changes
   - Use appropriate templates for different types of documentation
   - Include examples and code snippets where helpful
   - Document architectural decisions and their rationale

## Git Workflow

1. **Branch Management**
   - Work on the correct branch as specified in the task
   - Use descriptive branch names that reference the issue number
   - Ensure branches are created from the latest main/master branch
   - Keep branches focused on a single issue or related set of issues

2. **Commit Practices**
   - Commit frequently with clear, descriptive messages
   - Follow conventional commit format if used in the repository
   - Keep commits focused and logical
   - Push changes to the remote repository when appropriate

3. **Pull Request Process**
   - Create pull requests with comprehensive descriptions
   - Reference related issues in the pull request
   - Ensure all tests pass before requesting review
   - Address review feedback promptly

## Process Guidelines

1. **Task Completion**
   - Complete tasks thoroughly before submitting
   - Validate results against requirements
   - Ensure all acceptance criteria are met
   - Self-review work before completion
   - Document any important decisions or trade-offs
   - Update memory with implementation details

2. **Example Completion Response**
   - Use a clear, structured format for your completion response
   - Include a summary of changes made
   - List files modified
   - Mention any important notes or considerations
   - Provide context for the next steps if applicable