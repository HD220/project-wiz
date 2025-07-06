import { z } from "zod";

import { AbstractEntity, EntityProps } from "@/core/common/base.entity";
import { EntityError } from "@/core/domain/common/errors";

import { AgentId } from './value-objects/agent-id.vo';
import { CurrentGoal } from './value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from './value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from './value-objects/internal-state/general-notes.collection';

export interface AgentInternalStateProps {
  id: AgentId;
  currentProjectId?: CurrentProjectId | null;
  currentGoal?: CurrentGoal | null;
  generalNotes: GeneralNotesCollection;
  createdAt?: Date;
  updatedAt?: Date;
}

const AgentInternalStatePropsSchema = z.object({
  id: z.custom<AgentId>((val) => val instanceof AgentId),
  currentProjectId: z.custom<CurrentProjectId | null | undefined>((val) => val === null || val === undefined || val instanceof CurrentProjectId).optional(),
  currentGoal: z.custom<CurrentGoal | null | undefined>((val) => val === null || val === undefined || val instanceof CurrentGoal).optional(),
  generalNotes: z.custom<GeneralNotesCollection>((val) => val instanceof GeneralNotesCollection),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface InternalAgentInternalStateProps extends EntityProps<AgentId> {
  currentProjectId?: CurrentProjectId | null;
  currentGoal?: CurrentGoal | null;
  generalNotes: GeneralNotesCollection;
  createdAt: Date;
  updatedAt: Date;
}

export class AgentInternalState extends AbstractEntity<AgentId, InternalAgentInternalStateProps> {
  private constructor(props: InternalAgentInternalStateProps) {
    super(props);
  }

  public static create(props: AgentInternalStateProps): AgentInternalState {
    const validationResult = AgentInternalStatePropsSchema.safeParse(props);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new EntityError(`Invalid AgentInternalState props: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const now = new Date();
    const internalProps: InternalAgentInternalStateProps = {
      id: props.id,
      currentProjectId: props.currentProjectId === undefined ? null : props.currentProjectId,
      currentGoal: props.currentGoal === undefined ? null : props.currentGoal,
      generalNotes: props.generalNotes || GeneralNotesCollection.create([]),
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new AgentInternalState(internalProps);
  }

  public get currentProjectId(): CurrentProjectId | null | undefined {
    return this.props.currentProjectId;
  }

  public get currentGoal(): CurrentGoal | null | undefined {
    return this.props.currentGoal;
  }

  public get generalNotes(): GeneralNotesCollection {
    return this.props.generalNotes;
  }

  public get agentId(): AgentId {
    return this.props.id;
  }

  public changeCurrentProject(newProjectId?: CurrentProjectId | null): AgentInternalState {
    const newProps = { ...this.props, currentProjectId: newProjectId, updatedAt: new Date() };
    return new AgentInternalState(newProps);
  }

  public changeCurrentGoal(newGoal?: CurrentGoal | null): AgentInternalState {
    const newProps = { ...this.props, currentGoal: newGoal, updatedAt: new Date() };
    return new AgentInternalState(newProps);
  }

  public addGeneralNote(noteText: string): AgentInternalState {
    const updatedNotes = this.generalNotes.addNote(noteText);
    const newProps = { ...this.props, generalNotes: updatedNotes, updatedAt: new Date() };
    return new AgentInternalState(newProps);
  }

  public clearCurrentGoal(): AgentInternalState {
    const newProps = { ...this.props, currentGoal: null, updatedAt: new Date() };
    return new AgentInternalState(newProps);
  }

  public clearCurrentProject(): AgentInternalState {
    const newProps = { ...this.props, currentProjectId: null, updatedAt: new Date() };
    return new AgentInternalState(newProps);
  }

  public setGeneralNotes(newNotes: GeneralNotesCollection): AgentInternalState {
    const newProps = { ...this.props, generalNotes: newNotes, updatedAt: new Date() };
    return new AgentInternalState(newProps);
  }

  public equals(other?: AgentInternalState): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof AgentInternalState)) {
      return false;
    }
    // Compare IDs
    if (!this.id.equals(other.id)) {
      return false;
    }

    // Compare currentProjectId
    const currentProjectIdEquals = 
      (this.currentProjectId === null && other.currentProjectId === null) ||
      (this.currentProjectId === undefined && other.currentProjectId === undefined) ||
      (this.currentProjectId !== null && this.currentProjectId !== undefined &&
       other.currentProjectId !== null && other.currentProjectId !== undefined &&
       this.currentProjectId.equals(other.currentProjectId));
    if (!currentProjectIdEquals) {
      return false;
    }

    // Compare currentGoal
    const currentGoalEquals = 
      (this.currentGoal === null && other.currentGoal === null) ||
      (this.currentGoal === undefined && other.currentGoal === undefined) ||
      (this.currentGoal !== null && this.currentGoal !== undefined &&
       other.currentGoal !== null && other.currentGoal !== undefined &&
       this.currentGoal.equals(other.currentGoal));
    if (!currentGoalEquals) {
      return false;
    }

    // Compare generalNotes
    if (!this.generalNotes.equals(other.generalNotes)) {
      return false;
    }

    return true;
  }
}