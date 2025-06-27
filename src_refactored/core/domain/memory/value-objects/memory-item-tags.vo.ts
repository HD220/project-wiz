// src_refactored/core/domain/memory/value-objects/memory-item-tags.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo'; // Corrected path

import { ValueError } from '@/domain/common/errors'; // Corrected path

interface MemoryItemTagsProps extends ValueObjectProps {
  value: string[];
}

export class MemoryItemTags extends AbstractValueObject<MemoryItemTagsProps> {
  private static readonly MAX_TAGS = 20;
  private static readonly MAX_TAG_LENGTH = 50;
  private static readonly MIN_TAG_LENGTH = 1;

  private constructor(props: MemoryItemTagsProps) {
    super(props);
  }

  public static create(tags: string[] | null | undefined): MemoryItemTags {
    const processedTags = this.processAndValidate(tags);
    return new MemoryItemTags({ value: processedTags });
  }

  private static processAndValidate(tags: string[] | null | undefined): string[] {
    if (tags === null || tags === undefined || tags.length === 0) {
      return []; // Return empty array for null, undefined, or empty input
    }

    if (tags.length > this.MAX_TAGS) {
      throw new ValueError(`A memory item cannot have more than ${this.MAX_TAGS} tags.`);
    }

    const cleanedTags = tags
      .map(tag => {
        if (tag === null || tag === undefined) {
          throw new ValueError('Tag cannot be null or undefined.');
        }
        const trimmedTag = tag.trim();
        if (trimmedTag.length < this.MIN_TAG_LENGTH) {
          throw new ValueError(`Tag "${tag}" is too short. Minimum length is ${this.MIN_TAG_LENGTH}.`);
        }
        if (trimmedTag.length > this.MAX_TAG_LENGTH) {
          throw new ValueError(`Tag "${tag}" is too long. Maximum length is ${this.MAX_TAG_LENGTH}.`);
        }
        // Optional: Add regex for allowed characters in tags (e.g., no spaces, specific symbols)
        // For now, just ensuring it's a valid string of certain length.
        return trimmedTag;
      })
      .filter(tag => tag.length > 0); // Should be redundant due to MIN_TAG_LENGTH check but good for safety

    // Check for duplicate tags after cleaning
    const uniqueTags = new Set(cleanedTags);
    if (uniqueTags.size !== cleanedTags.length) {
      throw new ValueError('Duplicate tags are not allowed.');
    }

    return Array.from(uniqueTags);
  }

  public value(): string[] {
    // Return a copy to maintain immutability of the internal array
    return [...this.props.value];
  }

  // Override equals for array comparison
  public equals(other?: MemoryItemTags | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this.props.value.length !== other.props.value.length) {
      return false;
    }
    // Sort copies of arrays to ensure order doesn't matter for equality
    const thisSorted = [...this.props.value].sort();
    const otherSorted = [...other.props.value].sort();
    return thisSorted.every((val, index) => val === otherSorted[index]);
  }
}
