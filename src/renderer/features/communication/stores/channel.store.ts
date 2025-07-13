import type { 
  ChannelDto, 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelFilterDto 
} from "../../../../shared/types/channel.types";

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

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
  getServerSnapshot = () => this.state;

  private setState(newState: Partial<ChannelStoreState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  async loadChannels(filter?: ChannelFilterDto, forceReload = false): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    if (!forceReload && this.state.channels.length > 0) {
      try {
        const channels = (await window.electronIPC.invoke(
          "channel:list",
          filter,
        )) as ChannelDto[];
        this.setState({ channels, error: null });
      } catch (error) {
        this.setState({ error: (error as Error).message });
      }
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
        isLoading: false 
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async getChannelById(id: string): Promise<ChannelDto | null> {
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
  }

  async createChannel(data: CreateChannelDto): Promise<void> {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("channel:create", data);
      await this.loadChannels({ projectId: data.projectId }, true);
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  async updateChannel(data: UpdateChannelDto): Promise<void> {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("channel:update", data);
      const channel = await this.getChannelById(data.id);
      if (channel) {
        await this.loadChannels({ projectId: channel.projectId }, true);
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  async archiveChannel(id: string): Promise<void> {
    if (!window.electronIPC) return;

    try {
      const channel = await this.getChannelById(id);
      await window.electronIPC.invoke("channel:archive", id);
      if (channel) {
        await this.loadChannels({ projectId: channel.projectId }, true);
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  async deleteChannel(id: string): Promise<void> {
    if (!window.electronIPC) return;

    try {
      const channel = await this.getChannelById(id);
      await window.electronIPC.invoke("channel:delete", id);
      if (channel) {
        await this.loadChannels({ projectId: channel.projectId }, true);
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  setSelectedChannel(channel: ChannelDto | null) {
    this.setState({ selectedChannel: channel });
  }

  clearError() {
    this.setState({ error: null });
  }
}

export const channelStore = new ChannelStore();