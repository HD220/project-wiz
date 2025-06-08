export type Result<T> = Ok<T> | Error;

export class Ok<T> {
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T> {
    return true;
  }
  isError(): this is Error {
    return false;
  }
}

export class Error {
  constructor(public readonly message: string) {}
  isOk(): this is Ok<never> {
    return false;
  }
  isError(): this is Error {
    return true;
  }
}

export function ok<T>(value: T): Result<T> {
  return new Ok(value);
}

export function error(message: string): Result<never> {
  return new Error(message);
}
