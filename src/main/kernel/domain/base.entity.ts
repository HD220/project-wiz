import { randomUUID } from "crypto";

export abstract class BaseEntity<T> {
  protected readonly _id: string;
  public readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id || randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public equals(entity?: BaseEntity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }
    if (this === entity) {
      return true;
    }
    if (!this.isEntity(entity)) {
      return false;
    }
    return this._id === entity._id;
  }

  private isEntity(candidate: unknown): candidate is BaseEntity<T> {
    return candidate instanceof BaseEntity;
  }
}
