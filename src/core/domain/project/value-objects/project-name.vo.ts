import { z } from 'zod';

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from '@/core/domain/common/errors';

const ProjectNameSchema = z.string()
  .trim()
  .min(1, 'Project name must be at least 1 character long.')
  .max(100, 'Project name must be at most 100 characters long.');

interface ProjectNameProps extends ValueObjectProps {
  value: string;
}

export class ProjectName extends AbstractValueObject<ProjectNameProps> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(name: string): ProjectName {
    const validationResult = ProjectNameSchema.safeParse(name);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid project name format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new ProjectName(validationResult.data);
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}

