import type {
  LlmProviderDto,
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto
} from "../../../../shared/types/llm-provider.types";

interface LlmProviderStoreState {
  llmProviders: LlmProviderDto[];
  isLoading: boolean;
  error: string | null;
}

class LlmProviderStore {
  private state: LlmProviderStoreState = {
    llmProviders: [],
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

  private setState(newState: Partial<LlmProviderStoreState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  async loadLlmProviders(filter?: LlmProviderFilterDto, forceReload = false): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    if (!forceReload && this.state.llmProviders.length > 0) {
      try {
        const llmProviders = (await window.electronIPC.invoke(
          "llm-provider:list",
          filter,
        )) as LlmProviderDto[];
        this.setState({ llmProviders, error: null });
      } catch (error) {
        this.setState({ error: (error as Error).message });
      }
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const llmProviders = (await window.electronIPC.invoke(
        "llm-provider:list",
        filter,
      )) as LlmProviderDto[];

      this.setState({
        llmProviders,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async getLlmProviderById(id: string): Promise<LlmProviderDto | null> {
    if (!window.electronIPC) return null;

    try {
      return (await window.electronIPC.invoke(
        "llm-provider:getById",
        id,
      )) as LlmProviderDto | null;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  async createLlmProvider(data: CreateLlmProviderDto): Promise<void> {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("llm-provider:create", data);
      await this.loadLlmProviders(undefined, true);
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  async updateLlmProvider(data: UpdateLlmProviderDto): Promise<void> {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("llm-provider:update", data);
      await this.loadLlmProviders(undefined, true);
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  async deleteLlmProvider(id: string): Promise<void> {
    if (!window.electronIPC) return;

    try {
      await window.electronIPC.invoke("llm-provider:delete", id);
      await this.loadLlmProviders(undefined, true);
    } catch (error) {
      this.setState({ error: (error as Error).message });
      throw error;
    }
  }

  clearError() {
    this.setState({ error: null });
  }
}

export const llmProviderStore = new LlmProviderStore();
