import { ipcMain, IpcMainInvokeEvent } from "electron";

import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserSettingsDto,
  UserDto,
  UserPreferencesDto,
} from "../../../../shared/types/user.types";
import {
  createUser,
  findUserById,
  updateUserProfile,
  updateUserSettings,
  getUserPreferences,
  deleteUser,
} from "../../../domains/users/functions/user.functions";
import { userToDto, userPreferencesToDto } from "../../../domains/users/functions/user.mapper";

export class UserIpcHandlers {
  constructor() {}

  registerHandlers(): void {
    ipcMain.handle("user:create", this.handleCreateUser.bind(this));
    ipcMain.handle("user:getById", this.handleGetUserById.bind(this));
    ipcMain.handle("user:updateProfile", this.handleUpdateProfile.bind(this));
    ipcMain.handle("user:updateSettings", this.handleUpdateSettings.bind(this));
    ipcMain.handle("user:getPreferences", this.handleGetPreferences.bind(this));
    ipcMain.handle("user:delete", this.handleDeleteUser.bind(this));
  }

  private async handleCreateUser(
    event: IpcMainInvokeEvent,
    data: CreateUserDto,
  ): Promise<UserDto> {
    try {
      const user = await createUser({
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      });
      
      // For now, we need to create a UserDto from the domain entity
      // This will be improved when we have better integration
      return {
        id: user.getId().getValue(),
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        settings: user.getSettings().getValue(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  private async handleGetUserById(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<UserDto | null> {
    try {
      const user = await findUserById(data.id);
      if (!user) {
        return null;
      }
      
      return {
        id: user.getId().getValue(),
        name: "User", // TODO: store name in entity or fetch from DB
        settings: user.getSettings().getValue(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${(error as Error).message}`);
    }
  }

  private async handleUpdateProfile(
    event: IpcMainInvokeEvent,
    data: UpdateUserDto,
  ): Promise<void> {
    try {
      await updateUserProfile(data.id, {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      });
    } catch (error) {
      throw new Error(`Failed to update user profile: ${(error as Error).message}`);
    }
  }

  private async handleUpdateSettings(
    event: IpcMainInvokeEvent,
    data: UpdateUserSettingsDto,
  ): Promise<void> {
    try {
      const { UserSettings } = await import("../../../domains/users/value-objects");
      const userSettings = new UserSettings(data.settings);
      await updateUserSettings(data.id, userSettings);
    } catch (error) {
      throw new Error(`Failed to update user settings: ${(error as Error).message}`);
    }
  }

  private async handleGetPreferences(
    event: IpcMainInvokeEvent,
    data: { userId: string },
  ): Promise<UserPreferencesDto | null> {
    try {
      const preferences = await getUserPreferences(data.userId);
      return preferences ? userPreferencesToDto(preferences) : null;
    } catch (error) {
      throw new Error(`Failed to get user preferences: ${(error as Error).message}`);
    }
  }

  private async handleDeleteUser(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<void> {
    try {
      await deleteUser(data.id);
    } catch (error) {
      throw new Error(`Failed to delete user: ${(error as Error).message}`);
    }
  }
}