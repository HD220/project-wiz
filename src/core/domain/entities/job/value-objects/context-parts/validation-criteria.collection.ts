import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

// Individual criterion validation (optional, could be a CriterionText VO later)
const criterionSchema = z.string().min(1, { message: "Validation criterion cannot be empty." });

export class ValidationCriteriaCollection {
  private constructor(private readonly criteria: string[]) {
    // Internal constructor, assumes criteria are validated by `create` or `addCriterion`
  }

  public static create(criteria: string[] = []): ValidationCriteriaCollection {
    try {
      criteria.forEach(criterion => criterionSchema.parse(criterion)); // Validate each criterion
      return new ValidationCriteriaCollection([...criteria]); // Store a copy
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid ValidationCriteriaCollection: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public addCriterion(criterion: string): ValidationCriteriaCollection {
    try {
      criterionSchema.parse(criterion); // Validate the new criterion
      return new ValidationCriteriaCollection([...this.criteria, criterion]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Error adding criterion: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValues(): string[] { // Expose values as a new array for immutability
    return [...this.criteria];
  }

  public forEach(callback: (criterion: string, index: number) => void): void {
    this.criteria.forEach(callback);
  }

  public map<U>(callback: (criterion: string, index: number) => U): U[] {
    return this.criteria.map(callback);
  }

  public filter(callback: (criterion: string, index: number) => boolean): ValidationCriteriaCollection {
    const filteredCriteria = this.criteria.filter(callback);
    return new ValidationCriteriaCollection(filteredCriteria); // Create new instance
  }

  public isEmpty(): boolean {
    return this.criteria.length === 0;
  }

  public count(): number {
    return this.criteria.length;
  }

  public equals(other: ValidationCriteriaCollection): boolean {
    if (this.criteria.length !== other.criteria.length) {
      return false;
    }
    return this.criteria.every((criterion, index) => criterion === other.criteria[index]);
  }
}
