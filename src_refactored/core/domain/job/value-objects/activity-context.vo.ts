// src_refactored/core/domain/job/value-objects/activity-context.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';
import { ActivityHistoryEntry } from './activity-history-entry.vo';
import { JobTimestamp } from './job-timestamp.vo'; // Added missing import
import { ActivityHistory } from './activity-history.vo';
import { ActivityNotes } from './activity-notes.vo';
import { MessageContent } from './context-parts/message-content.vo';
import { Sender } from './context-parts/sender.vo';
import { ToolName } from './context-parts/tool-name.vo';
import { GoalToPlan } from './context-parts/goal-to-plan.vo';
import { PlannedStepsCollection } from './context-parts/planned-steps.collection';
import { ValidationCriteriaCollection } from './context-parts/validation-criteria.collection';
import { ValidationStatus, ValidationStatusType } from './context-parts/validation-status.vo';

// Represents the structure of data passed to create or update ActivityContext
// Uses primitive types where VOs would be constructed from.
export interface ActivityContextInput {
  messageContent?: string;
  sender?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>; // Kept as Record for flexibility with tool arguments
  goalToPlan?: string;
  plannedSteps?: string[];
  activityNotes?: string[]; // Input as array of strings
  validationCriteria?: string[]; // Input as array of strings
  validationResult?: ValidationStatusType; // Input as enum string
  activityHistory?: { role: any; content: string; timestamp?: Date, toolName?: string, toolCallId?: string }[]; // Input for history entries
}

// Internal properties using Value Objects
interface ActivityContextProps extends ValueObjectProps {
  messageContent?: MessageContent;
  sender?: Sender;
  toolName?: ToolName;
  toolArgs?: Readonly<Record<string, unknown>>; // Make it readonly internally
  goalToPlan?: GoalToPlan;
  plannedSteps?: PlannedStepsCollection;
  activityNotes: ActivityNotes; // Non-optional, defaults to empty
  validationCriteria?: ValidationCriteriaCollection;
  validationResult: ValidationStatus; // Non-optional, defaults to NOT_VALIDATED
  activityHistory: ActivityHistory; // Non-optional, defaults to empty
}

export class ActivityContext extends AbstractValueObject<ActivityContextProps> {
  private constructor(props: ActivityContextProps) {
    super(props);
  }

  public static create(input: Partial<ActivityContextInput> = {}): ActivityContext {
    const historyEntries = (input.activityHistory || []).map(entry =>
      ActivityHistoryEntry.create(
        entry.role,
        entry.content,
        entry.timestamp ? new JobTimestamp(entry.timestamp) : undefined, // Corrected this line
        entry.toolName,
        entry.toolCallId
      )
    );

    const props: ActivityContextProps = {
      messageContent: input.messageContent ? MessageContent.create(input.messageContent) : undefined,
      sender: input.sender ? Sender.create(input.sender) : undefined,
      toolName: input.toolName ? ToolName.create(input.toolName) : undefined,
      toolArgs: input.toolArgs ? Object.freeze({ ...input.toolArgs }) : undefined,
      goalToPlan: input.goalToPlan ? GoalToPlan.create(input.goalToPlan) : undefined,
      plannedSteps: input.plannedSteps ? PlannedStepsCollection.create(input.plannedSteps) : undefined,
      activityNotes: ActivityNotes.create(input.activityNotes || []),
      validationCriteria: input.validationCriteria ? ValidationCriteriaCollection.create(input.validationCriteria) : undefined,
      validationResult: input.validationResult ? ValidationStatus.create(input.validationResult) : ValidationStatus.notValidated(),
      activityHistory: ActivityHistory.create(historyEntries),
    };
    return new ActivityContext(props);
  }

  // Methods to "update" properties by returning a new ActivityContext instance
  public withMessageContent(messageContent?: MessageContent): ActivityContext {
    return new ActivityContext({ ...this.props, messageContent });
  }
  public withSender(sender?: Sender): ActivityContext {
    return new ActivityContext({ ...this.props, sender });
  }
  public withToolInfo(toolName?: ToolName, toolArgs?: Record<string, unknown>): ActivityContext {
    return new ActivityContext({ ...this.props, toolName, toolArgs: toolArgs ? Object.freeze({...toolArgs}) : undefined });
  }
  public withGoalToPlan(goalToPlan?: GoalToPlan): ActivityContext {
    return new ActivityContext({ ...this.props, goalToPlan });
  }
  public withPlannedSteps(plannedSteps?: PlannedStepsCollection): ActivityContext {
    return new ActivityContext({ ...this.props, plannedSteps });
  }
  public withValidationCriteria(validationCriteria?: ValidationCriteriaCollection): ActivityContext {
    return new ActivityContext({ ...this.props, validationCriteria });
  }
  public withValidationResult(validationResult: ValidationStatus): ActivityContext {
    return new ActivityContext({ ...this.props, validationResult });
  }

  public addHistoryEntry(entry: ActivityHistoryEntry): ActivityContext {
    const updatedHistory = this.props.activityHistory.addEntry(entry);
    return new ActivityContext({ ...this.props, activityHistory: updatedHistory });
  }

  public addNote(note: string): ActivityContext {
    const updatedNotes = this.props.activityNotes.addNote(note);
    return new ActivityContext({ ...this.props, activityNotes: updatedNotes });
  }

  // Accessor methods that return the VOs themselves
  public messageContent(): MessageContent | undefined { return this.props.messageContent; }
  public sender(): Sender | undefined { return this.props.sender; }
  public toolName(): ToolName | undefined { return this.props.toolName; }
  public toolArgs(): Readonly<Record<string, unknown>> | undefined { return this.props.toolArgs; } // Return as Readonly
  public goalToPlan(): GoalToPlan | undefined { return this.props.goalToPlan; }
  public plannedSteps(): PlannedStepsCollection | undefined { return this.props.plannedSteps; }
  public activityNotes(): ActivityNotes { return this.props.activityNotes; }
  public validationCriteria(): ValidationCriteriaCollection | undefined { return this.props.validationCriteria; }
  public validationResult(): ValidationStatus { return this.props.validationResult; }
  public activityHistory(): ActivityHistory { return this.props.activityHistory; }

  // equals is inherited from AbstractValueObject and will perform a deep comparison
  // based on JSON.stringify of the props, which should be suitable given all
  // nested properties are also VOs with reliable equality checks or are primitive.
}
