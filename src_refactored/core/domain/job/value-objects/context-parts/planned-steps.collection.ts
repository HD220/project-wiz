// src_refactored/core/domain/job/value-objects/context-parts/planned-steps.collection.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

// Simple string wrapper for individual planned step to enforce validation if any
class PlannedStepText extends AbstractValueObject<{value: string}> {
    private constructor(value: string) { super({value}); }
    public static create(text: string): PlannedStepText {
        if (text === null || text === undefined || text.trim().length === 0) {
            throw new Error("Planned step text cannot be empty.");
        }
        if (text.length > 500) { // Example limit for a single step description
            throw new Error("Single planned step text exceeds maximum length.");
        }
        return new PlannedStepText(text);
    }
    public value(): string { return this.props.value; }
}

interface PlannedStepsCollectionProps extends ValueObjectProps {
  steps: ReadonlyArray<PlannedStepText>;
}

export class PlannedStepsCollection extends AbstractValueObject<PlannedStepsCollectionProps> {
  private constructor(steps: PlannedStepText[]) {
    super({ steps: Object.freeze([...steps]) });
  }

  public static create(steps: string[] = []): PlannedStepsCollection {
    if (!Array.isArray(steps)) {
      throw new Error('Steps must be an array to create PlannedStepsCollection.');
    }
    const stepTextObjects = steps.map(stepStr => PlannedStepText.create(stepStr));
    return new PlannedStepsCollection(stepTextObjects);
  }

  public list(): ReadonlyArray<string> {
    return this.props.steps.map(step => step.value());
  }

  public addStep(step: string): PlannedStepsCollection {
    const newStepText = PlannedStepText.create(step);
    const newSteps = [...this.props.steps, newStepText];
    return new PlannedStepsCollection(newSteps);
  }

  public count(): number {
    return this.props.steps.length;
  }

  public isEmpty(): boolean {
    return this.props.steps.length === 0;
  }

  // The base AbstractValueObject.equals using JSON.stringify will work here.
}
