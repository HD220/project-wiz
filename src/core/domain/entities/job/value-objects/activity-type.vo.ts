import { AbstractValueObject } from "@/core/common/value-objects/abstract.vo";
import { error, ok, Result } from "@/shared/result";

export enum ActivityTypes {
  USER_REQUEST = "USER_REQUEST",
  AGENT_REQUEST = "AGENT_REQUEST",
  PLANNING = "PLANNING",
  EXECUTION = "EXECUTION",
  COMMUNICATION = "COMMUNICATION",
  REFLECTION = "REFLECTION",
  ERROR_HANDLING = "ERROR_HANDLING",
  VALIDATION = "VALIDATION",
  INFORMATION_GATHERING = "INFORMATION_GATHERING",
}

export class ActivityType extends AbstractValueObject<ActivityTypes> {
  private constructor(value: ActivityTypes) {
    super(value);
  }

  public static create(type: string): Result<ActivityType> {
    if (!Object.values(ActivityTypes).includes(type as ActivityTypes)) {
      return error(
        `Invalid ActivityType: ${type}. Must be one of ${Object.values(
          ActivityTypes
        ).join(", ")}.`
      );
    }

    return ok(new ActivityType(type as ActivityTypes));
  }
}
