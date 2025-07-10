import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { DirectMessage } from "@/main/modules/direct-messages/domain/direct-message.entity";
import { IDirectMessageRepository } from "@/main/modules/direct-messages/domain/direct-message.repository";

export interface ISendMessageCommandPayload {
  senderId: string;
  receiverId: string;
  content: string;
}

export class SendMessageCommand
  implements ICommand<ISendMessageCommandPayload>
{
  readonly type = "SendMessageCommand";
  constructor(public payload: ISendMessageCommandPayload) {}
}

export class SendMessageCommandHandler {
  constructor(private messageRepository: IDirectMessageRepository) {}

  async handle(command: SendMessageCommand): Promise<DirectMessage> {
    const message = new DirectMessage({
      senderId: command.payload.senderId,
      receiverId: command.payload.receiverId,
      content: command.payload.content,
      timestamp: new Date(),
    });
    try {
      return await this.messageRepository.save(message);
    } catch (error) {
      console.error(`Failed to send message:`, error);
      throw new ApplicationError(`Failed to send message: ${(error as Error).message}`);
    }
  }
}
