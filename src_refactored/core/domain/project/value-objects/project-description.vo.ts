import { z } from 'zod';

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from '@/core/domain/common/errors';

const ProjectDescriptionSchema = z.string()
  .max(500, 'Project description must be at most 500 characters long.');

interface ProjectDescriptionProps extends ValueObjectProps {
  value: string;
}

export class ProjectDescription extends AbstractValueObject<ProjectDescriptionProps> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(description: string): ProjectDescription {
    const validationResult = ProjectDescriptionSchema.safeParse(description);
    if (!validationResult.success) {
      throw new ValueError('Invalid project description format.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new ProjectDescription(validationResult.data);
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
