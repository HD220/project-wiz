import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

// Individual step validation (optional, could be a StepText VO later)
const stepSchema = z.string().min(1, { message: "Planned step cannot be empty." });

export class PlannedStepsCollection {
  private constructor(private readonly steps: string[]) {
    // Validate all entries if necessary, though individual steps are validated on add
    // For now, assume `create` receives already validated steps or `addStep` handles it.
  }

  public static create(steps: string[] = []): PlannedStepsCollection {
    // Optionally validate all incoming steps upon creation
    try {
      steps.forEach(step => stepSchema.parse(step)); // Validate each step
      return new PlannedStepsCollection([...steps]); // Store a copy
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid PlannedStepsCollection: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public addStep(step: string): PlannedStepsCollection {
    try {
      stepSchema.parse(step); // Validate the new step
      return new PlannedStepsCollection([...this.steps, step]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Error adding step: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValues(): string[] { // Expose values as a new array for immutability
    return [...this.steps];
  }

  public forEach(callback: (step: string, index: number) => void): void {
    this.steps.forEach(callback);
  }

  public map<U>(callback: (step: string, index: number) => U): U[] {
    return this.steps.map(callback);
  }

  public filter(callback: (step: string, index: number) => boolean): PlannedStepsCollection {
    const filteredSteps = this.steps.filter(callback);
    return new PlannedStepsCollection(filteredSteps); // Create new instance with filtered steps
  }

  public isEmpty(): boolean {
    return this.steps.length === 0;
  }

  public count(): number {
    return this.steps.length;
  }

  public equals(other: PlannedStepsCollection): boolean {
    if (this.steps.length !== other.steps.length) {
      return false;
    }
    return this.steps.every((step, index) => step === other.steps[index]);
  }
}
