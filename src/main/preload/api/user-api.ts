import { ipcRenderer } from "electron";

import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  UserPreferencesDto,
  UserSettingsDto,
} from "../../../shared/types/domains/users/user.types";

export interface IUserAPI {
  create: (data: CreateUserDto) => Promise<UserDto>;
  getById: (id: string) => Promise<UserDto | null>;
  updateProfile: (id: string, data: UpdateUserDto) => Promise<void>;
  updateSettings: (id: string, settings: UserSettingsDto) => Promise<void>;
  getPreferences: (userId: string) => Promise<UserPreferencesDto | null>;
  delete: (id: string) => Promise<void>;
}

export function createUserAPI(): IUserAPI {
  return {
    create: createUser,
    getById: getUserById,
    updateProfile: updateUserProfile,
    updateSettings: updateUserSettings,
    getPreferences: getUserPreferences,
    delete: deleteUser,
  };
}

function createUser(data: CreateUserDto): Promise<UserDto> {
  return ipcRenderer.invoke("user:create", data);
}

function getUserById(id: string): Promise<UserDto | null> {
  return ipcRenderer.invoke("user:getById", { id });
}

function updateUserProfile(id: string, data: UpdateUserDto): Promise<void> {
  return ipcRenderer.invoke("user:updateProfile", { ...data, id });
}

function updateUserSettings(
  id: string,
  settings: UserSettingsDto,
): Promise<void> {
  return ipcRenderer.invoke("user:updateSettings", { id, settings });
}

function getUserPreferences(
  userId: string,
): Promise<UserPreferencesDto | null> {
  return ipcRenderer.invoke("user:getPreferences", { userId });
}

function deleteUser(id: string): Promise<void> {
  return ipcRenderer.invoke("user:delete", { id });
}
