import { randomUUID } from 'node:crypto';

export class WorkerId {
  private readonly value: string;
  private constructor(id: string) {
    if (!this.isValidUUID(id)) { throw new Error('Invalid WorkerId format.'); }
    this.value = id;
  }
  public static create(id?: string): WorkerId { return new WorkerId(id || randomUUID()); }
  public static fromString(id: string): WorkerId { return new WorkerId(id); }
  public getValue(): string { return this.value; }
  public equals(other: WorkerId): boolean { return this.value === other.getValue(); }
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(id);
  }
}
