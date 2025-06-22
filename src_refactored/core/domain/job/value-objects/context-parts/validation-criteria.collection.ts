// src_refactored/core/domain/job/value-objects/context-parts/validation-criteria.collection.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

// Simple string wrapper for individual criterion
class CriterionText extends AbstractValueObject<{value: string}> {
    private constructor(value: string) { super({value}); }
    public static create(text: string): CriterionText {
        if (text === null || text === undefined || text.trim().length === 0) {
            throw new Error("Validation criterion text cannot be empty.");
        }
        if (text.length > 500) { // Example limit
            throw new Error("Single validation criterion text exceeds maximum length.");
        }
        return new CriterionText(text);
    }
    public value(): string { return this.props.value; }
}

interface ValidationCriteriaCollectionProps extends ValueObjectProps {
  criteria: ReadonlyArray<CriterionText>;
}

export class ValidationCriteriaCollection extends AbstractValueObject<ValidationCriteriaCollectionProps> {
  private constructor(criteria: CriterionText[]) {
    super({ criteria: Object.freeze([...criteria]) });
  }

  public static create(criteria: string[] = []): ValidationCriteriaCollection {
    if (!Array.isArray(criteria)) {
      throw new Error('Criteria must be an array to create ValidationCriteriaCollection.');
    }
    const criteriaTextObjects = criteria.map(criterionStr => CriterionText.create(criterionStr));
    return new ValidationCriteriaCollection(criteriaTextObjects);
  }

  public list(): ReadonlyArray<string> {
    return this.props.criteria.map(criterion => criterion.value());
  }

  public addCriterion(criterion: string): ValidationCriteriaCollection {
    const newCriterionText = CriterionText.create(criterion);
    const newCriteria = [...this.props.criteria, newCriterionText];
    return new ValidationCriteriaCollection(newCriteria);
  }

  public count(): number {
    return this.props.criteria.length;
  }

  public isEmpty(): boolean {
    return this.props.criteria.length === 0;
  }

  // The base AbstractValueObject.equals using JSON.stringify will work here.
}
