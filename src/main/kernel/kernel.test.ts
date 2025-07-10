import {
  CqrsDispatcher,
  ICommand,
  IQuery,
} from "@/main/kernel/cqrs-dispatcher";
import { EventBus, IEvent } from "@/main/kernel/event-bus";

describe("CQRS Dispatcher and Event Bus", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let eventBus: EventBus;

  beforeEach(() => {
    cqrsDispatcher = new CqrsDispatcher();
    eventBus = new EventBus();
  });

  it("should dispatch a command and return a successful result", async () => {
    interface TestCommandPayload {
      value: string;
    }

    const command: ICommand<TestCommandPayload> = {
      type: "TestCommand",
      payload: { value: "test" },
    };

    cqrsDispatcher.registerCommandHandler(
      "TestCommand",
      async (cmd: ICommand<TestCommandPayload>) => {
        return `Processed: ${cmd.payload.value}`;
      },
    );

    const result = await cqrsDispatcher.dispatchCommand<
      ICommand<TestCommandPayload>,
      string
    >(command);

    expect(result).toBe("Processed: test");
  });

  it("should dispatch a query and return a successful result", async () => {
    interface TestQueryPayload {
      id: string;
    }

    const query: IQuery<TestQueryPayload> = {
      type: "TestQuery",
      payload: { id: "123" },
    };

    cqrsDispatcher.registerQueryHandler(
      "TestQuery",
      async (q: IQuery<TestQueryPayload>) => {
        return { data: `Fetched data for ${q.payload.id}` };
      },
    );

    const result = await cqrsDispatcher.dispatchQuery<
      IQuery<TestQueryPayload>,
      { data: string }
    >(query);

    expect(result.data).toBe("Fetched data for 123");
  });

  it("should publish an event and notify listeners", () => {
    interface TestEvent extends IEvent {
      type: "TestEvent";
      message: string;
    }
    const mockListener = vi.fn();
    const eventType: TestEvent["type"] = "TestEvent";
    const eventPayload: TestEvent = {
      type: "TestEvent",
      message: "Hello Event Bus",
    };

    eventBus.subscribe(eventType, mockListener);
    eventBus.publish<TestEvent>(eventPayload);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(eventPayload);
  });

  it("should handle multiple listeners for the same event", () => {
    interface MultiListenerEvent extends IEvent {
      type: "MultiListenerEvent";
      data: string;
    }
    const mockListener1 = vi.fn();
    const mockListener2 = vi.fn();
    const eventType: MultiListenerEvent["type"] = "MultiListenerEvent";
    const eventPayload: MultiListenerEvent = {
      type: "MultiListenerEvent",
      data: "Multiple listeners",
    };

    eventBus.subscribe(eventType, mockListener1);
    eventBus.subscribe(eventType, mockListener2);
    eventBus.publish<MultiListenerEvent>(eventPayload);

    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener1).toHaveBeenCalledWith(eventPayload);
    expect(mockListener2).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledWith(eventPayload);
  });

  it("should throw an error for unregistered command handlers", async () => {
    const command: ICommand<unknown> = { type: "UnknownCommand", payload: {} };

    await expect(async () =>
      cqrsDispatcher.dispatchCommand<ICommand<unknown>, unknown>(command),
    ).rejects.toThrow("No handler registered for command type UnknownCommand");
  });

  it("should throw an error for unregistered query handlers", async () => {
    const query: IQuery<unknown> = { type: "UnknownQuery", payload: {} };

    await expect(async () =>
      cqrsDispatcher.dispatchQuery<IQuery<unknown>, unknown>(query),
    ).rejects.toThrow("No handler registered for query type UnknownQuery");
  });
});
