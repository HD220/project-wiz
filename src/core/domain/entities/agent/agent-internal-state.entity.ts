import { AgentId } from './value-objects';
// Potentially import other VOs like ProjectId, Goal, Notes if defined separately

export interface AgentInternalStateProps {
  agentId: AgentId;
  currentProjectId?: string; // Placeholder, could become ProjectId VO
  currentGoal?: string;      // Placeholder, could become GoalDescription VO
  generalNotes?: string;   // Placeholder, could become Notes VO
  // Add other global state properties as needed
  // Example: lastProcessedActivityTimestamp?: Date;
}

export class AgentInternalState {
  private readonly props: Readonly<AgentInternalStateProps>;

  private constructor(props: AgentInternalStateProps) {
    this.props = Object.freeze(props);
  }

  public static create(props: AgentInternalStateProps): AgentInternalState {
    // Add validation if necessary for props
    return new AgentInternalState(props);
  }

  // Accessors
  public get agentId(): AgentId { return this.props.agentId; }
  public get currentProjectId(): string | undefined { return this.props.currentProjectId; }
  public get currentGoal(): string | undefined { return this.props.currentGoal; }
  public get generalNotes(): string | undefined { return this.props.generalNotes; }

  // Example update method (immutable)
  public updateGoal(newGoal?: string): AgentInternalState {
    return new AgentInternalState({ ...this.props, currentGoal: newGoal });
  }
  // Add other update methods as needed, always returning a new instance
}
