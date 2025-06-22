// src_refactored/core/domain/job/value-objects/activity-notes.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

// Simple string wrapper for individual notes to enforce validation if any
class NoteText extends AbstractValueObject<{value: string}> {
    private constructor(value: string) { super({value}); }
    public static create(text: string): NoteText {
        if (text === null || text === undefined || text.trim().length === 0) {
            throw new Error("Note text cannot be empty.");
        }
        // Max length for a single note?
        if (text.length > 1000) { // Example limit
            throw new Error("Single note text exceeds maximum length.");
        }
        return new NoteText(text);
    }
    public value(): string { return this.props.value; }
}


interface ActivityNotesProps extends ValueObjectProps {
  notes: ReadonlyArray<NoteText>;
}

export class ActivityNotes extends AbstractValueObject<ActivityNotesProps> {
  private constructor(notes: NoteText[]) {
    super({ notes: Object.freeze([...notes]) });
  }

  public static create(notes: string[] = []): ActivityNotes {
    if (!Array.isArray(notes)) {
      throw new Error('Notes must be an array to create ActivityNotes.');
    }
    const noteTextObjects = notes.map(noteStr => NoteText.create(noteStr));
    return new ActivityNotes(noteTextObjects);
  }

  public list(): ReadonlyArray<string> {
    return this.props.notes.map(note => note.value());
  }

  public addNote(note: string): ActivityNotes {
    const newNoteText = NoteText.create(note);
    const newNotes = [...this.props.notes, newNoteText];
    return new ActivityNotes(newNotes);
  }

  public count(): number {
    return this.props.notes.length;
  }

  public isEmpty(): boolean {
    return this.props.notes.length === 0;
  }

  // The base AbstractValueObject.equals using JSON.stringify will work here
  // as it compares the array of {value: string} objects.
}
