export { AgentName } from "./agent-name.vo";
export { AgentRole } from "./agent-role.vo";
export { AgentGoal } from "./agent-goal.vo";
export { AgentBackstory } from "./agent-backstory.vo";
export { AgentIdentity } from "./agent-identity.vo";
export { AgentBehavior } from "./agent-behavior.vo";
export { TaskStatus, TaskStatusType } from "./task-status.vo";
export { TaskPriority } from "./task-priority.vo";

// Function exports
export { canTransitionBetween, isTerminalStatus, isActiveStatus } from "./task-status-transitions.functions";
