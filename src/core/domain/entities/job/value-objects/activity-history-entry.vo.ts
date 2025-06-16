import { AbstractValueObject } from "@/core/common/value-objects/abstract.vo";
import { DomainError } from "@/core/common/errors";

interface ActivityHistoryEntryProps {
  role: string;
  content: string;
  timestamp: Date;
}

export class ActivityHistoryEntry extends AbstractValueObject<ActivityHistoryEntryProps> {
  private constructor(props: ActivityHistoryEntryProps) {
    super(props);

    this.validateProps(props);
  }

  private validateProps(props: ActivityHistoryEntryProps): void {
    if (!props.role || props.role.trim() === "") {
      throw new DomainError(
        "ActivityHistoryEntry: O papel (role) não pode ser vazio."
      );
    }

    if (!props.content || props.content.trim() === "") {
      throw new DomainError(
        "ActivityHistoryEntry: O conteúdo (content) não pode ser vazio."
      );
    }

    if (
      !(props.timestamp instanceof Date) ||
      isNaN(props.timestamp.getTime())
    ) {
      throw new DomainError(
        "ActivityHistoryEntry: O carimbo de data/hora (timestamp) deve ser uma data válida."
      );
    }
  }

  public static create(
    role: string,
    content: string,
    timestamp: Date
  ): ActivityHistoryEntry {
    return new ActivityHistoryEntry({ role, content, timestamp });
  }
}
