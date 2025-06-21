import { ActivityType } from './activity-type.vo';
import { ActivityHistory } from './activity-history.vo';
// import { PlannedSteps } from './planned-steps.vo'; // Future VO
// import { ActivityNotes } from './activity-notes.vo'; // Future VO

export interface ActivityContextData {
  type: ActivityType;
  history: ActivityHistory;
  currentGoal?: string; // Optional: Specific goal for this activity
  // plannedSteps?: PlannedSteps; // Future
  // notes?: ActivityNotes; // Future
  // Add other context-specific fields
}

export class ActivityContext {
  private readonly data: Readonly<ActivityContextData>;

  private constructor(data: ActivityContextData) {
    // Add validation if needed
    this.data = Object.freeze(data);
  }

  public static create(data: ActivityContextData): ActivityContext {
    return new ActivityContext(data);
  }

  public getData(): Readonly<ActivityContextData> {
    return this.data;
  }

  public getType(): ActivityType {
    return this.data.type;
  }

  public getHistory(): ActivityHistory {
    return this.data.history;
  }

  public updateHistory(newHistory: ActivityHistory): ActivityContext {
    return new ActivityContext({ ...this.data, history: newHistory });
  }
}
