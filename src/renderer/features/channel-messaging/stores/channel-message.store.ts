import type {
  ChannelMessageDto,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageFilterDto,
  ChannelMessagePaginationDto,
} from "@/shared/types";

interface ChannelMessageStoreState {
  messagesByChannel: Record<string, ChannelMessageDto[]>;
  isLoading: boolean;
  error: string | null;
  selectedMessage: ChannelMessageDto | null;
  isLoadingMore: boolean;
}

class ChannelMessageStore {
  private state: ChannelMessageStoreState = {
    messagesByChannel: {},
    isLoading: false,
    error: null,
    selectedMessage: null,
    isLoadingMore: false,
  };

  private listeners = new Set<() => void>();

  // Para useSyncExternalStore
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
  getServerSnapshot = () => this.state;

  // Atualizar estado e notificar listeners
  private setState(newState: Partial<ChannelMessageStoreState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener());
  }

  // QUERIES (buscar dados)
  loadMessages = async (
    filter?: ChannelMessageFilterDto,
    forceReload = false,
  ): Promise<void> => {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const messages = (await window.electronIPC.invoke(
        "channelMessage:list",
        filter,
      )) as ChannelMessageDto[];

      this.setState({
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  };

  loadMessagesByChannel = async (
    channelId: string,
    limit = 50,
    offset = 0,
    forceReload = false,
  ): Promise<void> => {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    // Evitar recarregamentos desnecessários
    if (
      !forceReload &&
      this.state.messagesByChannel[channelId] &&
      !this.state.isLoading
    ) {
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const pagination = (await window.electronIPC.invoke(
        "channelMessage:listByChannel",
        channelId,
        limit.toString(),
        offset.toString(),
      )) as ChannelMessagePaginationDto;

      this.setState({
        messagesByChannel: {
          ...this.state.messagesByChannel,
          [channelId]: pagination.messages,
        },
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  };

  loadLatestMessages = async (channelId: string, limit = 50): Promise<void> => {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const messages = (await window.electronIPC.invoke(
        "channelMessage:getLatest",
        channelId,
        limit.toString(),
      )) as ChannelMessageDto[];

      this.setState({
        messagesByChannel: {
          ...this.state.messagesByChannel,
          [channelId]: messages,
        },
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  };

  getMessageById = async (id: string): Promise<ChannelMessageDto | null> => {
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
  };

  // MUTATIONS (modificar dados)
  createMessage = async (data: CreateChannelMessageDto): Promise<void> => {
    if (!window.electronIPC) return;

    this.setState({ error: null });

    try {
      const newMessage = (await window.electronIPC.invoke(
        "channelMessage:create",
        data,
      )) as ChannelMessageDto;

      // Adicionar mensagem ao canal correspondente
      const channelMessages =
        this.state.messagesByChannel[data.channelId] || [];

      this.setState({
        messagesByChannel: {
          ...this.state.messagesByChannel,
          [data.channelId]: [...channelMessages, newMessage],
        },
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
      });
      throw error; // Re-throw para o componente lidar
    }
  };

  createTextMessage = async (
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<void> => {
    if (!window.electronIPC) return;

    try {
      const newMessage = (await window.electronIPC.invoke(
        "channelMessage:createText",
        content,
        channelId,
        authorId,
        authorName,
      )) as ChannelMessageDto;

      // Adicionar mensagem ao canal correspondente
      const channelMessages = this.state.messagesByChannel[channelId] || [];

      this.setState({
        messagesByChannel: {
          ...this.state.messagesByChannel,
          [channelId]: [...channelMessages, newMessage],
        },
      });
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  };

  updateMessage = async (data: UpdateChannelMessageDto): Promise<void> => {
    if (!window.electronIPC) return;

    try {
      const updatedMessage = (await window.electronIPC.invoke(
        "channelMessage:update",
        data,
      )) as ChannelMessageDto;

      // Atualizar mensagem em todos os canais (caso esteja cached em múltiplos)
      const newMessagesByChannel = { ...this.state.messagesByChannel };

      Object.keys(newMessagesByChannel).forEach((channelId) => {
        newMessagesByChannel[channelId] = newMessagesByChannel[channelId].map(
          (msg) => (msg.id === updatedMessage.id ? updatedMessage : msg),
        );
      });

      this.setState({
        messagesByChannel: newMessagesByChannel,
      });
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  };

  deleteMessage = async (id: string, channelId: string): Promise<void> => {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("channelMessage:delete", id);

      // Remover mensagem do canal
      const channelMessages = this.state.messagesByChannel[channelId] || [];

      this.setState({
        messagesByChannel: {
          ...this.state.messagesByChannel,
          [channelId]: channelMessages.filter((msg) => msg.id !== id),
        },
      });
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  };

  searchMessages = async (
    channelId: string,
    searchTerm: string,
    limit = 20,
  ): Promise<ChannelMessageDto[]> => {
    if (!window.electronIPC) return [];

    try {
      return (await window.electronIPC.invoke(
        "channelMessage:search",
        channelId,
        searchTerm,
        limit.toString(),
      )) as ChannelMessageDto[];
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return [];
    }
  };

  getLastMessage = async (
    channelId: string,
  ): Promise<ChannelMessageDto | null> => {
    if (!window.electronIPC) return null;

    try {
      return (await window.electronIPC.invoke(
        "channelMessage:getLastMessage",
        channelId,
      )) as ChannelMessageDto | null;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  };

  // Ações locais
  setSelectedMessage = (message: ChannelMessageDto | null) => {
    this.setState({ selectedMessage: message });
  };

  clearError = () => {
    this.setState({ error: null });
  };

  // Getters de conveniência
  getMessagesByChannel = (channelId: string): ChannelMessageDto[] => {
    return this.state.messagesByChannel[channelId] || [];
  };

  // Reset state (útil ao trocar de canal/projeto)
  resetState = () => {
    this.setState({
      messagesByChannel: {},
      isLoading: false,
      error: null,
      selectedMessage: null,
      isLoadingMore: false,
    });
  };

  resetChannel = (channelId: string) => {
    const newMessagesByChannel = { ...this.state.messagesByChannel };
    delete newMessagesByChannel[channelId];

    this.setState({
      messagesByChannel: newMessagesByChannel,
    });
  };
}

// Instância singleton
export const channelMessageStore = new ChannelMessageStore();
