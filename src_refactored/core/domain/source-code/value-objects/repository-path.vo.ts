// src_refactored/core/domain/source-code/value-objects/repository-path.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface RepositoryPathProps extends ValueObjectProps {
  value: string;
}

export class RepositoryPath extends AbstractValueObject<RepositoryPathProps> {
  private constructor(value: string) {
    super({ value });
  }

  private static validate(path: string): void {
    if (path.trim().length === 0) {
      throw new Error('Repository path cannot be empty.');
    }
    // Basic validation. More complex validation (e.g., valid characters for paths)
    // could be added but might be platform-dependent.
    // Should not contain relative segments like '..' after normalization if it's an absolute path,
    // but for now, we assume paths are handled carefully by consuming services.
  }

  public static create(path: string): RepositoryPath {
    this.validate(path);
    // Consider path normalization here if necessary (e.g., path.normalize())
    // For simplicity, using the provided path as is after validation.
    return new RepositoryPath(path);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
