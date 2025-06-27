// src_refactored/core/domain/project/value-objects/project-description.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

interface ProjectDescriptionProps extends ValueObjectProps {
  value: string;
}

export class ProjectDescription extends AbstractValueObject<ProjectDescriptionProps> {
  private static readonly MAX_LENGTH = 500; // Example max length

  private constructor(value: string) {
    super({ value });
  }

  private static validate(description: string): void {
    if (description.length > this.MAX_LENGTH) {
      throw new Error(`Project description must be at most ${this.MAX_LENGTH} characters long.`);
    }
    // Add other validation rules if necessary
  }

  public static create(description: string): ProjectDescription {
    this.validate(description);
    return new ProjectDescription(description);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
