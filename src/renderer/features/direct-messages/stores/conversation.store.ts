import type {
  ConversationDto,
  CreateConversationDto,
  ConversationFilterDto,
} from "../../../../shared/types/message.types";

interface ConversationStoreState {
  conversations: ConversationDto[];
  isLoading: boolean;
  error: string | null;
  selectedConversation: ConversationDto | null;
}

class ConversationStore {
  private state: ConversationStoreState = {
    conversations: [],
    isLoading: false,
    error: null,
    selectedConversation: null,
  };

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  getServerSnapshot = () => this.state;

  async loadConversations(filter?: ConversationFilterDto): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const conversations = (await window.electronIPC.invoke(
        "dm:conversation:list",
        filter,
      )) as ConversationDto[];
      this.setState({ conversations, isLoading: false });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async createConversation(dto: CreateConversationDto): Promise<void> {
    try {
      await window.electronIPC.invoke("dm:conversation:create", dto);
      await this.loadConversations();
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async findOrCreateDirectMessage(participants: string[]): Promise<ConversationDto | null> {
    try {
      const conversation = await window.electronIPC.invoke("dm:conversation:findOrCreate", {
        participants,
      }) as ConversationDto;
      await this.loadConversations();
      return conversation;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  async getConversationById(id: string): Promise<ConversationDto | null> {
    try {
      return await window.electronIPC.invoke("dm:conversation:getById", { id });
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  setSelectedConversation(conversation: ConversationDto | null): void {
    this.setState({ selectedConversation: conversation });
  }

  private setState(partialState: Partial<ConversationStoreState>): void {
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

export const conversationStore = new ConversationStore();