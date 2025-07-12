import type {
  MessageDto,
  CreateMessageDto,
  MessageFilterDto,
} from "../../../../shared/types/message.types";

interface MessageStoreState {
  messages: MessageDto[];
  isLoading: boolean;
  error: string | null;
}

class MessageStore {
  private state: MessageStoreState = {
    messages: [],
    isLoading: false,
    error: null,
  };

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  getServerSnapshot = () => this.state;

  async loadMessages(conversationId: string, limit?: number, offset?: number): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const messages = (await window.electronIPC.invoke(
        "dm:message:getByConversation",
        { conversationId, limit, offset },
      )) as MessageDto[];
      this.setState({ messages, isLoading: false });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async createMessage(dto: CreateMessageDto): Promise<void> {
    try {
      await window.electronIPC.invoke("dm:message:create", dto);
      await this.loadMessages(dto.conversationId);
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async getMessageById(id: string): Promise<MessageDto | null> {
    try {
      return await window.electronIPC.invoke("dm:message:getById", { id });
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  clearMessages(): void {
    this.setState({ messages: [] });
  }

  private setState(partialState: Partial<MessageStoreState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in store listener:", error);
      }
    });
  }
}

export const messageStore = new MessageStore();