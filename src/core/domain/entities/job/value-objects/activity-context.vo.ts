import { AbstractValueObject } from "@/core/common/value-objects/abstract.vo";
import { ActivityHistoryEntry } from "./activity-history-entry.vo";
import { ActivityHistory } from "./activity-history.vo";
import { ActivityNotes } from "./activity-notes.vo";
import { DomainError } from "@/core/common/errors";

interface ActivityContextProps {
  messageContent?: string;
  sender?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  goalToPlan?: string;
  plannedSteps?: string[];
  activityNotes?: ActivityNotes;
  validationCriteria?: string[];
  validationResult?: "PASSED" | "FAILED" | "PENDING";
  activityHistory: ActivityHistory;
}

export class ActivityContext extends AbstractValueObject<ActivityContextProps> {
  protected constructor(value: ActivityContextProps) {
    super(value);
    this.validateProps(value);
  }

  private validateProps(props: ActivityContextProps): void {
    if (!props.activityHistory) {
      throw new DomainError("Activity history cannot be null.");
    }
  }

  public static create(props: ActivityContextProps): ActivityContext {
    return new ActivityContext(props);
  }

  public addHistoryEntry(entry: ActivityHistoryEntry): ActivityContext {
    const updatedHistory = this.value.activityHistory.addEntry(entry);
    return ActivityContext.create({
      ...this.value,
      activityHistory: updatedHistory,
    });
  }

  public addNote(note: string): ActivityContext {
    const updatedNotes = (
      this.value.activityNotes || ActivityNotes.create([])
    ).addNote(note);
    return ActivityContext.create({
      ...this.value,
      activityNotes: updatedNotes,
    });
  }
}
