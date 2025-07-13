import type {
  ChannelMessageDto,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageFilterDto
} from "../../../../shared/types/channel-message.types";

interface ChannelMessageStoreState {
  messages: ChannelMessageDto[];
  isLoading: boolean;
  error: string | null;
  selectedMessage: ChannelMessageDto | null;
}

class ChannelMessageStore {
  private state: ChannelMessageStoreState = {
    messages: [],
    isLoading: false,
    error: null,
    selectedMessage: null,
  };

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
  getServerSnapshot = () => this.state;

  private setState(newState: Partial<ChannelMessageStoreState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  async loadMessages(filter?: ChannelMessageFilterDto, forceReload = false): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    if (!forceReload && this.state.messages.length > 0) {
      try {
        const messages = (await window.electronIPC.invoke(
          "channelMessage:list",
          filter,
        )) as ChannelMessageDto[];
        this.setState({ messages, error: null });
      } catch (error) {
        this.setState({ error: (error as Error).message });
      }
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const messages = (await window.electronIPC.invoke(
        "channelMessage:list",
        filter,
      )) as ChannelMessageDto[];

      this.setState({
        messages,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async getMessageById(id: string): Promise<ChannelMessageDto | null> {
    if (!window.electronIPC) return null;

    try {
      return (await window.electronIPC.invoke(
        "channelMessage:getById",
        id,
      )) as ChannelMessageDto | null;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  async createMessage(data: CreateChannelMessageDto): Promise<void> {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("channelMessage:create", data);
      await this.loadMessages({ channelId: data.channelId }, true);
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  async updateMessage(data: UpdateChannelMessageDto): Promise<void> {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("channelMessage:update", data);
      const message = await this.getMessageById(data.id);
      if (message) {
        await this.loadMessages({ channelId: message.channelId }, true);
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  async deleteMessage(id: string): Promise<void> {
    if (!window.electronIPC) return;

    try {
      const message = await this.getMessageById(id);
      await window.electronIPC.invoke("channelMessage:delete", id);
      if (message) {
        await this.loadMessages({ channelId: message.channelId }, true);
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  setSelectedMessage(message: ChannelMessageDto | null) {
    this.setState({ selectedMessage: message });
  }

  clearError() {
    this.setState({ error: null });
  }
}

export const channelMessageStore = new ChannelMessageStore();