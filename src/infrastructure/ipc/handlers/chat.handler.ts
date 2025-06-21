import { IpcHandler, IpcMessage, IpcChannel } from "../types";
import { IpcMainInvokeEvent } from "electron";
import { 
  ChatMessage,
  ChatHistoryQuery,
  ChatMessageStatus
} from "../chat.types";
import { Result, OK, NOK } from "../../../shared/result";

// Implementação temporária do logger
class JsonLoggerService {
  constructor(private context: string) {}

  debug(message: string, data?: any) {
    console.debug(`[${this.context}] ${message}`, data);
  }

  info(message: string, data?: any) {
    console.info(`[${this.context}] ${message}`, data);
  }

  error(message: string, data?: any) {
    console.error(`[${this.context}] ${message}`, data);
  }
}

export class ChatHandler {
  private readonly logger = new JsonLoggerService('ChatHandler');
  private readonly conversations = new Map<string, ChatMessage[]>();

  registerHandlers(): IpcHandler[] {
    return [
      this.getHistoryHandler(),
      this.sendMessageHandler(),
    ];
  }

  private getHistoryHandler(): IpcHandler<ChatHistoryQuery, ChatMessage[]> {
    const handler = async (
      event: IpcMainInvokeEvent,
      payload: ChatHistoryQuery
    ): Promise<Result<ChatMessage[]>> => {
      try {
        const messages = this.conversations.get(payload.conversationId) || [];
        const filtered = payload.before
          ? messages.filter(m => m.timestamp < payload.before!)
          : messages;
        const limited = payload.limit
          ? filtered.slice(-payload.limit)
          : filtered;

        this.logger.debug('Retrieved chat history', {
          conversationId: payload.conversationId,
          count: limited.length
        });

        return OK(limited);
      } catch (error) {
        this.logger.error('Failed to get chat history', { error });
        return NOK(error instanceof Error ? error : new Error(String(error)));
      }
    };

    handler.channel = 'query:chat:history' as IpcChannel;
    handler.description = 'Retrieve chat message history for a conversation';
    return handler;
  }

  private sendMessageHandler(): IpcHandler<ChatMessage, ChatMessage> {
    const handler = async (
      event: IpcMainInvokeEvent,
      payload: ChatMessage
    ): Promise<Result<ChatMessage>> => {
      try {
        // Validate message
        if (!payload.content || !payload.sender) {
          throw new Error('Invalid message format');
        }

        // Store message
        const conversation = this.conversations.get(payload.sender.id) || [];
        conversation.push(payload);
        this.conversations.set(payload.sender.id, conversation);

        this.logger.info('Message sent', {
          messageId: payload.id,
          sender: payload.sender
        });

        // TODO: Route to agent if recipient is an agent
        return OK(payload);
      } catch (error) {
        this.logger.error('Failed to send message', { error });
        return NOK(error instanceof Error ? error : new Error(String(error)));
      }
    };

    handler.channel = 'command:chat:send' as IpcChannel;
    handler.description = 'Send a new chat message';
    return handler;
  }
}