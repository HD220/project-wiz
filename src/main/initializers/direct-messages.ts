import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  SendMessageCommand,
  SendMessageCommandHandler,
} from "@/main/modules/direct-messages/application/commands/send-message.command";
import {
  ListMessagesQuery,
  ListMessagesQueryHandler,
} from "@/main/modules/direct-messages/application/queries/list-messages.query";
import { DirectMessage } from "@/main/modules/direct-messages/domain/direct-message.entity";
import { DrizzleDirectMessageRepository } from "@/main/modules/direct-messages/persistence/drizzle-direct-message.repository";

function registerDirectMessageHandlers(
  cqrsDispatcher: CqrsDispatcher,
  directMessageRepository: DrizzleDirectMessageRepository,
  sendMessageCommandHandler: SendMessageCommandHandler,
  listMessagesQueryHandler: ListMessagesQueryHandler,
) {
  cqrsDispatcher.registerCommandHandler<SendMessageCommand, DirectMessage>(
    "SendMessageCommand",
    sendMessageCommandHandler.handle.bind(sendMessageCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListMessagesQuery, DirectMessage[]>(
    "ListMessagesQuery",
    listMessagesQueryHandler.handle.bind(listMessagesQueryHandler),
  );
}

export function initializeDirectMessages(cqrsDispatcher: CqrsDispatcher) {
  const directMessageRepository = new DrizzleDirectMessageRepository();
  const sendMessageCommandHandler = new SendMessageCommandHandler(
    directMessageRepository,
  );
  const listMessagesQueryHandler = new ListMessagesQueryHandler(
    directMessageRepository,
  );

  registerDirectMessageHandlers(
    cqrsDispatcher,
    directMessageRepository,
    sendMessageCommandHandler,
    listMessagesQueryHandler,
  );
}
