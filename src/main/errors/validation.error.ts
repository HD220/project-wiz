import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'ValidationError');
  }
}
