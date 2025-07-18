import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserSettingsDto,
  UserDto,
  UserPreferencesDto,
} from "../../../../shared/types/users/user.types";

export const userService = {
  async getById(id: string): Promise<UserDto | null> {
    return window.electronIPC.users.getById(id);
  },

  async create(data: CreateUserDto): Promise<UserDto> {
    return window.electronIPC.users.create(data);
  },

  async updateProfile(id: string, data: UpdateUserDto): Promise<void> {
    return window.electronIPC.users.updateProfile(id, data);
  },

  async updateSettings(
    id: string,
    settings: UpdateUserSettingsDto,
  ): Promise<void> {
    return window.electronIPC.users.updateSettings(id, settings);
  },

  async getPreferences(userId: string): Promise<UserPreferencesDto | null> {
    return window.electronIPC.users.getPreferences(userId);
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.users.delete(id);
  },
};
