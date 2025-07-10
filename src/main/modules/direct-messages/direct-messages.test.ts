import { sql } from "drizzle-orm";

import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { SendMessageCommand } from "@/main/modules/direct-messages/application/commands/send-message.command";
import { SendMessageCommandHandler } from "@/main/modules/direct-messages/application/commands/send-message.command";
import { ListMessagesQuery } from "@/main/modules/direct-messages/application/queries/list-messages.query";
import { ListMessagesQueryHandler } from "@/main/modules/direct-messages/application/queries/list-messages.query";
import { DirectMessage } from "@/main/modules/direct-messages/domain/direct-message.entity";
import { DrizzleDirectMessageRepository } from "@/main/modules/direct-messages/persistence/drizzle-direct-message.repository";
import { directMessages } from "@/main/modules/direct-messages/persistence/schema";
import { db } from "@/main/persistence/db";

describe("Direct Messages Module", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let directMessageRepository: DrizzleDirectMessageRepository;

  const clearMessagesTable = async () => {
    await db.delete(directMessages).where(sql`1=1`);
  };

  beforeAll(() => {
    cqrsDispatcher = new CqrsDispatcher();
    directMessageRepository = new DrizzleDirectMessageRepository();

    const sendMessageCommandHandler = new SendMessageCommandHandler(
      directMessageRepository,
    );
    const listMessagesQueryHandler = new ListMessagesQueryHandler(
      directMessageRepository,
    );

    cqrsDispatcher.registerCommandHandler(
      "SendMessageCommand",
      sendMessageCommandHandler.handle.bind(sendMessageCommandHandler),
    );
    cqrsDispatcher.registerQueryHandler(
      "ListMessagesQuery",
      listMessagesQueryHandler.handle.bind(listMessagesQueryHandler),
    );
  });

  beforeEach(async () => {
    await clearMessagesTable();
  });

  it("should send a new direct message and list it", async () => {
    const command = new SendMessageCommand({
      senderId: "user1",
      receiverId: "user2",
      content: "Hello there!",
    });
    const createdMessage = await cqrsDispatcher.dispatchCommand<
      SendMessageCommand,
      DirectMessage
    >(command);

    expect(createdMessage).toBeInstanceOf(DirectMessage);
    expect(createdMessage.content).toBe("Hello there!");

    const listedMessages = await cqrsDispatcher.dispatchQuery<
      ListMessagesQuery,
      DirectMessage[]
    >(new ListMessagesQuery({ senderId: "user1", receiverId: "user2" }));
    expect(listedMessages.length).toBe(1);
    expect(listedMessages[0].content).toBe("Hello there!");
  });

  it("should list messages for a conversation", async () => {
    await cqrsDispatcher.dispatchCommand(
      new SendMessageCommand({
        senderId: "user1",
        receiverId: "user2",
        content: "Message 1",
      }),
    );
    await cqrsDispatcher.dispatchCommand(
      new SendMessageCommand({
        senderId: "user2",
        receiverId: "user1",
        content: "Message 2",
      }),
    );
    await cqrsDispatcher.dispatchCommand(
      new SendMessageCommand({
        senderId: "user1",
        receiverId: "user2",
        content: "Message 3",
      }),
    );

    const listedMessages = await cqrsDispatcher.dispatchQuery<
      ListMessagesQuery,
      DirectMessage[]
    >(new ListMessagesQuery({ senderId: "user1", receiverId: "user2" }));

    expect(listedMessages.length).toBe(3);
    expect(listedMessages[0].content).toBe("Message 1");
    expect(listedMessages[1].content).toBe("Message 2");
    expect(listedMessages[2].content).toBe("Message 3");
  });
});
