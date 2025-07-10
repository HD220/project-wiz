export abstract class BaseError extends Error {
  constructor(message: string, public readonly name: string = 'BaseError') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
