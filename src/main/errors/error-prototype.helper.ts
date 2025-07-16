export function setupErrorPrototype(
  instance: Error,
  constructor: new (...args: any[]) => Error,
): void {
  Object.setPrototypeOf(instance, constructor.prototype);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, constructor);
  }
}
