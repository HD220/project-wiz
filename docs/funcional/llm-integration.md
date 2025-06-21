# Core Functionality: LLM Integration

A core capability of Personas (AI Agents) in Project Wiz is their integration with Large Language Models (LLMs). This integration is fundamental to their ability to understand instructions, reason, plan, and execute tasks.

## Key Aspects:

- **Reasoning and Decision Making (RF008):**
    - Personas, through services like `AgentServiceImpl`, use an LLM (e.g., an instance of `OpenAILLM`), combined with their `AgentInternalState` and the current `ActivityContext` (from the Job), to decide the next course of action for a given task.
- **Task Execution (RF011):**
    - Specific Tasks executed by Personas (sub-classes or handlers invoked by `AgentServiceImpl`) involve interactions with LLMs to generate code, text, analyze information, or determine steps.
- **Tool Usage and Orchestration:**
    - The system is designed for LLMs to request the use of available Tools. The `AgentServiceImpl` appears to play a role in this, as it was seen instantiating a `SearchTool` (though this specific tool seems to be a placeholder or example).
    - The results of tool actions are intended to be fed back to the LLM for further processing.
- **Contextual Interaction:**
    - The `ActivityContext` (from `Job.context`), especially its `activityHistory` and `activityNotes` fields, provides the LLM with immediate conversational and operational context for the current Job/Activity.
    - The `AgentInternalState` provides broader, more persistent context about the Persona's overall goals, role, and accumulated knowledge.
- **LLM Provider Configuration:**
    - The system includes a `CreateLLMProviderConfigUseCase`, suggesting that users can configure different LLM providers or models (e.g., setting API keys, choosing specific models like GPT-4 or Claude). This allows flexibility in choosing the underlying LLM. UI components like `llm-config-form.tsx` support this.

## Code Implementation Notes:
- `AgentServiceImpl` is a key component, demonstrating the instantiation of an LLM (e.g., `OpenAILLM`) and its use in task processing.
- The existence of `CreateLLMProviderConfigUseCase` and related UI components confirms the capability to manage LLM configurations.
- **Gap/Unclear Area: Dynamic Tool Selection and Invocation.** While `AgentServiceImpl` used `SearchTool` (which itself was a placeholder and not one of the fully documented agent tools like FilesystemTool, etc.), the exact mechanism for how an LLM's request for a *specific tool* from a *range of available, implemented tools* is parsed, and how the system then securely and correctly invokes that chosen tool with the right arguments, is not fully detailed by the parts of `AgentServiceImpl` reviewed. The broader, dynamic tool-use loop (select tool -> prepare arguments -> execute tool -> return result to LLM) needs further code exploration beyond the hardcoded `SearchTool` example to confirm its full implementation status for a wider array of tools.
- Many of the specific agent-usable tools (Filesystem, Terminal, Memory, etc.) were not found in `src/core/application/tools/`, which limits what an LLM can currently achieve even if the orchestration logic was fully in place.

*(Further details to be consolidated from code analysis in Phase 2)*
