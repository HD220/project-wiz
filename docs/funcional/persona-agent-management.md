# Persona (AI Agent) Management

Project Wiz allows users to define, configure, and manage AI Agents, referred to as Personas. These Personas are the intelligent workers that automate development tasks.

## Key Capabilities:

- **Persona Creation and Configuration:**
    - Users can create new Personas using the `CreatePersonaUseCase`.
    - Personas are configured with attributes such as `name`, `role` (e.g., Developer, QA), `goal` (overall objective), and `backstory` to define their specialization and behavior.
- **AgentInternalState:** Each Persona (Agent) maintains an `AgentInternalState`. Based on product requirements and architectural descriptions (e.g., `01-architecture.md` mentioning the `AutonomousAgent Service` loading it), this state is intended to include:
    - `agentId`: Unique identifier for the Agent.
    - `currentProjectId`: The project the agent is currently focused on.
    - `currentIssueId`: The issue the agent is currently focused on.
    - `currentGoal`: The high-level goal the agent is working towards.
    - `generalNotes`: General notes or learnings accumulated by the agent.
    - `promisesMade`: Commitments made by the agent.
    - This state is persisted to allow continuity across sessions and tasks. The exact fields and management mechanism at runtime by the agent itself (beyond initial loading by the service) require deeper inspection of `AgentServiceImpl` and related components.

## UI Components:
- The `persona-list.tsx` component, particularly noted in onboarding flows, suggests UI support for listing and managing Personas.

## Code Implementation Notes:
- Persona creation is supported by `CreatePersonaUseCase`.
- The concept of `AgentInternalState` is documented, and its loading is mentioned in architectural docs. The specifics of its runtime manipulation by the agent (e.g., an agent updating its own `generalNotes` or `promisesMade` through a dedicated mechanism or tool) were not explicitly detailed in the use cases reviewed for tool implementations.
- **Gap:** While `AgentInternalState` is loaded, the detailed runtime management and modification of this state *by the agent itself* (e.g., an agent deciding to update its `generalNotes`) is not fully clear from the reviewed code. It's assumed to be handled by the `AgentServiceImpl` or the tasks it invokes.

*(Further details to be consolidated from code analysis in Phase 2)*
