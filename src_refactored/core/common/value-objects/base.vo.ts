// src_refactored/core/common/value-objects/base.vo.ts

export interface ValueObjectProps {
  [index: string]: any;
}

/**
 * @desc ValueObjects are objects that represent a simple entity whose equality is not based on identity:
 * two Value Objects are equal if they have the same value, not necessarily being the same object.
 *
 * Rule 3: Wrap all primitives and Strings.
 * Rule 9: No getters and setters.
 */
export abstract class AbstractValueObject<T extends ValueObjectProps> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: AbstractValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
