/**
 * Base entity class providing common functionality for all entities
 * Implements basic entity behavior with event management
 */

import { Entity, IDomainEvent } from "../abstractions";

/**
 * Abstract base class for all entities in the system
 * Provides common functionality like:
 * - Unique identification
 * - Creation and modification timestamps
 * - Equality comparison
 * - Domain event management
 * - Entity state management
 */
export abstract class BaseEntity<TId = string> extends Entity<TId> {
  private _domainEvents: IDomainEvent[] = [];

  /**
   * Creates a new entity instance
   * @param id - Unique identifier for the entity
   * @param createdAt - Creation timestamp (defaults to current time)
   * @param updatedAt - Last update timestamp (defaults to current time)
   */
  protected constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
  }

  /**
   * Checks if this entity is equal to another entity
   * Two entities are equal if they have the same ID and are of the same type
   * @param other - The other entity to compare with
   * @returns True if entities are equal, false otherwise
   */
  public equals(other: Entity<TId>): boolean {
    if (!other) return false;
    if (this === other) return true;
    if (this.constructor !== other.constructor) return false;
    return this.id === other.id;
  }

  /**
   * Checks if this entity is new (hasn't been persisted yet)
   * An entity is considered new if it was created very recently
   * @returns True if entity is new, false otherwise
   */
  public isNew(): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - this.createdAt.getTime();
    return timeDiff < 1000; // Consider new if created within last second
  }

  /**
   * Updates the entity's last modified timestamp
   * Should be called whenever the entity is modified
   */
  public touch(): this {
    const touched = super.touch();
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      updatedAt: new Date(),
    });
  }

  /**
   * Adds a domain event to the entity's event collection
   * @param event - The domain event to add
   */
  protected addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clears all domain events from the entity
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Gets all domain events for this entity
   * @returns Array of domain events
   */
  public getDomainEvents(): IDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Checks if the entity has any domain events
   * @returns True if entity has domain events, false otherwise
   */
  public hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * Get the plain object representation of this entity
   * @returns Plain object with entity data
   */
  public toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      ...this.getAdditionalFields(),
    };
  }

  /**
   * Get additional fields to include in plain object representation
   * Override in derived classes to include specific fields
   * @returns Record of additional fields
   */
  protected getAdditionalFields(): Record<string, unknown> {
    return {};
  }

  /**
   * Creates a string representation of the entity
   * @returns String representation
   */
  public toString(): string {
    return `${this.constructor.name}(${this.id})`;
  }
}
