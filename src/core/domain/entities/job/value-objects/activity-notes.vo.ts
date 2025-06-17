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

  public get value(): string[] {
    return [...this.notes]; // Return a copy to maintain immutability
  }
}
