# Agent Capability: Messaging (MessageTool)

Personas (AI Agents) in Project Wiz are documented to potentially be equipped with a MessageTool to send communications, whether to notify users, ask questions, or interact with other Agents.

## Intended Key Operations (as per initial documentation):

- **Direct Message:**
    - Would allow an agent to send a direct message to a specific user.
- **Channel Message:**
    - Would allow an agent to send a message to a designated channel within a project (managed by Project Wiz).
- **Forum Post:**
    - Would allow an agent to post a message to a specific topic in a project's forum (managed by Project Wiz).

## Code Implementation Notes:
- **Status: Agent-Initiated Tool Not Found.**
- No implementation corresponding to an agent-callable `MessageTool` was found in `src/core/application/tools/` during the code review.
- The frontend includes UI components like `chat-input.tsx` and `chat-messages.tsx`, which facilitate user-to-agent (and likely user-to-user or agent-to-user via UI) communication. This means users can send messages to agents, and agents can respond within an existing interaction.
- However, the capability for an agent to *autonomously initiate* a message (e.g., proactively notify a user about an event or ask a clarifying question without being prompted in an active chat) via a dedicated tool is not confirmed in the analyzed backend toolset. Such a tool would be necessary for more proactive agent behaviors.

*(Further details to be consolidated from code analysis in Phase 2)*
