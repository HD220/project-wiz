// src_refactored/core/common/base.entity.ts
import { Identity } from './value-objects/identity.vo';

export interface EntityProps<IdType extends Identity> {
  id: IdType;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class AbstractEntity<IdType extends Identity, PropsType extends EntityProps<IdType>> {
  protected readonly _id: IdType;
  protected props: PropsType;

  protected constructor(props: PropsType) {
    this._id = props.id;
    this.props = props;
  }

  public id(): IdType {
    return this._id;
  }

  public createdAt(): Date {
    return this.props.createdAt;
  }

  public updatedAt(): Date {
    return this.props.updatedAt;
  }

  public equals(other?: AbstractEntity<IdType, PropsType> | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (!(other instanceof AbstractEntity)) {
      return false;
    }
    return this._id.equals(other._id);
  }
}
