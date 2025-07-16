export class MessageIdentity {
  private constructor(
    private readonly id: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(props: {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): MessageIdentity {
    const id = props.id || crypto.randomUUID();
    const createdAt = props.createdAt || new Date();
    const updatedAt = props.updatedAt || new Date();

    return new MessageIdentity(id, createdAt, updatedAt);
  }

  getId(): string {
    return this.id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
