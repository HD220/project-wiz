import { DomainError } from "@/core/common/errors";

export abstract class AbstractValueObject<T> {
  protected constructor(public readonly value: T) {
    if (value === null || value === undefined) {
      throw new DomainError("Value object cannot be null or undefined.");
    }
    // Pode adicionar validação comum aqui se necessário
  }

  public equals(vo?: AbstractValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.value === undefined) {
      return false;
    }
    return this.value === vo.value;
  }
}
