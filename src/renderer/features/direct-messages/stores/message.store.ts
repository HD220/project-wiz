import type {
  MessageDto,
  CreateMessageDto,
  UpdateMessageDto,
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

  async loadMessages(conversationId: string, forceReload = false): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    if (!forceReload && this.state.messages.length > 0) {
      try {
        const messages = (await window.electronIPC.invoke(
          "dm:message:listByConversation",
          { conversationId },
        )) as MessageDto[];
        this.setState({ messages, error: null });
      } catch (error) {
        this.setState({ error: (error as Error).message });
      }
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const messages = (await window.electronIPC.invoke(
        "dm:message:listByConversation",
        { conversationId },
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
      await this.loadMessages(dto.conversationId, true);
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async updateMessage(dto: UpdateMessageDto): Promise<void> {
    try {
      await window.electronIPC.invoke("dm:message:update", dto);
      const message = await this.getMessageById(dto.id);
      if (message) {
        await this.loadMessages(message.conversationId, true);
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      const message = await this.getMessageById(id);
      if (message) {
        await window.electronIPC.invoke("dm:message:delete", { id });
        await this.loadMessages(message.conversationId, true);
      }
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