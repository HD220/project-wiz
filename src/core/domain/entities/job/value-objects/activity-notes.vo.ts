import { DomainError } from "@/core/common/errors";

export class ActivityNotes {
  private constructor(private readonly notes: string[]) {
    if (!notes) {
      throw new DomainError("Activity notes cannot be null.");
    }
  }

  public static create(notes: string[]): ActivityNotes {
    return new ActivityNotes(notes);
  }

  public addNote(note: string): ActivityNotes {
    if (!note || note.trim() === "") {
      throw new DomainError("Activity note cannot be empty.");
    }
    return new ActivityNotes([...this.notes, note]);
  }

  // Getter `value` removed

  public forEach(callback: (note: string) => void): void {
    this.notes.forEach(callback);
  }

  public map<U>(callback: (note: string, index: number) => U): U[] {
    return this.notes.map(callback);
  }

  public filter(callback: (note: string) => boolean): ActivityNotes {
    const filteredNotes = this.notes.filter(callback);
    return new ActivityNotes(filteredNotes);
  }

  public isEmpty(): boolean {
    return this.notes.length === 0;
  }

  public count(): number {
    return this.notes.length;
  }
}
