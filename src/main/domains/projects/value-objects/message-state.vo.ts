export class MessageState {
  private constructor(private readonly isEdited: boolean) {}

  static create(isEdited: boolean = false): MessageState {
    return new MessageState(isEdited);
  }

  isMessageEdited(): boolean {
    return this.isEdited;
  }

  edit(): MessageState {
    return new MessageState(true);
  }
}
