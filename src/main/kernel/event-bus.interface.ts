export interface IEvent {
  type: string;
  id?: string;
  entityId?: string;
  timestamp?: Date;
}

export type EventListener<T extends IEvent> = (
  event: T,
) => void | Promise<void>;
