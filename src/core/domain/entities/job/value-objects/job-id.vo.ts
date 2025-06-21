import { randomUUID } from 'node:crypto';

export class JobId {
  private readonly value: string;

  private constructor(id: string) {
    // Basic validation for UUID format can be added if necessary,
    // but for now, keep it simple. Object Calisthenics: Rule 3 (Wrap Primitives).
    if (!this.isValidUUID(id)) {
      throw new Error('Invalid JobId format.'); // Or a more specific domain error
    }
    this.value = id;
  }

  public static create(id?: string): JobId {
    return new JobId(id || randomUUID());
  }

  public static fromString(id: string): JobId {
    return new JobId(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: JobId): boolean {
    return this.value === other.getValue();
  }

  private isValidUUID(id: string): boolean {
    // Basic UUID regex check
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(id);
  }
}
