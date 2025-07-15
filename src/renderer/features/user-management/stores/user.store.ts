import {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserSettingsDto,
  UserPreferencesDto,
} from "../../../../shared/types/user.types";

interface UserStoreState {
  currentUser: UserDto | null;
  isLoading: boolean;
  error: string | null;
}

class UserStore {
  private state: UserStoreState = {
    currentUser: null,
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

  async loadCurrentUser(userId: string): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const user = (await window.electronIPC.invoke("user:getById", {
        id: userId,
      })) as UserDto | null;
      this.setState({ currentUser: user, isLoading: false });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async createUser(dto: CreateUserDto): Promise<UserDto | null> {
    try {
      const user = (await window.electronIPC.invoke(
        "user:create",
        dto,
      )) as UserDto;
      this.setState({ currentUser: user });
      return user;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  async updateProfile(dto: UpdateUserDto): Promise<void> {
    try {
      await window.electronIPC.invoke("user:updateProfile", dto);
      if (this.state.currentUser) {
        await this.loadCurrentUser(this.state.currentUser.id);
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async updateSettings(dto: UpdateUserSettingsDto): Promise<void> {
    try {
      await window.electronIPC.invoke("user:updateSettings", dto);
      if (this.state.currentUser) {
        this.setState({
          currentUser: {
            ...this.state.currentUser,
            settings: dto.settings,
          },
        });
      }
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async getPreferences(userId: string): Promise<UserPreferencesDto | null> {
    try {
      return await window.electronIPC.invoke("user:getPreferences", {
        userId,
      });
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await window.electronIPC.invoke("user:delete", { id: userId });
      this.setState({ currentUser: null });
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  private setState(partialState: Partial<UserStoreState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in user store listener:", error);
      }
    });
  }
}

export const userStore = new UserStore();