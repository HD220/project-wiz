import { PromiseText } from './promise-text.vo';
// import { DomainError } from '@/core/common/errors';

export class PromisesMadeCollection {
  private constructor(private readonly promises: PromiseText[]) {}

  public static create(promises: PromiseText[] = []): PromisesMadeCollection {
    // Assuming PromiseText instances are already validated.
    return new PromisesMadeCollection([...promises]); // Store a copy
  }

  public add(promise: PromiseText): PromisesMadeCollection {
    if (!(promise instanceof PromiseText)) {
      throw new Error("Invalid promise type. Must be an instance of PromiseText.");
    }
    return new PromisesMadeCollection([...this.promises, promise]);
  }

  public getValues(): PromiseText[] {
    return [...this.promises];
  }

  public forEach(callback: (promise: PromiseText, index: number) => void): void {
    this.promises.forEach(callback);
  }

  public map<U>(callback: (promise: PromiseText, index: number) => U): U[] {
    return this.promises.map(callback);
  }

  public isEmpty(): boolean {
    return this.promises.length === 0;
  }

  public count(): number {
    return this.promises.length;
  }

  public equals(other: PromisesMadeCollection): boolean {
    if (this.promises.length !== other.promises.length) {
      return false;
    }
    return this.promises.every((promise, index) => promise.equals(other.promises[index]));
  }
}
