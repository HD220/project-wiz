import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/common-domain.errors';

const ToolNamesSchema = z.array(z.string().min(1, 'Tool name cannot be empty.'))
  .optional()
  .default([]);

interface ToolNamesProps extends ValueObjectProps {
  value: ReadonlyArray<string>;
}

export class ToolNames extends AbstractValueObject<ToolNamesProps> {
  private constructor(props: ToolNamesProps) {
    super(props);
  }

  public static create(toolNames: string[] | undefined | null): ToolNames {
    const validationResult = ToolNamesSchema.safeParse(toolNames);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid tool names: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new ToolNames({ value: Object.freeze(validationResult.data) });
  }

  public get value(): ReadonlyArray<string> {
    return this.props.value;
  }

  public hasTool(toolName: string): boolean {
    return this.props.value.includes(toolName);
  }

  public count(): number {
    return this.props.value.length;
  }

  public equals(vo?: ToolNames): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value.join(', ');
  }
}
