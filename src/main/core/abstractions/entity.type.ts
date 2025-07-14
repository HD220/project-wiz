/**
 * Base entity interface
 * Defines common properties for all entities in the domain
 *
 * @template TId - Type of the entity identifier
 */
export interface IEntity<TId = string> {
  /**
   * Unique identifier for the entity
   */
  readonly id: TId;

  /**
   * Timestamp when the entity was created
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the entity was last updated
   */
  readonly updatedAt: Date;
}

/**
 * Base entity class
 * Provides common functionality for all domain entities
 *
 * @template TId - Type of the entity identifier
 */
export abstract class Entity<TId = string> implements IEntity<TId> {
  public readonly id: TId;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  protected constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Check if this entity is equal to another entity
   * Entities are equal if they have the same ID
   * @param other - Entity to compare with
   * @returns True if entities are equal
   */
  public equals(other: Entity<TId>): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    return this.id === other.id;
  }

  /**
   * Create a copy of this entity with updated timestamp
   * @returns New entity instance with updated timestamp
   */
  public touch(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      updatedAt: new Date(),
    });
  }

  /**
   * Convert entity to plain object
   * @returns Plain object representation of the entity
   */
  public toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * Aggregate root marker interface
 * Identifies entities that serve as aggregate roots in DDD
 */
export interface IAggregateRoot<TId = string> extends IEntity<TId> {
  /**
   * Get domain events that occurred in this aggregate
   */
  getDomainEvents(): ReadonlyArray<unknown>;

  /**
   * Clear domain events after they have been processed
   */
  clearDomainEvents(): void;
}

/**
 * Base aggregate root class
 * Provides domain event handling functionality
 *
 * @template TId - Type of the entity identifier
 */
export abstract class AggregateRoot<TId = string>
  extends Entity<TId>
  implements IAggregateRoot<TId>
{
  private _domainEvents: unknown[] = [];

  /**
   * Add a domain event to this aggregate
   * @param event - Domain event to add
   */
  protected addDomainEvent(event: unknown): void {
    this._domainEvents.push(event);
  }

  /**
   * Get domain events that occurred in this aggregate
   * @returns Array of domain events
   */
  public getDomainEvents(): ReadonlyArray<unknown> {
    return [...this._domainEvents];
  }

  /**
   * Clear domain events after they have been processed
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
