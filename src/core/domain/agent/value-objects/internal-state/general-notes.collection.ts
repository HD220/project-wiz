// src/core/domain/agent/value-objects/internal-state/general-notes.collection.ts
import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";

// Re-using a simple string wrapper for individual notes
class NoteEntry extends AbstractValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  public static create(text: string): NoteEntry {
    if (text === null || text === undefined || text.trim().length === 0) {
      throw new Error("General note text cannot be empty.");
    }
    // Max length for a single general note entry
    if (text.length > 2000) {
      throw new Error("Single general note entry exceeds maximum length.");
    }
    return new NoteEntry(text);
  }
  public get value(): string {
    return this.props.value;
  }
}

interface GeneralNotesCollectionProps extends ValueObjectProps {
  notes: ReadonlyArray<NoteEntry>;
}

export class GeneralNotesCollection extends AbstractValueObject<GeneralNotesCollectionProps> {
  private constructor(notes: NoteEntry[]) {
    super({ notes: Object.freeze([...notes]) });
  }

  public static create(notes: string[] = []): GeneralNotesCollection {
    if (!Array.isArray(notes)) {
      throw new Error(
        "Notes must be an array to create GeneralNotesCollection."
      );
    }
    const noteEntryObjects = notes.map((noteStr) => NoteEntry.create(noteStr));
    return new GeneralNotesCollection(noteEntryObjects);
  }

  public list(): ReadonlyArray<string> {
    return this.props.notes.map((note) => note.value);
  }

  public addNote(note: string): GeneralNotesCollection {
    const newNoteEntry = NoteEntry.create(note);
    const newNotes = [...this.props.notes, newNoteEntry];
    return new GeneralNotesCollection(newNotes);
  }

  public removeNoteAtIndex(index: number): GeneralNotesCollection {
    if (index < 0 || index >= this.props.notes.length) {
      throw new Error("Index out of bounds for removing note.");
    }
    const newNotes = this.props.notes.filter(
      (_, noteIndex) => noteIndex !== index
    );
    return new GeneralNotesCollection(newNotes);
  }

  public count(): number {
    return this.props.notes.length;
  }

  public isEmpty(): boolean {
    return this.props.notes.length === 0;
  }
}
