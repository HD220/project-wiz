/**
 * Base value object class providing common functionality for all value objects
 * Implements immutability and value-based equality
 */

import { ValueObject } from "../abstractions";

/**
 * Abstract base class for all value objects in the system
 * Value objects are immutable and equality is based on their values, not identity
 * Provides common functionality like:
 * - Value-based equality comparison
 * - Immutability enforcement
 * - Validation support
 * - String representation
 */
export abstract class BaseValueObject<T = any> extends ValueObject {
  protected readonly _value: T;

  /**
   * Creates a new value object instance
   * @param value - The value to wrap
   */
  protected constructor(value: T) {
    super();
    this.validate(value);
    this._value = this.deepFreeze(value);
  }

  /**
   * Gets the wrapped value
   * @returns The immutable value
   */
  public get value(): T {
    return this._value;
  }

  /**
   * Validates the value before creating the value object
   * Override this method to implement specific validation logic
   * @param value - The value to validate
   * @throws {Error} If validation fails
   */
  protected validate(value: T): void {
    if (value === null || value === undefined) {
      throw new Error(`${this.constructor.name} cannot be null or undefined`);
    }
  }

  /**
   * Convert value object to plain object
   * @returns Plain object representation
   */
  public toPlainObject(): Record<string, unknown> {
    if (this._value && typeof this._value === "object") {
      return { ...(this._value as Record<string, unknown>) };
    }
    return { value: this._value };
  }

  /**
   * Create a value object instance from plain object
   * @param plain - Plain object to create from
   * @returns New value object instance
   */
  protected createFromPlainObject(plain: Record<string, unknown>): this {
    const value = "value" in plain ? plain.value : plain;
    return new (this.constructor as new (value: T) => this)(value as T);
  }

  /**
   * Deep freezes an object to make it immutable
   * @param obj - The object to freeze
   * @returns The frozen object
   */
  private deepFreeze<U>(obj: U): U {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;

    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach((property) => {
      const value = (obj as any)[property];
      if (value && typeof value === "object") {
        this.deepFreeze(value);
      }
    });

    return obj;
  }

  /**
   * Creates a string representation of the value object
   * @returns String representation
   */
  public toString(): string {
    if (typeof this._value === "object") {
      return JSON.stringify(this._value);
    }
    return String(this._value);
  }

  /**
   * Creates a JSON representation of the value object
   * @returns JSON representation
   */
  public toJSON(): T {
    return this._value;
  }

  /**
   * Gets the hash code for this value object
   * Used for efficient comparison and storage
   * @returns Hash code
   */
  public getHashCode(): number {
    return this.generateHashCode(this._value);
  }

  /**
   * Generates a hash code for a value
   * @param value - The value to generate hash for
   * @returns Hash code
   */
  private generateHashCode(value: any): number {
    if (value === null || value === undefined) return 0;

    const str = typeof value === "string" ? value : JSON.stringify(value);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash;
  }

  /**
   * Checks if the value object is empty
   * Override this method to implement specific empty check logic
   * @returns True if empty, false otherwise
   */
  public isEmpty(): boolean {
    if (this._value === null || this._value === undefined) return true;
    if (typeof this._value === "string") return this._value.length === 0;
    if (Array.isArray(this._value)) return this._value.length === 0;
    if (typeof this._value === "object")
      return Object.keys(this._value).length === 0;
    return false;
  }
}
