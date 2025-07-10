import { BaseError } from './base.error';

export class DomainError extends BaseError {
  constructor(message: string) {
    super(message, 'DomainError');
  }
}
