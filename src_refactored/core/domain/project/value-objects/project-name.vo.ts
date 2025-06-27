// src_refactored/core/domain/project/value-objects/project-name.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

interface ProjectNameProps extends ValueObjectProps {
  value: string;
}

export class ProjectName extends AbstractValueObject<ProjectNameProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100; // Example max length

  private constructor(value: string) {
    super({ value });
  }

  private static validate(name: string): void {
    if (name.length < this.MIN_LENGTH) {
      throw new Error(`Project name must be at least ${this.MIN_LENGTH} character long.`);
    }
    if (name.length > this.MAX_LENGTH) {
      throw new Error(`Project name must be at most ${this.MAX_LENGTH} characters long.`);
    }
    // Add other validation rules if necessary (e.g., allowed characters)
  }

  public static create(name: string): ProjectName {
    this.validate(name);
    return new ProjectName(name);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
