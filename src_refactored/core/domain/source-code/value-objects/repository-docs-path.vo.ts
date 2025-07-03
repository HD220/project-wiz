import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const RepositoryDocsPathSchema = z.string()
  .trim()
  .min(1, 'Repository docs path cannot be empty.');

interface RepositoryDocsPathProps extends ValueObjectProps {
  value: string;
}

export class RepositoryDocsPath extends AbstractValueObject<RepositoryDocsPathProps> {
  private constructor(props: RepositoryDocsPathProps) {
    super(props);
  }

  public static create(path: string): RepositoryDocsPath {
    const validationResult = RepositoryDocsPathSchema.safeParse(path);
    if (!validationResult.success) {
      throw new ValueError('Invalid repository docs path format.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new RepositoryDocsPath({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: RepositoryDocsPath): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value;
  }
}
