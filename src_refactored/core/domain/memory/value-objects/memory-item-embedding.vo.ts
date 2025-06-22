// src_refactored/core/domain/memory/value-objects/memory-item-embedding.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../common/value-objects/base.vo';
import { ValueError } from '../../../../common/errors';

interface MemoryItemEmbeddingProps extends ValueObjectProps {
  value: number[] | null; // Embedding can be null
}

export class MemoryItemEmbedding extends AbstractValueObject<MemoryItemEmbeddingProps> {
  // Example: Common embedding dimension, can be validated if known and fixed.
  // private static readonly EXPECTED_DIMENSION = 1536; // e.g., for OpenAI text-embedding-ada-002

  private constructor(props: MemoryItemEmbeddingProps) {
    super(props);
  }

  public static create(embedding: number[] | null | undefined): MemoryItemEmbedding {
    if (embedding === null || embedding === undefined) {
      return new MemoryItemEmbedding({ value: null });
    }
    this.validate(embedding);
    return new MemoryItemEmbedding({ value: [...embedding] }); // Store a copy
  }

  private static validate(embedding: number[]): void {
    if (!Array.isArray(embedding)) {
      // This case should ideally be caught by TypeScript, but good for runtime safety
      throw new ValueError('Embedding must be an array of numbers or null.');
    }
    if (embedding.length === 0) {
      throw new ValueError('Embedding array cannot be empty if provided. Use null for no embedding.');
    }
    // Optional: Validate embedding dimension if it's fixed and known
    // if (embedding.length !== this.EXPECTED_DIMENSION) {
    //   throw new ValueError(`Embedding dimension mismatch. Expected ${this.EXPECTED_DIMENSION}, got ${embedding.length}.`);
    // }

    // Check if all elements are numbers (and not NaN or Infinity)
    for (const num of embedding) {
      if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
        throw new ValueError('All elements in the embedding array must be finite numbers.');
      }
    }
  }

  public value(): number[] | null {
    // Return a copy to maintain immutability if the value is an array
    return this.props.value === null ? null : [...this.props.value];
  }

  // Override equals for array comparison if not null
  public equals(other?: MemoryItemEmbedding | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this.props.value === null && other.props.value === null) {
      return true;
    }
    if (this.props.value === null || other.props.value === null) {
      return false; // One is null, the other is not
    }
    if (this.props.value.length !== other.props.value.length) {
      return false;
    }
    return this.props.value.every((val, index) => val === other.props.value![index]);
  }
}
