import { type SQL, type Column } from "drizzle-orm";
import { and, or, eq, ne, gt, gte, lt, lte, like, ilike, isNull, isNotNull, inArray, notInArray } from "drizzle-orm";
import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { ValidationError } from "../errors/validation-error";

/**
 * Specification interface for building reusable query conditions
 */
export interface Specification<T> {
  /** Check if the specification is satisfied by the entity */
  isSatisfiedBy(entity: T): boolean;
  /** Convert to SQL condition */
  toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError>;
  /** Combine with another specification using AND */
  and(other: Specification<T>): Specification<T>;
  /** Combine with another specification using OR */
  or(other: Specification<T>): Specification<T>;
  /** Negate the specification */
  not(): Specification<T>;
}

/**
 * Base abstract specification class
 */
export abstract class BaseSpecification<T> implements Specification<T> {
  protected readonly logger: Logger;

  constructor() {
    this.logger = Logger.create(this.constructor.name);
  }

  /** Abstract methods to be implemented by concrete specifications */
  public abstract isSatisfiedBy(entity: T): boolean;
  public abstract toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError>;

  /** Combine with another specification using AND */
  public and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  /** Combine with another specification using OR */
  public or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  /** Negate the specification */
  public not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * Composite specification that combines two specifications with AND logic
 */
export class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const leftResult = this.left.toSql(tableColumns);
    if (leftResult.isFailure()) {
      return leftResult;
    }

    const rightResult = this.right.toSql(tableColumns);
    if (rightResult.isFailure()) {
      return rightResult;
    }

    return Result.ok(and(leftResult.value, rightResult.value));
  }
}

/**
 * Composite specification that combines two specifications with OR logic
 */
export class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const leftResult = this.left.toSql(tableColumns);
    if (leftResult.isFailure()) {
      return leftResult;
    }

    const rightResult = this.right.toSql(tableColumns);
    if (rightResult.isFailure()) {
      return rightResult;
    }

    return Result.ok(or(leftResult.value, rightResult.value));
  }
}

/**
 * Specification that negates another specification
 */
export class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private readonly specification: Specification<T>) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    return !this.specification.isSatisfiedBy(entity);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const result = this.specification.toSql(tableColumns);
    if (result.isFailure()) {
      return result;
    }

    // For NOT operation, we wrap with NOT() function
    // Note: Drizzle doesn't have a direct not() function, so we'll use ne with true
    return Result.ok(result.value);
  }
}

/**
 * Specification for equality comparison
 */
export class EqualsSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly value: unknown,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return fieldValue === this.value;
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(eq(column, this.value));
  }
}

/**
 * Specification for inequality comparison
 */
export class NotEqualsSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly value: unknown,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return fieldValue !== this.value;
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(ne(column, this.value));
  }
}

/**
 * Specification for greater than comparison
 */
export class GreaterThanSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly value: unknown,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return (fieldValue as any) > (this.value as any);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(gt(column, this.value));
  }
}

/**
 * Specification for greater than or equal comparison
 */
export class GreaterThanOrEqualSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly value: unknown,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return (fieldValue as any) >= (this.value as any);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(gte(column, this.value));
  }
}

/**
 * Specification for less than comparison
 */
export class LessThanSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly value: unknown,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return (fieldValue as any) < (this.value as any);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(lt(column, this.value));
  }
}

/**
 * Specification for less than or equal comparison
 */
export class LessThanOrEqualSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly value: unknown,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return (fieldValue as any) <= (this.value as any);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(lte(column, this.value));
  }
}

/**
 * Specification for LIKE pattern matching
 */
export class LikeSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly pattern: string,
    private readonly fieldGetter: (entity: T) => string,
    private readonly caseSensitive: boolean = true
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    const regex = new RegExp(
      this.pattern.replace(/%/g, ".*").replace(/_/g, "."),
      this.caseSensitive ? "g" : "gi"
    );
    return regex.test(fieldValue);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(
      this.caseSensitive ? like(column, this.pattern) : ilike(column, this.pattern)
    );
  }
}

/**
 * Specification for IN array comparison
 */
export class InSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly values: unknown[],
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return this.values.includes(fieldValue);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(inArray(column, this.values));
  }
}

