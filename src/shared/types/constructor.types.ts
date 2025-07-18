// Type-safe constructor type for error classes
export type ErrorConstructor<T = object> = new (...args: unknown[]) => T;

// Generic constructor type
export type Constructor<T = object> = new (...args: unknown[]) => T;
