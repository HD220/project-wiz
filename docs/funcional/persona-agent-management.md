# Persona (AI Agent) Management

Project Wiz allows users to define, configure, and manage AI Agents, referred to as Personas. These Personas are the intelligent workers that automate development tasks.

## Key Capabilities:

- **Persona Creation and Configuration:**
    - Users can create new Personas using the `CreatePersonaUseCase`.
    - Personas are configured with attributes such as `name`, `role` (e.g., Developer, QA), `goal` (overall objective), and `backstory` to define their specialization and behavior.
    - **Nota sobre Persistência:** A interface para persistência destas configurações de Persona (`IPersonaRepository`) está definida, porém a implementação atual (`PersonaRepositoryDrizzle`) indica que os métodos de salvamento e carregamento ainda não foram implementados.
- **Estado Dinâmico do Agente em Execução (AgentRuntimeState):** Each Persona (Agent) maintains an `AgentInternalState`. Based on product requirements and architectural descriptions (e.g., `01-architecture.md` mentioning the `AutonomousAgent Service` loading it), this state is intended to include:
    - `agentId`: Unique identifier for the Agent.
    - `currentProjectId`: The project the agent is currently focused on.
    - `currentIssueId`: The issue the agent is currently focused on.
    - `currentGoal`: The high-level goal the agent is working towards.
    - `generalNotes`: General notes or learnings accumulated by the agent.
    - `promisesMade`: Commitments made by the agent.
    - Este estado é crucial para a continuidade e aprendizado do agente entre tarefas e sessões.
    - **Status da Implementação e Lacunas:** A análise do código-fonte atual (incluindo `AgentBase`, `AgentServiceImpl`, implementações de `Task` e repositórios existentes) não revelou um mecanismo explícito para a persistência ou o gerenciamento em tempo de execução deste `AgentRuntimeState` da forma como descrito. A documentação anterior mencionava um `AgentStateRepository` em outros contextos, mas este não foi encontrado nas implementações de repositório atuais. O `AgentServiceImpl` e as `Tasks` não demonstram carregar, modificar ou salvar ativamente este tipo de estado detalhado. Portanto, o gerenciamento completo e a persistência do `AgentRuntimeState` permanecem uma lacuna funcional significativa entre a documentação de requisitos e a implementação corrente.

## UI Components:
- The `persona-list.tsx` component, particularly noted in onboarding flows, suggests UI support for listing and managing Personas.

## Code Implementation Notes:
- Persona creation is supported by `CreatePersonaUseCase`.
- The concept of `AgentInternalState` is documented, and its loading is mentioned in architectural docs. The specifics of its runtime manipulation by the agent (e.g., an agent updating its own `generalNotes` or `promisesMade` through a dedicated mechanism or tool) were not explicitly detailed in the use cases reviewed for tool implementations.

*(Further details to be consolidated from code analysis in Phase 2)*
