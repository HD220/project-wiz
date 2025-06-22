// src_refactored/core/domain/source-code/value-objects/repository-docs-path.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface RepositoryDocsPathProps extends ValueObjectProps {
  value: string;
}

export class RepositoryDocsPath extends AbstractValueObject<RepositoryDocsPathProps> {
  private constructor(value: string) {
    super({ value });
  }

  private static validate(path: string): void {
    if (path.trim().length === 0) {
      throw new Error('Repository docs path cannot be empty.');
    }
    // Similar to RepositoryPath, further validation could be added.
  }

  public static create(path: string): RepositoryDocsPath {
    this.validate(path);
    return new RepositoryDocsPath(path);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
