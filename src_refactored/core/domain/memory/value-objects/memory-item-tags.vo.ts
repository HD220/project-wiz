import { z } from 'zod';

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from "@/core/domain/common/errors";

const TagSchema = z.string()
  .trim()
  .min(1, 'Tag is too short. Minimum length is 1.')
  .max(50, 'Tag is too long. Maximum length is 50.');

const MemoryItemTagsSchema = z.array(TagSchema)
  .max(20, 'A memory item cannot have more than 20 tags.')
  .refine(tags => new Set(tags).size === tags.length, 'Duplicate tags are not allowed.')
  .transform(tags => tags.map(tag => tag.toLowerCase()));

interface MemoryItemTagsProps extends ValueObjectProps {
  value: string[];
}

export class MemoryItemTags extends AbstractValueObject<MemoryItemTagsProps> {
  private constructor(props: MemoryItemTagsProps) {
    super(props);
  }

  public static create(tags: string[] | null | undefined): MemoryItemTags {
    const processedTags = tags === null || tags === undefined ? [] : tags;
    const validationResult = MemoryItemTagsSchema.safeParse(processedTags);

    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid memory item tags format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new MemoryItemTags({ value: validationResult.data });
  }

  public get value(): string[] {
    return [...this.props.value];
  }

  public equals(vo?: MemoryItemTags): boolean {
    return super.equals(vo);
  }
}

