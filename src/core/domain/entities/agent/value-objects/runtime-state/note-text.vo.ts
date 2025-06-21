import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const noteTextSchema = z.string().min(1, { message: "Note text cannot be empty." });

export class NoteText {
  private constructor(private readonly _value: string) {}

  public static create(text: string): NoteText {
    try {
      noteTextSchema.parse(text);
      return new NoteText(text);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid NoteText: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: NoteText): boolean {
    return this._value === other._value;
  }
}
