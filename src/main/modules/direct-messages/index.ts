import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { IDirectMessage } from "@/shared/ipc-types/domain-types";
import type {
  IpcDirectMessagesSendPayload,
  IpcDirectMessagesListPayload,
} from "@/shared/ipc-types/ipc-payloads";
import { SendMessageCommand, SendMessageCommandHandler } from "./application/commands/send-message.command";
import { ListMessagesQuery, ListMessagesQueryHandler } from "./application/queries/list-messages.query";
import { DrizzleDirectMessageRepository } from "./persistence/drizzle-direct-message.repository";
import { db } from "@/main/persistence/db";

export function registerDirectMessagesModule(cqrsDispatcher: CqrsDispatcher) {
  const directMessageRepository = new DrizzleDirectMessageRepository(db);
  const sendMessageCommandHandler = new SendMessageCommandHandler(
    directMessageRepository,
  );
  const listMessagesQueryHandler = new ListMessagesQueryHandler(
    directMessageRepository,
  );

  cqrsDispatcher.registerCommandHandler<SendMessageCommand, IDirectMessage>(
    SendMessageCommand.name,
    sendMessageCommandHandler.handle.bind(sendMessageCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListMessagesQuery, IDirectMessage[]>(
    ListMessagesQuery.name,
    listMessagesQueryHandler.handle.bind(listMessagesQueryHandler),
  );

  createIpcHandler<IpcDirectMessagesSendPayload, IDirectMessage>(
    IpcChannel.DIRECT_MESSAGES_SEND,
    cqrsDispatcher,
    async (payload) => {
      return (await cqrsDispatcher.dispatchCommand(
        new SendMessageCommand(payload),
      )) as IDirectMessage;
    },
  );

  createIpcHandler<IpcDirectMessagesListPayload, IDirectMessage[]>(
    IpcChannel.DIRECT_MESSAGES_LIST,
    cqrsDispatcher,
    async (payload) => {
      return (await cqrsDispatcher.dispatchQuery(
        new ListMessagesQuery(payload),
      )) as IDirectMessage[];
    },
  );
}
