import { AgentId } from './value-objects/runtime-state/agent-id.vo';
import { ProjectId } from './value-objects/runtime-state/project-id.vo';
import { IssueId } from './value-objects/runtime-state/issue-id.vo';
import { NoteText } from './value-objects/runtime-state/note-text.vo';
import { GeneralNotesCollection } from './value-objects/runtime-state/general-notes.collection';
import { PromiseText } from './value-objects/runtime-state/promise-text.vo';
import { PromisesMadeCollection } from './value-objects/runtime-state/promises-made.collection';
import { GoalToPlan } from '../job/value-objects/context-parts/goal-to-plan.vo'; // Reusing
import { DomainError } from '@/core/common/errors';
// Optional: For createdAt/updatedAt, if added later
// import { JobTimestamp } from '../job/value-objects/job-timestamp.vo';

// TODO: OBJECT_CALISTHENICS_REFACTOR: This entity is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
// Consumers of `getProps()` should ideally be updated to use new behavioral methods on this entity.

interface AgentRuntimeStateProps {
  agentId: AgentId;
  currentProjectId?: ProjectId;
  currentIssueId?: IssueId;
  currentGoal?: GoalToPlan;
  generalNotes: GeneralNotesCollection;
  promisesMade: PromisesMadeCollection;
  // createdAt: JobTimestamp; // Example if added
  // updatedAt: JobTimestamp; // Example if added
}

// Interface for the input to the static create method (allows primitives for collections)
interface AgentRuntimeStateCreateProps {
  agentId: AgentId;
  currentProjectId?: ProjectId;
  currentIssueId?: IssueId;
  currentGoal?: GoalToPlan;
  generalNotes?: NoteText[] | GeneralNotesCollection; // Allows raw array or instance
  promisesMade?: PromiseText[] | PromisesMadeCollection; // Allows raw array or instance
  // createdAt?: JobTimestamp;
  // updatedAt?: JobTimestamp;
}

export class AgentRuntimeState {
  private constructor(private readonly fields: AgentRuntimeStateProps) {
    if (!fields.agentId) {
      throw new DomainError("AgentId is mandatory for AgentRuntimeState.");
    }
    if (!fields.generalNotes) {
      throw new DomainError("GeneralNotesCollection is mandatory for AgentRuntimeState.");
    }
    if (!fields.promisesMade) {
      throw new DomainError("PromisesMadeCollection is mandatory for AgentRuntimeState.");
    }
    // Timestamps would be initialized here if added:
    // this.fields.createdAt = fields.createdAt || JobTimestamp.now();
    // this.fields.updatedAt = fields.updatedAt || JobTimestamp.now();
  }

  public static create(props: AgentRuntimeStateCreateProps): AgentRuntimeState {
    const generalNotes = props.generalNotes instanceof GeneralNotesCollection
      ? props.generalNotes
      : GeneralNotesCollection.create(props.generalNotes || []);

    const promisesMade = props.promisesMade instanceof PromisesMadeCollection
      ? props.promisesMade
      : PromisesMadeCollection.create(props.promisesMade || []);

    return new AgentRuntimeState({
      agentId: props.agentId,
      currentProjectId: props.currentProjectId,
      currentIssueId: props.currentIssueId,
      currentGoal: props.currentGoal,
      generalNotes: generalNotes,
      promisesMade: promisesMade,
      // createdAt: props.createdAt || JobTimestamp.now(), // If timestamps were used
      // updatedAt: props.updatedAt || JobTimestamp.now(), // If timestamps were used
    });
  }

  public id(): AgentId {
    return this.fields.agentId;
  }

  public getProps(): Readonly<AgentRuntimeStateProps> {
    // Consider deep cloning for collections if they were mutable internally,
    // but our collections return new instances on modification.
    return { ...this.fields };
  }

  // --- Behavioral Methods (returning new instances) ---

  privatecopyWith(
    newProps: Partial<AgentRuntimeStateProps>
  ): AgentRuntimeState {
    return new AgentRuntimeState({
      ...this.fields,
      ...newProps,
      // updatedAt: JobTimestamp.now(), // Always update timestamp on change if using them
    });
  }

  public changeCurrentProject(projectId?: ProjectId): AgentRuntimeState {
    return this.copyWith({ currentProjectId: projectId });
  }

  public changeCurrentIssue(issueId?: IssueId): AgentRuntimeState {
    return this.copyWith({ currentIssueId: issueId });
  }

  public updateCurrentGoal(goal?: GoalToPlan): AgentRuntimeState {
    return this.copyWith({ currentGoal: goal });
  }

  public addGeneralNote(noteText: NoteText): AgentRuntimeState {
    const updatedNotes = this.fields.generalNotes.add(noteText);
    return this.copyWith({ generalNotes: updatedNotes });
  }

  public addPromiseMade(promiseText: PromiseText): AgentRuntimeState {
    const updatedPromises = this.fields.promisesMade.add(promiseText);
    return this.copyWith({ promisesMade: updatedPromises });
  }

  public clearGeneralNotes(): AgentRuntimeState {
    return this.copyWith({ generalNotes: GeneralNotesCollection.create() });
  }

  public clearPromisesMade(): AgentRuntimeState {
    return this.copyWith({ promisesMade: PromisesMadeCollection.create() });
  }
}
