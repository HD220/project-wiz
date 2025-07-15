import type {
  ChannelDto,
  CreateChannelDto,
  UpdateChannelDto,
  ChannelFilterDto,
} from "@/shared/types";

interface ChannelStoreState {
  channels: ChannelDto[];
  isLoading: boolean;
  error: string | null;
  selectedChannel: ChannelDto | null;
}

class ChannelStore {
  private state: ChannelStoreState = {
    channels: [],
    isLoading: false,
    error: null,
    selectedChannel: null,
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
  private setState(newState: Partial<ChannelStoreState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener());
  }

  // QUERIES (buscar dados)
  loadChannels = async (
    filter?: ChannelFilterDto,
    forceReload = false,
  ): Promise<void> => {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    // Evitar recarregamentos desnecessários
    if (
      !forceReload &&
      this.state.channels.length > 0 &&
      !this.state.isLoading
    ) {
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const channels = (await window.electronIPC.invoke(
        "channel:list",
        filter,
      )) as ChannelDto[];

      this.setState({
        channels,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  };

  loadChannelsByProject = async (
    projectId: string,
    forceReload = false,
  ): Promise<void> => {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    // Evitar recarregamentos desnecessários
    if (
      !forceReload &&
      this.state.channels.length > 0 &&
      !this.state.isLoading
    ) {
      const currentProjectChannels = this.state.channels.filter(
        (ch) => ch.projectId === projectId,
      );
      if (currentProjectChannels.length > 0) {
        return;
      }
    }

    this.setState({ isLoading: true, error: null });

    try {
      const channels = (await window.electronIPC.invoke(
        "channel:listByProject",
        projectId,
      )) as ChannelDto[];

      this.setState({
        channels,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  };

  getChannelById = async (id: string): Promise<ChannelDto | null> => {
    if (!window.electronIPC) return null;

    try {
      return (await window.electronIPC.invoke(
        "channel:getById",
        id,
      )) as ChannelDto | null;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  };

  // MUTATIONS (modificar dados)
  createChannel = async (data: CreateChannelDto): Promise<void> => {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      const newChannel = (await window.electronIPC.invoke(
        "channel:create",
        data,
      )) as ChannelDto;

      // Adicionar ao estado atual
      this.setState({
        channels: [...this.state.channels, newChannel],
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error; // Re-throw para o componente lidar
    }
  };

  updateChannel = async (data: UpdateChannelDto): Promise<void> => {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      const updatedChannel = (await window.electronIPC.invoke(
        "channel:update",
        data,
      )) as ChannelDto;

      // Atualizar no estado
      this.setState({
        channels: this.state.channels.map((ch) =>
          ch.id === updatedChannel.id ? updatedChannel : ch,
        ),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  };

  archiveChannel = async (id: string): Promise<void> => {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      const archivedChannel = (await window.electronIPC.invoke(
        "channel:archive",
        id,
      )) as ChannelDto;

      // Remover do estado (já que listamos apenas não-arquivados)
      this.setState({
        channels: this.state.channels.filter((ch) => ch.id !== id),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  };

  deleteChannel = async (id: string): Promise<void> => {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      await window.electronIPC.invoke("channel:delete", id);

      // Remover do estado
      this.setState({
        channels: this.state.channels.filter((ch) => ch.id !== id),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  };

  createDefaultChannel = async (
    projectId: string,
    createdBy: string,
  ): Promise<ChannelDto> => {
    if (!window.electronIPC) throw new Error("ElectronIPC not available");

    try {
      const defaultChannel = (await window.electronIPC.invoke(
        "channel:createDefault",
        projectId,
        createdBy,
      )) as ChannelDto;

      // Adicionar ao estado se não existir
      const exists = this.state.channels.some(
        (ch) => ch.id === defaultChannel.id,
      );
      if (!exists) {
        this.setState({
          channels: [...this.state.channels, defaultChannel],
        });
      }

      return defaultChannel;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  };

  // Ações locais
  setSelectedChannel = (channel: ChannelDto | null) => {
    this.setState({ selectedChannel: channel });
  };

  clearError = () => {
    this.setState({ error: null });
  };

  // Getters de conveniência
  getChannelsByProject = (projectId: string): ChannelDto[] => {
    return this.state.channels.filter((ch) => ch.projectId === projectId);
  };

  getGeneralChannel = (projectId: string): ChannelDto | null => {
    const projectChannels = this.state.channels.filter(
      (ch) => ch.projectId === projectId,
    );
    return (
      projectChannels.find((ch) => ch.name.toLowerCase() === "general") ||
      projectChannels[0] ||
      null
    );
  };

  // Reset state (útil ao trocar de projeto)
  resetState = () => {
    this.setState({
      channels: [],
      isLoading: false,
      error: null,
      selectedChannel: null,
    });
  };
}

// Instância singleton
export const channelStore = new ChannelStore();