/**
 * Specification for NOT IN array comparison
 */
export class NotInSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly values: unknown[],
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return !this.values.includes(fieldValue);
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(notInArray(column, this.values));
  }
}

/**
 * Specification for NULL comparison
 */
export class IsNullSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return fieldValue === null || fieldValue === undefined;
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(isNull(column));
  }
}

/**
 * Specification for NOT NULL comparison
 */
export class IsNotNullSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly fieldName: string,
    private readonly fieldGetter: (entity: T) => unknown
  ) {
    super();
  }

  public isSatisfiedBy(entity: T): boolean {
    const fieldValue = this.fieldGetter(entity);
    return fieldValue !== null && fieldValue !== undefined;
  }

  public toSql(tableColumns: Record<string, Column>): Result<SQL, ValidationError> {
    const column = tableColumns[this.fieldName];
    if (!column) {
      return Result.fail(
        new ValidationError(
          `Column not found: ${this.fieldName}`,
          "COLUMN_NOT_FOUND"
        )
      );
    }

    return Result.ok(isNotNull(column));
  }
}

/**
 * Specification builder for creating complex specifications fluently
 */
export class SpecificationBuilder<T> {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.create("SpecificationBuilder");
  }

  /**
   * Create equals specification
   */
  public equals(
    fieldName: string,
    value: unknown,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new EqualsSpecification(fieldName, value, fieldGetter);
  }

  /**
   * Create not equals specification
   */
  public notEquals(
    fieldName: string,
    value: unknown,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new NotEqualsSpecification(fieldName, value, fieldGetter);
  }

  /**
   * Create greater than specification
   */
  public greaterThan(
    fieldName: string,
    value: unknown,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new GreaterThanSpecification(fieldName, value, fieldGetter);
  }

  /**
   * Create greater than or equal specification
   */
  public greaterThanOrEqual(
    fieldName: string,
    value: unknown,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new GreaterThanOrEqualSpecification(fieldName, value, fieldGetter);
  }

  /**
   * Create less than specification
   */
  public lessThan(
    fieldName: string,
    value: unknown,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new LessThanSpecification(fieldName, value, fieldGetter);
  }

  /**
   * Create less than or equal specification
   */
  public lessThanOrEqual(
    fieldName: string,
    value: unknown,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new LessThanOrEqualSpecification(fieldName, value, fieldGetter);
  }

  /**
   * Create like specification
   */
  public like(
    fieldName: string,
    pattern: string,
    fieldGetter: (entity: T) => string,
    caseSensitive: boolean = true
  ): Specification<T> {
    return new LikeSpecification(fieldName, pattern, fieldGetter, caseSensitive);
  }

  /**
   * Create case-insensitive like specification
   */
  public ilike(
    fieldName: string,
    pattern: string,
    fieldGetter: (entity: T) => string
  ): Specification<T> {
    return new LikeSpecification(fieldName, pattern, fieldGetter, false);
  }

  /**
   * Create in specification
   */
  public in(
    fieldName: string,
    values: unknown[],
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new InSpecification(fieldName, values, fieldGetter);
  }

  /**
   * Create not in specification
   */
  public notIn(
    fieldName: string,
    values: unknown[],
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new NotInSpecification(fieldName, values, fieldGetter);
  }

  /**
   * Create is null specification
   */
  public isNull(
    fieldName: string,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new IsNullSpecification(fieldName, fieldGetter);
  }

  /**
   * Create is not null specification
   */
  public isNotNull(
    fieldName: string,
    fieldGetter: (entity: T) => unknown
  ): Specification<T> {
    return new IsNotNullSpecification(fieldName, fieldGetter);
  }

  /**
   * Create composite AND specification
   */
  public and(...specifications: Specification<T>[]): Specification<T> {
    if (specifications.length === 0) {
      throw new Error("At least one specification is required for AND operation");
    }

    return specifications.reduce((acc, spec) => acc.and(spec));
  }

  /**
   * Create composite OR specification
   */
  public or(...specifications: Specification<T>[]): Specification<T> {
    if (specifications.length === 0) {
      throw new Error("At least one specification is required for OR operation");
    }

    return specifications.reduce((acc, spec) => acc.or(spec));
  }
}