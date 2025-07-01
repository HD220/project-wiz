import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";

import { ValueError } from "@/domain/common/errors";

interface MemoryItemEmbeddingProps extends ValueObjectProps {
  value: number[] | null;
}

export class MemoryItemEmbedding extends AbstractValueObject<MemoryItemEmbeddingProps> {
  private constructor(props: MemoryItemEmbeddingProps) {
    super(props);
  }

  public static create(
    embedding: number[] | null | undefined
  ): MemoryItemEmbedding {
    if (embedding === null || embedding === undefined) {
      return new MemoryItemEmbedding({ value: null });
    }
    this.validate(embedding);
    return new MemoryItemEmbedding({ value: [...embedding] });
  }

  private static validate(embedding: number[]): void {
    if (!Array.isArray(embedding)) {
      throw new ValueError("Embedding must be an array of numbers or null.");
    }
    if (embedding.length === 0) {
      throw new ValueError(
        "Embedding array cannot be empty if provided. Use null for no embedding."
      );
    }
    for (const num of embedding) {
      if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
        throw new ValueError(
          "All elements in the embedding array must be finite numbers."
        );
      }
    }
  }

  public value(): number[] | null {
    return this.props.value === null ? null : [...this.props.value];
  }

  public equals(other?: MemoryItemEmbedding | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this.props.value === null && other.props.value === null) {
      return true;
    }
    if (this.props.value === null || other.props.value === null) {
      return false;
    }
    if (this.props.value.length !== other.props.value.length) {
      return false;
    }
    return this.props.value.every(
      (val, index) => val === other.props.value![index]
    );
  }
}
