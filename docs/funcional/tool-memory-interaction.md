# Agent Capability: Memory Interaction (MemoryTool)

Personas (AI Agents) in Project Wiz are documented to potentially use a MemoryTool to manage long-term information. This would allow them to store and retrieve data relevant across multiple tasks or over extended periods.

## Intended Key Operations (as per initial documentation):

- **Write:**
    - Allows the Agent to create new records or update existing ones in its long-term memory.
    - This would be used to store important information, learnings, or user preferences.
- **Delete:**
    - Allows the Agent to remove specific information from its memory, typically identified by a unique key or code.

## Code Implementation Notes:
- **Status: Not Found.**
- During the code review of `src/core/application/tools/`, no implementation corresponding to a `MemoryTool` was found.
- While the concept is valuable for agent autonomy, its current implementation within the analyzed codebase is not confirmed. Agents would rely on `AgentInternalState` for some level of memory, but a dedicated, general-purpose MemoryTool for arbitrary data storage and retrieval by the agent was not identified.

*(Further details to be consolidated from code analysis in Phase 2)*
