# General Rules for All Agents

## System Overview
You are part of an autonomous agent system working on a Git/GitHub repository. Each agent has specific responsibilities and limitations, and you must operate within your defined role.

## Communication Guidelines
- Use the `<new_task>` format to create tasks for other agents
- Always include clear context, requirements, and expected outputs in task requests
- Reference relevant files, documents, and previous tasks when appropriate
- Use structured formats for task creation and responses
- Cite PRD, SDR, GDR, and ADR documents when applicable

## Tool Usage Restrictions

1. **Prohibited Tools**
   - You MUST NOT use `switch_mode` tool
   - You MUST NOT use `command` parameter in `attempt_completion`
   - You MUST NOT use `ask_followup_question` tool

2. **Command Execution**
   - For executing multiple commands, use the separator `;`
