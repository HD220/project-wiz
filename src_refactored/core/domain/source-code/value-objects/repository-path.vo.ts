import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const RepositoryPathSchema = z.string()
  .trim()
  .min(1, 'Repository path cannot be empty.');

interface RepositoryPathProps extends ValueObjectProps {
  value: string;
}

export class RepositoryPath extends AbstractValueObject<RepositoryPathProps> {
  private constructor(props: RepositoryPathProps) {
    super(props);
  }

  public static create(path: string): RepositoryPath {
    const validationResult = RepositoryPathSchema.safeParse(path);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid repository path format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new RepositoryPath({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: RepositoryPath): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value;
  }
}
