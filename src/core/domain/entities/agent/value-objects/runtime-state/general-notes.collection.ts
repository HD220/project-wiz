import { NoteText } from './note-text.vo';
// DomainError could be used if specific collection-level validation is added
// import { DomainError } from '@/core/common/errors';

export class GeneralNotesCollection {
  private constructor(private readonly notes: NoteText[]) {}

  public static create(notes: NoteText[] = []): GeneralNotesCollection {
    // Assuming NoteText instances are already validated.
    // If `notes` could come from untrusted sources directly here, further validation might be needed.
    return new GeneralNotesCollection([...notes]); // Store a copy for immutability
  }

  public add(note: NoteText): GeneralNotesCollection {
    if (!(note instanceof NoteText)) {
      // This check is more for runtime safety if TypeScript isn't strictly enforced.
      // NoteText.create() should be used before adding to ensure valid NoteText.
      throw new Error("Invalid note type. Must be an instance of NoteText.");
    }
    return new GeneralNotesCollection([...this.notes, note]);
  }

  public getValues(): NoteText[] { // Renamed from forEach/map to avoid conflict with array methods if this was an array
    return [...this.notes];
  }

  public forEach(callback: (note: NoteText, index: number) => void): void {
    this.notes.forEach(callback);
  }

  public map<U>(callback: (note: NoteText, index: number) => U): U[] {
    return this.notes.map(callback);
  }

  public isEmpty(): boolean {
    return this.notes.length === 0;
  }

  public count(): number {
    return this.notes.length;
  }

  public equals(other: GeneralNotesCollection): boolean {
    if (this.notes.length !== other.notes.length) {
      return false;
    }
    return this.notes.every((note, index) => note.equals(other.notes[index]));
  }
}
