import { IpcMainInvokeEvent } from "electron";
import {
  createUser,
  findUserById,
  updateUserProfile,
  updateUserSettings,
  getUserPreferences,
  deleteUser,
  userEntityToDto,
  userPreferencesToDto,
} from "../../domains/users/functions";

type CreateUserData = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  settings: {
    theme: "light" | "dark";
    language: string;
    notifications: {
      enabled: boolean;
      email: boolean;
      desktop: boolean;
    };
  };
};

type GetByIdData = {
  id: string;
};

type UpdateProfileData = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
};

type UpdateSettingsData = {
  id: string;
  settings: {
    theme: "light" | "dark";
    language: string;
    notifications: {
      enabled: boolean;
      email: boolean;
      desktop: boolean;
    };
  };
};

type GetPreferencesData = {
  userId: string;
};

export async function handleCreateUser(
  _: IpcMainInvokeEvent,
  data: CreateUserData,
) {
  const user = await createUser(data);
  return userEntityToDto(user);
}

export async function handleGetUserById(
  _: IpcMainInvokeEvent,
  data: GetByIdData,
) {
  const user = await findUserById(data.id);
  return user ? userEntityToDto(user) : null;
}

export async function handleUpdateUserProfile(
  _: IpcMainInvokeEvent,
  data: UpdateProfileData,
) {
  await updateUserProfile(data.id, data);
}

export async function handleUpdateUserSettings(
  _: IpcMainInvokeEvent,
  data: UpdateSettingsData,
) {
  await updateUserSettings(data.id, data.settings);
}

export async function handleGetUserPreferences(
  _: IpcMainInvokeEvent,
  data: GetPreferencesData,
) {
  const preferences = await getUserPreferences(data.userId);
  return preferences ? userPreferencesToDto(preferences) : null;
}

export async function handleDeleteUser(
  _: IpcMainInvokeEvent,
  data: GetByIdData,
) {
  await deleteUser(data.id);
}
