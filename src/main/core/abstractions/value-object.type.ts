/**
 * Base value object interface
 * Defines contract for value objects in the domain
 * Value objects are immutable and identified by their properties
 */
export interface IValueObject {
  /**
   * Check if this value object is equal to another value object
   * @param other - Value object to compare with
   * @returns True if value objects are equal
   */
  equals(other: IValueObject): boolean;

  /**
   * Convert value object to plain object
   * @returns Plain object representation
   */
  toPlainObject(): Record<string, unknown>;
}

/**
 * Base value object class
 * Provides common functionality for all value objects
 * Value objects are immutable and equality is based on their properties
 */
export abstract class ValueObject implements IValueObject {
  /**
   * Check if this value object is equal to another value object
   * Performs deep equality comparison of all properties
   * @param other - Value object to compare with
   * @returns True if value objects are equal
   */
  public equals(other: ValueObject): boolean {
    if (!(other instanceof ValueObject)) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.deepEquals(this.toPlainObject(), other.toPlainObject());
  }

  /**
   * Convert value object to plain object
   * Must be implemented by concrete value objects
   * @returns Plain object representation
   */
  public abstract toPlainObject(): Record<string, unknown>;

  /**
   * Create a copy of this value object with some properties changed
   * @param changes - Properties to change
   * @returns New value object instance with changes applied
   */
  protected copyWith(changes: Partial<Record<string, unknown>>): this {
    const plain = this.toPlainObject();
    const updated = { ...plain, ...changes };
    return this.createFromPlainObject(updated);
  }

  /**
   * Create a value object instance from plain object
   * Must be implemented by concrete value objects
   * @param plain - Plain object to create from
   * @returns New value object instance
   */
  protected abstract createFromPlainObject(
    plain: Record<string, unknown>,
  ): this;

  /**
   * Perform deep equality comparison of two objects
   * @param obj1 - First object to compare
   * @param obj2 - Second object to compare
   * @returns True if objects are deeply equal
   */
  private deepEquals(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== typeof obj2 || typeof obj1 !== "object")
      return obj1 === obj2;
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

    if (Array.isArray(obj1)) {
      return this.compareArrays(obj1, obj2 as unknown[]);
    }

    return this.compareObjects(
      obj1 as Record<string, unknown>,
      obj2 as Record<string, unknown>,
    );
  }

  /**
   * Compare two arrays for deep equality
   */
  private compareArrays(arr1: unknown[], arr2: unknown[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => this.deepEquals(item, arr2[index]));
  }

  /**
   * Compare two objects for deep equality
   */
  private compareObjects(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
  ): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;
    return keys1.every((key) => this.deepEquals(obj1[key], obj2[key]));
  }
}

/**
 * Simple value object implementation for primitive values
 * Use this for value objects that wrap a single primitive value
 *
 * @template T - Type of the wrapped value
 */
export class PrimitiveValueObject<T> extends ValueObject {
  protected readonly value: T;

  protected constructor(value: T) {
    super();
    this.value = value;
  }

  /**
   * Get the wrapped value
   * @returns The wrapped value
   */
  public getValue(): T {
    return this.value;
  }

  /**
   * Convert to plain object
   * @returns Plain object with the wrapped value
   */
  public toPlainObject(): Record<string, unknown> {
    return { value: this.value };
  }

  /**
   * Create from plain object
   * @param plain - Plain object to create from
   * @returns New instance
   */
  protected createFromPlainObject(plain: Record<string, unknown>): this {
    return new (this.constructor as new (value: T) => this)(plain.value as T);
  }
}
