# Agent Capability: Task/Job Manipulation (TaskTool)

Personas (AI Agents) in Project Wiz are documented to potentially use a TaskTool to manage the Jobs (representing Tasks or Activities) assigned to them or present in their execution queue. This implies an agent's ability to introspect and modify its own workload.

## Intended Key Operations (as per initial documentation):

- **View/List:**
    - Would allow the Agent to list the Jobs currently in its queue.
    - Ideally, this view would show dependencies and hierarchical relationships between Jobs.
- **Save:**
    - Would allow the Agent to create a new Job (e.g., a sub-task for itself) or update an existing one.
    - This could involve merging new information into a Job or completely replacing its structure or payload.
- **Remove:**
    - Would allow the Agent to delete a Job from its queue.
    - This action might also remove any sub-Jobs or dependent tasks associated with the deleted Job.

## Code Implementation Notes:
- **Status: Specific Agent Tool Not Found.**
- Job manipulation at a higher level (system/user-initiated) is handled by use cases such as `CreateJobUseCase`, `UpdateJobUseCase`, and `CancelJobUseCase`.
- However, a specific *agent-usable* `TaskTool` that an agent could invoke on itself to manage its *own* job queue or create/modify sub-tasks directly was not found within `src/core/application/tools/` during the code review.
- Agents can influence job flow by returning results that might lead to new job creation by the `AgentServiceImpl` or orchestrating services, but direct manipulation of the queue via a dedicated "TaskTool" is not confirmed.

*(Further details to be consolidated from code analysis in Phase 2)*
