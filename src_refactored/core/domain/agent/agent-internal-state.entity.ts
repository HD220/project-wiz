// src_refactored/core/domain/agent/agent-internal-state.entity.ts
import { AgentId } from './value-objects/agent-id.vo';
import { CurrentGoal } from './value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from './value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from './value-objects/internal-state/general-notes.collection'; // Corrected path
// import { JobTimestamp } from '../../job/value-objects/job-timestamp.vo'; // For createdAt/updatedAt

interface AgentInternalStateProps {
  // id: AgentInternalStateId; // Or use AgentId if state is 1:1 with an Agent instance
  currentProjectId?: CurrentProjectId;
  currentGoal?: CurrentGoal;
  generalNotes: GeneralNotesCollection;
  // createdAt: JobTimestamp;
  // updatedAt: JobTimestamp;
}

export class AgentInternalState {
  // The AgentId to which this state belongs serves as its effective identifier.
  private readonly _agentId: AgentId; // Instance variable 1
  private readonly props: Readonly<AgentInternalStateProps>; // Instance variable 2

  private constructor(agentId: AgentId, props: AgentInternalStateProps) {
    this._agentId = agentId;
    this.props = Object.freeze(props);
  }

  public static create(createProps: {
    agentId: AgentId;
    currentProjectId?: CurrentProjectId; // Can be string then wrapped, or VO
    currentGoal?: CurrentGoal;           // Can be string then wrapped, or VO
    generalNotes?: GeneralNotesCollection; // Can be string[] then wrapped, or VO
  }): AgentInternalState {
    if (!createProps.agentId) {
      throw new Error("AgentId is required to create AgentInternalState.");
    }

    const notes = createProps.generalNotes instanceof GeneralNotesCollection
                  ? createProps.generalNotes
                  : GeneralNotesCollection.create(createProps.generalNotes || []);

    return new AgentInternalState(createProps.agentId, {
      currentProjectId: createProps.currentProjectId,
      currentGoal: createProps.currentGoal,
      generalNotes: notes,
      // createdAt: JobTimestamp.now(),
      // updatedAt: JobTimestamp.now(),
    });
  }

  public agentId(): AgentId {
    return this._agentId;
  }

  public currentProjectId(): CurrentProjectId | undefined {
    return this.props.currentProjectId;
  }

  public currentGoal(): CurrentGoal | undefined {
    return this.props.currentGoal;
  }

  public generalNotes(): GeneralNotesCollection {
    return this.props.generalNotes;
  }

  // Behavior methods returning new instances
  private touchAndUpdate(updatedProps: Partial<AgentInternalStateProps>): AgentInternalState {
    return new AgentInternalState(this._agentId, {
      ...this.props,
      ...updatedProps,
      // updatedAt: JobTimestamp.now(),
    });
  }

  public changeCurrentProject(newProjectId?: CurrentProjectId): AgentInternalState {
    return this.touchAndUpdate({ currentProjectId: newProjectId });
  }

  public changeCurrentGoal(newGoal?: CurrentGoal): AgentInternalState {
    return this.touchAndUpdate({ currentGoal: newGoal });
  }

  public addGeneralNote(noteText: string): AgentInternalState {
    const updatedNotes = this.props.generalNotes.addNote(noteText);
    return this.touchAndUpdate({ generalNotes: updatedNotes });
  }

  public clearCurrentGoal(): AgentInternalState {
    // Creating a new CurrentGoal with an empty string might be one way,
    // or allowing undefined for currentGoal in props.
    // CurrentGoal.create('') might throw if it has min length.
    // For simplicity, let's assume undefined means no current goal.
    return this.touchAndUpdate({ currentGoal: undefined });
  }

  public clearCurrentProject(): AgentInternalState {
    return this.touchAndUpdate({ currentProjectId: undefined });
  }

  public equals(other?: AgentInternalState): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof AgentInternalState)) {
      return false;
    }
    // Equality is based on the AgentId it belongs to, as state is unique per agent.
    // If we allow multiple state snapshots, then a separate AgentInternalStateId might be needed.
    // For now, assuming 1:1 state per AgentId.
    return this._agentId.equals(other._agentId) &&
           this.props.currentProjectId?.equals(other.props.currentProjectId) &&
           this.props.currentGoal?.equals(other.props.currentGoal) &&
           this.props.generalNotes.equals(other.props.generalNotes);
  }
}
