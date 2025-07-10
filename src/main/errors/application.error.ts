import { BaseError } from './base.error';

export class ApplicationError extends BaseError {
  constructor(message: string) {
    super(message, 'ApplicationError');
  }
}
