// Example: Could be an enum or a string with validation
export type ActivityTypeValue = 'USER_REQUEST' | 'TOOL_CALL' | 'AGENT_SELF_REFLECTION' | 'PLAN_EXECUTION'; // Add more as needed
const VALID_ACTIVITY_TYPES: ReadonlyArray<ActivityTypeValue> = ['USER_REQUEST', 'TOOL_CALL', 'AGENT_SELF_REFLECTION', 'PLAN_EXECUTION'];

export class ActivityType {
  private readonly value: ActivityTypeValue;

  private constructor(type: ActivityTypeValue) {
    if (!VALID_ACTIVITY_TYPES.includes(type)) {
      throw new Error(`Invalid activity type: ${type}`);
    }
    this.value = type;
  }

  public static create(type: ActivityTypeValue): ActivityType {
    return new ActivityType(type);
  }

  public getValue(): ActivityTypeValue {
    return this.value;
  }

  public equals(other: ActivityType): boolean {
    return this.value === other.getValue();
  }
}
